from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, Iterable

import joblib
import numpy as np

from .config import HORIZONS
from .data import normalize_filter_spec, load_prepared_data
from .features import build_feature_vector, seasonal_naive_forecast
from .filters import count_series_for_filter
from .modeling import predict_counts


def _load_filter_payload(raw: str) -> Dict[str, Iterable[str]]:
    possible_path = Path(raw)
    if possible_path.exists():
        return json.loads(possible_path.read_text(encoding="utf-8-sig"))
    return json.loads(raw)


def _load_metadata(artifacts_dir: Path) -> dict:
    path = artifacts_dir / "metadata.json"
    if not path.exists():
        raise FileNotFoundError(f"metadata.json not found in {artifacts_dir}")
    return json.loads(path.read_text(encoding="utf-8"))


def predict_for_filter(
    data_path: Path,
    artifacts_dir: Path,
    raw_filter_payload: Dict[str, Iterable[str]],
) -> Dict[str, object]:
    metadata = _load_metadata(artifacts_dir)
    partial_cutoff = int(metadata["training_config"]["partial_month_day_cutoff"])
    data = load_prepared_data(data_path=data_path, partial_month_day_cutoff=partial_cutoff)

    spec = normalize_filter_spec(raw_filter_payload)
    fs = count_series_for_filter(data=data, spec=spec)
    t_idx = len(fs.series) - 1

    if t_idx < 23:
        raise ValueError("Not enough monthly history for feature extraction (need at least 24 months).")

    horizons = metadata.get("horizons", list(HORIZONS))
    forecast = {}
    for horizon in horizons:
        model_path = artifacts_dir / "models" / f"h{horizon}_xgb.joblib"
        if not model_path.exists():
            raise FileNotFoundError(f"Model file missing: {model_path}")
        model = joblib.load(model_path)
        X = build_feature_vector(series=fs.series, spec=spec, t_idx=t_idx, horizon=int(horizon)).reshape(1, -1)
        y_hat_model = float(predict_counts(model, X)[0])
        y_hat_baseline = float(seasonal_naive_forecast(series=fs.series, t_idx=t_idx, horizon=int(horizon)))
        blend_alpha = float(metadata["horizon_results"][str(horizon)].get("blend_alpha", 1.0))
        y_hat = blend_alpha * y_hat_model + (1.0 - blend_alpha) * y_hat_baseline
        forecast[str(horizon)] = y_hat

    return {
        "filter": spec.to_dict(),
        "matched_games": fs.matched_games,
        "history_last_month": data.month_labels[-1],
        "forecast": forecast,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run horizon forecasts for a user filter.")
    parser.add_argument("--data-path", type=Path, required=True, help="Path to games.json")
    parser.add_argument("--artifacts-dir", type=Path, default=Path("release_forecasting") / "artifacts")
    parser.add_argument(
        "--filter",
        type=str,
        required=True,
        help=(
            "JSON string or path to JSON file. Example: "
            '\'{"genres":["Action"],"tags":["singleplayer"],"categories":[],"languages":["english"]}\''
        ),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    payload = _load_filter_payload(args.filter)
    result = predict_for_filter(
        data_path=args.data_path,
        artifacts_dir=args.artifacts_dir,
        raw_filter_payload=payload,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
