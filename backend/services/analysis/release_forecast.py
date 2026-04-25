from __future__ import annotations

import json
import logging
import os
import threading
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import anyio
import joblib
import numpy as np
import pandas as pd

from release_forecasting.data import normalize_filter_spec
from release_forecasting.features import build_feature_vector, seasonal_naive_forecast
from release_forecasting.modeling import predict_counts
from schemas.request import ReleaseForecastRequest
from schemas.response import ReleaseForecastPoint, ReleaseForecastResponse

logger = logging.getLogger(__name__)

SUPPORTED_HORIZONS: Tuple[int, ...] = (3, 6, 9, 12, 24)
MIN_HISTORY_POINTS: int = 24
MAX_HISTORY_POINTS: int = 600
TAIL_CHECK_WINDOW: int = 6
MIN_REF_VALUE: float = 8.0
UNDERCOUNT_RATIO: float = 0.7
LAST_MONTH_RATIO: float = 0.9
LAST_MONTH_SHORT_TERM_RATIO: float = 0.85
MIN_FLAGGED_MONTHS: int = 3
TAIL_BLEND_ALPHA: float = 0.75
MAX_REF_OVERSHOOT: float = 1.05
TERMINAL_SHOCK_RATIO: float = 0.35


class ForecastModelLoadError(RuntimeError):
    pass


class ForecastInputError(ValueError):
    pass


class ForecastInsufficientDataError(ForecastInputError):
    pass


@dataclass
class ForecastModelBundle:
    models: Dict[int, object]
    blend_alpha: Dict[int, float]
    metadata: Dict[str, object]
    artifacts_dir: Path


_bundle_lock = threading.Lock()
_bundle_cache: ForecastModelBundle | None = None


@dataclass
class TailStabilizationInfo:
    applied: bool
    reason: str
    adjusted_months: List[str]
    candidate_months: int
    flagged_months: int


def _backend_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _default_artifacts_dir() -> Path:
    return _backend_root() / "release_forecasting" / "artifacts"


def _resolve_artifacts_dir() -> Path:
    from_env = os.getenv("RELEASE_FORECAST_ARTIFACTS_DIR", "").strip()
    if from_env:
        env_path = Path(from_env)
        if not env_path.is_absolute():
            env_path = (_backend_root() / env_path).resolve()
        return env_path
    return _default_artifacts_dir()


def _resolve_model_path(raw_path: str, artifacts_dir: Path, horizon: int) -> Path:
    model_path = Path(raw_path)
    if model_path.is_absolute() and model_path.exists():
        return model_path

    backend_root = _backend_root()
    candidate_from_backend = (backend_root / model_path).resolve()
    if candidate_from_backend.exists():
        return candidate_from_backend

    candidate_from_artifacts = (artifacts_dir / "models" / f"h{horizon}_xgb.joblib").resolve()
    if candidate_from_artifacts.exists():
        return candidate_from_artifacts

    raise ForecastModelLoadError(f"Model file not found for horizon={horizon}: {raw_path}")


def _load_bundle() -> ForecastModelBundle:
    artifacts_dir = _resolve_artifacts_dir()
    metadata_path = artifacts_dir / "metadata.json"
    if not metadata_path.exists():
        raise ForecastModelLoadError(f"Metadata file not found: {metadata_path}")

    with metadata_path.open("r", encoding="utf-8") as fp:
        metadata = json.load(fp)

    horizon_results = metadata.get("horizon_results", {})
    if not horizon_results:
        raise ForecastModelLoadError("metadata.json does not contain horizon_results.")

    models: Dict[int, object] = {}
    blend_alpha: Dict[int, float] = {}
    for horizon in SUPPORTED_HORIZONS:
        h_key = str(horizon)
        if h_key not in horizon_results:
            continue
        model_info = horizon_results[h_key]
        model_path = _resolve_model_path(
            raw_path=str(model_info.get("model_path", "")),
            artifacts_dir=artifacts_dir,
            horizon=horizon,
        )
        models[horizon] = joblib.load(model_path)
        blend_alpha[horizon] = float(model_info.get("blend_alpha", 1.0))

    if not models:
        raise ForecastModelLoadError("No models were loaded from artifacts.")

    return ForecastModelBundle(
        models=models,
        blend_alpha=blend_alpha,
        metadata=metadata,
        artifacts_dir=artifacts_dir,
    )


def _get_bundle() -> ForecastModelBundle:
    global _bundle_cache
    if _bundle_cache is not None:
        return _bundle_cache

    with _bundle_lock:
        if _bundle_cache is None:
            _bundle_cache = _load_bundle()
            logger.info(
                "Release forecast models loaded from %s (horizons=%s)",
                _bundle_cache.artifacts_dir,
                sorted(_bundle_cache.models.keys()),
            )
    return _bundle_cache


def _validate_horizons(raw_horizons: Iterable[int] | None, loaded_horizons: Iterable[int]) -> List[int]:
    loaded = sorted(set(int(h) for h in loaded_horizons))
    if raw_horizons is None:
        return loaded

    requested = sorted(set(int(h) for h in raw_horizons))
    unsupported = [h for h in requested if h not in SUPPORTED_HORIZONS]
    if unsupported:
        raise ForecastInputError(f"Unsupported horizons requested: {unsupported}")

    unavailable = [h for h in requested if h not in loaded]
    if unavailable:
        raise ForecastInputError(f"Models are unavailable for horizons: {unavailable}")

    if not requested:
        raise ForecastInputError("At least one horizon is required.")
    return requested


def _to_dense_monthly_series(months: List[str], values: List[float]) -> Tuple[np.ndarray, pd.Period]:
    if len(months) != len(values):
        raise ForecastInputError("History x/y length mismatch.")
    if len(months) == 0:
        raise ForecastInputError("History is empty.")
    if len(months) > MAX_HISTORY_POINTS:
        raise ForecastInputError(
            f"History is too long: max supported points is {MAX_HISTORY_POINTS}, got {len(months)}."
        )

    parsed_periods: List[pd.Period] = []
    parsed_values: List[float] = []

    for raw_month, raw_value in zip(months, values):
        month_str = str(raw_month).strip()
        try:
            period = pd.Period(month_str, freq="M")
        except Exception as exc:
            raise ForecastInputError(f"Invalid month format: {raw_month!r}") from exc

        try:
            value = float(raw_value)
        except Exception as exc:
            raise ForecastInputError(f"Invalid numeric value in history: {raw_value!r}") from exc

        parsed_periods.append(period)
        parsed_values.append(max(0.0, value))

    df = pd.DataFrame({"period": parsed_periods, "value": parsed_values})
    dense = df.groupby("period", as_index=False)["value"].sum().sort_values("period")

    start = dense["period"].iloc[0]
    end = dense["period"].iloc[-1]
    full_index = pd.period_range(start=start, end=end, freq="M")
    dense = dense.set_index("period").reindex(full_index, fill_value=0.0).reset_index()
    dense.columns = ["period", "value"]

    if len(dense) < MIN_HISTORY_POINTS:
        raise ForecastInsufficientDataError(
            f"Not enough history points for forecast: need at least {MIN_HISTORY_POINTS}, got {len(dense)}."
        )

    return dense["value"].to_numpy(dtype=np.float32), end


def _period_from_idx(end_period: pd.Period, idx: int, size: int) -> pd.Period:
    return end_period - (size - 1 - idx)


def _stabilize_recent_tail(series: np.ndarray, end_period: pd.Period) -> Tuple[np.ndarray, TailStabilizationInfo]:
    if len(series) < MIN_HISTORY_POINTS:
        return series, TailStabilizationInfo(
            applied=False,
            reason="history_too_short",
            adjusted_months=[],
            candidate_months=0,
            flagged_months=0,
        )

    corrected = np.asarray(series, dtype=np.float32).copy()
    now_period = pd.Period(datetime.now(timezone.utc), freq="M")
    n = len(corrected)
    start_idx = max(12, n - TAIL_CHECK_WINDOW)

    candidate_indices: List[int] = []
    flagged_indices: List[int] = []
    ratios: List[float] = []

    for idx in range(start_idx, n):
        ref_val = float(corrected[idx - 12])
        if ref_val < MIN_REF_VALUE:
            continue
        cur_val = float(corrected[idx])
        ratio = cur_val / max(ref_val, 1e-6)
        candidate_indices.append(idx)
        ratios.append(ratio)
        if ratio < UNDERCOUNT_RATIO:
            flagged_indices.append(idx)

    sustained_undercount = (
        len(candidate_indices) >= MIN_FLAGGED_MONTHS
        and len(flagged_indices) >= MIN_FLAGGED_MONTHS
        and float(np.median(np.asarray(ratios, dtype=np.float32))) < 0.85
    )

    last_idx = n - 1
    last_month_partial = False
    terminal_shock = False
    if last_idx >= 1:
        terminal_recent_start = max(0, last_idx - 3)
        terminal_recent_mean = float(np.mean(corrected[terminal_recent_start:last_idx]))
        terminal_short_term_ratio = float(corrected[last_idx]) / max(terminal_recent_mean, 1e-6)
    else:
        terminal_short_term_ratio = 1.0

    if last_idx >= 12 and float(corrected[last_idx - 12]) >= MIN_REF_VALUE:
        terminal_yoy_ratio = float(corrected[last_idx]) / max(float(corrected[last_idx - 12]), 1e-6)
        terminal_shock = (
            terminal_yoy_ratio < TERMINAL_SHOCK_RATIO
            and terminal_short_term_ratio < TERMINAL_SHOCK_RATIO
        )

    if end_period == now_period:
        if last_idx >= 1:
            recent_start = max(0, last_idx - 3)
            recent_mean = float(np.mean(corrected[recent_start:last_idx]))
            short_term_ratio = float(corrected[last_idx]) / max(recent_mean, 1e-6)
        else:
            short_term_ratio = 1.0

        if last_idx >= 12 and float(corrected[last_idx - 12]) >= MIN_REF_VALUE:
            last_ratio = float(corrected[last_idx]) / max(float(corrected[last_idx - 12]), 1e-6)
            last_month_partial = last_ratio < LAST_MONTH_RATIO and short_term_ratio < LAST_MONTH_SHORT_TERM_RATIO
        elif n >= 2 and float(corrected[last_idx - 1]) >= MIN_REF_VALUE:
            prev_ratio = float(corrected[last_idx]) / max(float(corrected[last_idx - 1]), 1e-6)
            last_month_partial = prev_ratio < LAST_MONTH_RATIO and short_term_ratio < LAST_MONTH_SHORT_TERM_RATIO

    indices_to_fix = set(flagged_indices if sustained_undercount else [])
    if last_month_partial:
        indices_to_fix.add(last_idx)
    if terminal_shock:
        indices_to_fix.add(last_idx)

    if not indices_to_fix:
        return corrected, TailStabilizationInfo(
            applied=False,
            reason="no_tail_adjustment",
            adjusted_months=[],
            candidate_months=len(candidate_indices),
            flagged_months=len(flagged_indices),
        )

    adjusted_months: List[str] = []
    for idx in sorted(indices_to_fix):
        cur_val = float(corrected[idx])
        if idx >= 12 and float(corrected[idx - 12]) >= MIN_REF_VALUE:
            ref_val = float(corrected[idx - 12])
        elif idx >= 1:
            ref_val = float(corrected[idx - 1])
        else:
            continue

        if ref_val <= cur_val:
            continue

        blended = cur_val + TAIL_BLEND_ALPHA * (ref_val - cur_val)
        capped = min(blended, ref_val * MAX_REF_OVERSHOOT)
        corrected[idx] = float(max(cur_val, capped))
        adjusted_months.append(str(_period_from_idx(end_period=end_period, idx=idx, size=n)))

    if not adjusted_months:
        return corrected, TailStabilizationInfo(
            applied=False,
            reason="no_effective_tail_adjustment",
            adjusted_months=[],
            candidate_months=len(candidate_indices),
            flagged_months=len(flagged_indices),
        )

    reason = "sustained_recent_undercount"
    if last_month_partial and not sustained_undercount:
        reason = "current_month_partial"
    elif last_month_partial and sustained_undercount:
        reason = "current_month_partial_and_sustained_undercount"
    elif terminal_shock and not sustained_undercount:
        reason = "terminal_shock_outlier"

    return corrected, TailStabilizationInfo(
        applied=True,
        reason=reason,
        adjusted_months=adjusted_months,
        candidate_months=len(candidate_indices),
        flagged_months=len(flagged_indices),
    )


def _build_predictions_sync(request_data: ReleaseForecastRequest) -> ReleaseForecastResponse:
    if request_data.chartId and request_data.chartId != "release_dynamics":
        raise ForecastInputError("Forecast is available only for chartId='release_dynamics'.")

    bundle = _get_bundle()
    horizons = _validate_horizons(
        raw_horizons=request_data.horizons,
        loaded_horizons=bundle.models.keys(),
    )

    history_series, last_period = _to_dense_monthly_series(
        months=request_data.history.x,
        values=request_data.history.y,
    )
    history_series, tail_info = _stabilize_recent_tail(history_series, last_period)
    t_idx = len(history_series) - 1

    spec = normalize_filter_spec(
        {
            "genres": request_data.genres or [],
            "tags": request_data.tags or [],
            "categories": request_data.categories or [],
            "languages": request_data.languages or [],
        }
    )

    points: List[ReleaseForecastPoint] = []
    for horizon in horizons:
        model = bundle.models[horizon]
        feature_row = build_feature_vector(
            series=history_series,
            spec=spec,
            t_idx=t_idx,
            horizon=horizon,
        ).reshape(1, -1)
        model_pred = float(predict_counts(model, feature_row)[0])
        baseline_pred = float(seasonal_naive_forecast(history_series, t_idx=t_idx, horizon=horizon))
        alpha = float(bundle.blend_alpha.get(horizon, 1.0))
        final_pred = max(0.0, alpha * model_pred + (1.0 - alpha) * baseline_pred)
        target_month = str(last_period + horizon)
        points.append(ReleaseForecastPoint(horizon=horizon, month=target_month, value=float(final_pred)))

    return ReleaseForecastResponse(
        success=True,
        historyLastMonth=str(last_period),
        historyPoints=int(len(history_series)),
        predictions=points,
        meta={
            "model": "release_forecasting_xgb_v1",
            "artifacts_dir": str(bundle.artifacts_dir),
            "tail_stabilization": {
                "applied": tail_info.applied,
                "reason": tail_info.reason,
                "adjusted_months": tail_info.adjusted_months,
                "candidate_months": tail_info.candidate_months,
                "flagged_months": tail_info.flagged_months,
            },
        },
    )


async def build_release_forecast(request_data: ReleaseForecastRequest) -> ReleaseForecastResponse:
    return await anyio.to_thread.run_sync(_build_predictions_sync, request_data)
