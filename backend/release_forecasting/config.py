from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Tuple


BASE_FILTER_FIELDS: Tuple[str, ...] = ("genres", "tags", "categories", "languages")
DATA_FIELD_BY_FILTER_FIELD: Dict[str, str] = {
    "genres": "genres",
    "tags": "tags",
    "categories": "categories",
    "languages": "supported_languages",
}
HORIZONS: Tuple[int, ...] = (3, 6, 9, 12, 24)
SEASONAL_PERIOD: int = 12


@dataclass
class TrainingConfig:
    data_path: Path
    artifacts_dir: Path
    horizons: Tuple[int, ...] = HORIZONS
    random_seed: int = 42
    max_filters: int = 1400
    min_games_per_filter: int = 40
    min_games_per_token: int = 20
    max_values_per_field: int = 3
    max_lag: int = 24
    test_months: int = 24
    val_months: int = 12
    partial_month_day_cutoff: int = 7
    max_samples_per_horizon: int | None = None
    model_candidates: List[dict] = field(
        default_factory=lambda: [
            {
                "name": "xgb_medium",
                "params": {
                    "n_estimators": 600,
                    "learning_rate": 0.05,
                    "max_depth": 6,
                    "subsample": 0.85,
                    "colsample_bytree": 0.85,
                    "reg_lambda": 1.0,
                    "min_child_weight": 5.0,
                },
            },
            {
                "name": "xgb_deep",
                "params": {
                    "n_estimators": 800,
                    "learning_rate": 0.04,
                    "max_depth": 8,
                    "subsample": 0.8,
                    "colsample_bytree": 0.8,
                    "reg_lambda": 1.5,
                    "min_child_weight": 8.0,
                },
            },
        ]
    )

