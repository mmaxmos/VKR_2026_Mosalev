from __future__ import annotations

import argparse
import gc
import json
from dataclasses import asdict
from pathlib import Path
from typing import Dict, Tuple

import joblib
import numpy as np
from xgboost import XGBRegressor

from .config import BASE_FILTER_FIELDS, HORIZONS, TrainingConfig
from .data import load_prepared_data
from .features import SupervisedDataset, build_supervised_dataset, feature_names
from .filters import materialize_filter_series, sample_filter_specs
from .metrics import compute_metrics
from .metrics import wape as metric_wape
from .modeling import predict_counts, train_xgb_with_selection


def _to_serializable(value):
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, dict):
        return {k: _to_serializable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_to_serializable(v) for v in value]
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, np.generic):
        return value.item()
    return value


def _split_masks(
    dataset: SupervisedDataset,
    test_start_idx: int,
    val_start_idx: int,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    train_mask = dataset.target_month_idx < test_start_idx
    test_mask = dataset.target_month_idx >= test_start_idx
    val_mask = (dataset.target_month_idx >= val_start_idx) & train_mask
    core_train_mask = train_mask & (~val_mask)

    if not val_mask.any():
        raise ValueError("Validation split is empty. Increase history or decrease val_months.")
    if not core_train_mask.any():
        raise ValueError("Train split is empty. Increase history or decrease val_months.")
    if not test_mask.any():
        raise ValueError("Test split is empty. Increase history or decrease test_months.")
    return core_train_mask, val_mask, test_mask


def _subsample_rows(
    X: np.ndarray,
    y: np.ndarray,
    max_rows: int | None,
    rng: np.random.Generator,
) -> Tuple[np.ndarray, np.ndarray]:
    if max_rows is None or len(X) <= max_rows:
        return X, y
    idx = rng.choice(len(X), size=max_rows, replace=False)
    return X[idx], y[idx]


def _fit_final_model(
    candidate_params: dict,
    n_estimators: int,
    X_train: np.ndarray,
    y_train: np.ndarray,
    random_seed: int,
) -> XGBRegressor:
    params = {k: v for k, v in candidate_params.items() if k != "n_estimators"}
    model = XGBRegressor(
        objective="reg:squarederror",
        random_state=random_seed,
        n_jobs=-1,
        tree_method="hist",
        n_estimators=n_estimators,
        **params,
    )
    model.fit(X_train, np.log1p(y_train), verbose=False)
    return model


def run_training(config: TrainingConfig) -> Dict[str, object]:
    artifacts_dir = config.artifacts_dir
    models_dir = artifacts_dir / "models"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(parents=True, exist_ok=True)

    print("[1/6] Loading and preparing data...")
    prepared = load_prepared_data(
        data_path=config.data_path,
        partial_month_day_cutoff=config.partial_month_day_cutoff,
    )
    month_count = len(prepared.month_labels)
    print(
        f"Loaded {prepared.game_count} games, {month_count} full months "
        f"({prepared.month_labels[0]}..{prepared.month_labels[-1]})."
    )
    if prepared.dropped_partial_month:
        print(f"Dropped partial month: {prepared.dropped_partial_month}")

    if month_count <= config.test_months + config.val_months + config.max_lag + max(config.horizons):
        raise ValueError("Not enough monthly history for requested split and horizons.")

    print("[2/6] Sampling filter space...")
    specs, sampling_stats = sample_filter_specs(
        data=prepared,
        max_filters=config.max_filters,
        min_games_per_filter=config.min_games_per_filter,
        min_games_per_token=config.min_games_per_token,
        max_values_per_field=config.max_values_per_field,
        seed=config.random_seed,
    )
    filter_series_list = materialize_filter_series(data=prepared, specs=specs)
    print(f"Accepted filters: {len(filter_series_list)} (requested {config.max_filters}).")

    with (artifacts_dir / "filter_space.jsonl").open("w", encoding="utf-8") as fp:
        for fs in filter_series_list:
            record = {
                "filter": fs.spec.to_dict(),
                "matched_games": fs.matched_games,
            }
            fp.write(json.dumps(record, ensure_ascii=False) + "\n")

    test_start_idx = month_count - config.test_months
    val_start_idx = test_start_idx - config.val_months
    rng = np.random.default_rng(config.random_seed)

    f_names = feature_names()
    horizon_results: Dict[str, dict] = {}

    print("[3/6] Training horizon models...")
    for horizon in config.horizons:
        print(f"  - Horizon {horizon} months")
        dataset = build_supervised_dataset(
            filter_series_list=filter_series_list,
            horizon=horizon,
            max_lag=config.max_lag,
        )

        core_train_mask, val_mask, test_mask = _split_masks(
            dataset=dataset,
            test_start_idx=test_start_idx,
            val_start_idx=val_start_idx,
        )
        full_train_mask = core_train_mask | val_mask

        X_core_train = dataset.X[core_train_mask]
        y_core_train = dataset.y[core_train_mask]
        X_val = dataset.X[val_mask]
        y_val = dataset.y[val_mask]
        X_train_full = dataset.X[full_train_mask]
        y_train_full = dataset.y[full_train_mask]
        X_test = dataset.X[test_mask]
        y_test = dataset.y[test_mask]

        X_core_train, y_core_train = _subsample_rows(
            X=X_core_train,
            y=y_core_train,
            max_rows=config.max_samples_per_horizon,
            rng=rng,
        )

        selection = train_xgb_with_selection(
            X_train=X_core_train,
            y_train=y_core_train,
            X_val=X_val,
            y_val=y_val,
            candidate_configs=config.model_candidates,
            random_seed=config.random_seed,
        )

        chosen_params = None
        for candidate in config.model_candidates:
            if candidate["name"] == selection.model_name:
                chosen_params = candidate["params"]
                break
        if chosen_params is None:
            raise RuntimeError(f"Chosen model {selection.model_name!r} not found in candidates.")

        best_iter = int(getattr(selection.model, "best_iteration", selection.model.n_estimators - 1))
        final_n_estimators = max(50, best_iter + 1)
        final_model = _fit_final_model(
            candidate_params=chosen_params,
            n_estimators=final_n_estimators,
            X_train=X_train_full,
            y_train=y_train_full,
            random_seed=config.random_seed,
        )

        pred_train = predict_counts(final_model, X_train_full)
        pred_test = predict_counts(final_model, X_test)
        pred_val = predict_counts(final_model, X_val)
        baseline_train = dataset.baseline_pred[full_train_mask]
        baseline_test = dataset.baseline_pred[test_mask]
        baseline_val = dataset.baseline_pred[val_mask]

        alpha_grid = np.linspace(0.0, 1.0, 21)
        best_alpha = 1.0
        best_alpha_score = float("inf")
        for alpha in alpha_grid:
            blend_val = alpha * pred_val + (1.0 - alpha) * baseline_val
            score = metric_wape(y_val, blend_val)
            if score < best_alpha_score:
                best_alpha_score = score
                best_alpha = float(alpha)

        pred_train_blend = best_alpha * pred_train + (1.0 - best_alpha) * baseline_train
        pred_val_blend = best_alpha * pred_val + (1.0 - best_alpha) * baseline_val
        pred_test_blend = best_alpha * pred_test + (1.0 - best_alpha) * baseline_test

        metrics_model_train = compute_metrics(y_train_full, pred_train)
        metrics_model_val = compute_metrics(y_val, pred_val)
        metrics_model_test = compute_metrics(y_test, pred_test)
        metrics_model_blended_train = compute_metrics(y_train_full, pred_train_blend)
        metrics_model_blended_val = compute_metrics(y_val, pred_val_blend)
        metrics_model_blended_test = compute_metrics(y_test, pred_test_blend)
        metrics_baseline_train = compute_metrics(y_train_full, baseline_train)
        metrics_baseline_val = compute_metrics(y_val, baseline_val)
        metrics_baseline_test = compute_metrics(y_test, baseline_test)

        model_path = models_dir / f"h{horizon}_xgb.joblib"
        joblib.dump(final_model, model_path)

        horizon_results[str(horizon)] = {
            "model_path": str(model_path),
            "model_name": "xgboost",
            "selected_candidate": selection.model_name,
            "selected_candidate_val_wape": selection.val_scores[selection.model_name],
            "candidate_val_wape": selection.val_scores,
            "final_n_estimators": final_n_estimators,
            "blend_alpha": best_alpha,
            "rows": {
                "core_train": int(core_train_mask.sum()),
                "val": int(val_mask.sum()),
                "train_full": int(full_train_mask.sum()),
                "test": int(test_mask.sum()),
            },
            "metrics": {
                "model_raw": {
                    "train": metrics_model_train,
                    "val": metrics_model_val,
                    "test": metrics_model_test,
                },
                "model_blended": {
                    "train": metrics_model_blended_train,
                    "val": metrics_model_blended_val,
                    "test": metrics_model_blended_test,
                },
                "baseline_seasonal_naive": {
                    "train": metrics_baseline_train,
                    "val": metrics_baseline_val,
                    "test": metrics_baseline_test,
                },
                "improvement_test_wape_pct": (
                    (metrics_baseline_test["wape"] - metrics_model_blended_test["wape"])
                    / metrics_baseline_test["wape"]
                    * 100.0
                    if metrics_baseline_test["wape"] > 0
                    else 0.0
                ),
            },
        }

        del dataset, X_core_train, y_core_train, X_val, y_val, X_test, y_test, X_train_full, y_train_full
        gc.collect()

    print("[4/6] Saving metadata and metrics...")
    metadata = {
        "data_path": str(config.data_path),
        "month_labels": list(prepared.month_labels),
        "first_month": prepared.month_labels[0],
        "last_month": prepared.month_labels[-1],
        "dropped_partial_month": prepared.dropped_partial_month,
        "horizons": list(config.horizons),
        "feature_names": f_names,
        "base_filter_fields": list(BASE_FILTER_FIELDS),
        "training_config": _to_serializable(asdict(config)),
        "splits": {
            "test_months": config.test_months,
            "val_months": config.val_months,
            "test_start_idx": test_start_idx,
            "val_start_idx": val_start_idx,
            "test_start_month": prepared.month_labels[test_start_idx],
            "val_start_month": prepared.month_labels[val_start_idx],
        },
        "filters": {
            "count": len(filter_series_list),
            "sampling": _to_serializable(asdict(sampling_stats)),
        },
        "horizon_results": _to_serializable(horizon_results),
    }

    with (artifacts_dir / "metadata.json").open("w", encoding="utf-8") as fp:
        json.dump(metadata, fp, ensure_ascii=False, indent=2)

    with (artifacts_dir / "metrics.json").open("w", encoding="utf-8") as fp:
        json.dump({"horizons": horizon_results}, fp, ensure_ascii=False, indent=2)

    print("[5/6] Training complete.")
    print("Test WAPE (blended model vs baseline):")
    for horizon in config.horizons:
        hr = horizon_results[str(horizon)]["metrics"]
        model_wape = hr["model_blended"]["test"]["wape"]
        base_wape = hr["baseline_seasonal_naive"]["test"]["wape"]
        imp = hr["improvement_test_wape_pct"]
        print(f"  h={horizon:>2}: model={model_wape:.4f}, baseline={base_wape:.4f}, improvement={imp:.2f}%")

    print(f"[6/6] Artifacts saved to: {artifacts_dir}")
    return metadata


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train release-dynamics forecasting models.")
    parser.add_argument("--data-path", type=Path, required=True, help="Path to games.json")
    parser.add_argument(
        "--artifacts-dir",
        type=Path,
        default=Path("release_forecasting") / "artifacts",
        help="Directory to save models and metrics.",
    )
    parser.add_argument("--max-filters", type=int, default=1400)
    parser.add_argument("--min-games-per-filter", type=int, default=40)
    parser.add_argument("--min-games-per-token", type=int, default=20)
    parser.add_argument("--max-values-per-field", type=int, default=3)
    parser.add_argument("--max-lag", type=int, default=24)
    parser.add_argument("--test-months", type=int, default=24)
    parser.add_argument("--val-months", type=int, default=12)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--partial-month-day-cutoff", type=int, default=7)
    parser.add_argument(
        "--max-samples-per-horizon",
        type=int,
        default=None,
        help="Optional cap for train rows per horizon (before final fit).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = TrainingConfig(
        data_path=args.data_path,
        artifacts_dir=args.artifacts_dir,
        random_seed=args.seed,
        max_filters=args.max_filters,
        min_games_per_filter=args.min_games_per_filter,
        min_games_per_token=args.min_games_per_token,
        max_values_per_field=args.max_values_per_field,
        max_lag=args.max_lag,
        test_months=args.test_months,
        val_months=args.val_months,
        partial_month_day_cutoff=args.partial_month_day_cutoff,
        max_samples_per_horizon=args.max_samples_per_horizon,
    )
    run_training(cfg)


if __name__ == "__main__":
    main()
