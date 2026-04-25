from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence, Tuple

import numpy as np

from .config import SEASONAL_PERIOD
from .types import FilterSeries, FilterSpec


def feature_names() -> List[str]:
    return [
        "lag_1",
        "lag_2",
        "lag_3",
        "lag_6",
        "lag_12",
        "lag_24",
        "seasonal_naive_anchor",
        "roll_mean_3",
        "roll_mean_6",
        "roll_mean_12",
        "roll_std_3",
        "roll_std_6",
        "roll_std_12",
        "diff_1",
        "diff_3",
        "diff_12",
        "yoy_change_12",
        "active_ratio_12",
        "log_recent_sum_12",
        "selected_genres",
        "selected_tags",
        "selected_categories",
        "selected_languages",
        "selected_total",
        "time_idx_norm",
        "target_idx_norm",
        "target_month_sin",
        "target_month_cos",
    ]


def seasonal_naive_forecast(series: np.ndarray, t_idx: int, horizon: int, seasonal_period: int = SEASONAL_PERIOD) -> float:
    back_idx = t_idx + horizon - seasonal_period * math.ceil(horizon / seasonal_period)
    if back_idx < 0:
        back_idx = t_idx
    return float(series[back_idx])


def build_feature_vector(series: np.ndarray, spec: FilterSpec, t_idx: int, horizon: int) -> np.ndarray:
    last_3 = series[t_idx - 2 : t_idx + 1]
    last_6 = series[t_idx - 5 : t_idx + 1]
    last_12 = series[t_idx - 11 : t_idx + 1]

    selected_genres = len(spec.genres)
    selected_tags = len(spec.tags)
    selected_categories = len(spec.categories)
    selected_languages = len(spec.languages)
    selected_total = selected_genres + selected_tags + selected_categories + selected_languages

    target_month_num = ((t_idx + horizon) % 12) + 1
    angle = 2 * math.pi * target_month_num / 12.0
    seasonal_anchor = seasonal_naive_forecast(series=series, t_idx=t_idx, horizon=horizon)
    denom = float(series[t_idx - 12] + 1.0)
    yoy_change = float((series[t_idx] - series[t_idx - 12]) / denom)
    time_idx_norm = float(t_idx / max(1, len(series) - 1))
    target_idx_norm = float((t_idx + horizon) / max(1, len(series) - 1))

    return np.asarray(
        [
            float(series[t_idx]),
            float(series[t_idx - 1]),
            float(series[t_idx - 2]),
            float(series[t_idx - 5]),
            float(series[t_idx - 11]),
            float(series[t_idx - 23]),
            float(seasonal_anchor),
            float(last_3.mean()),
            float(last_6.mean()),
            float(last_12.mean()),
            float(last_3.std(ddof=0)),
            float(last_6.std(ddof=0)),
            float(last_12.std(ddof=0)),
            float(series[t_idx] - series[t_idx - 1]),
            float(series[t_idx] - series[t_idx - 3]),
            float(series[t_idx] - series[t_idx - 11]),
            yoy_change,
            float((last_12 > 0).mean()),
            float(math.log1p(last_12.sum())),
            float(selected_genres),
            float(selected_tags),
            float(selected_categories),
            float(selected_languages),
            float(selected_total),
            time_idx_norm,
            target_idx_norm,
            float(math.sin(angle)),
            float(math.cos(angle)),
        ],
        dtype=np.float32,
    )


@dataclass
class SupervisedDataset:
    X: np.ndarray
    y: np.ndarray
    target_month_idx: np.ndarray
    baseline_pred: np.ndarray
    filter_id: np.ndarray


def build_supervised_dataset(
    filter_series_list: Sequence[FilterSeries],
    horizon: int,
    max_lag: int,
) -> SupervisedDataset:
    rows: List[np.ndarray] = []
    target: List[float] = []
    target_month_idx: List[int] = []
    baseline_pred: List[float] = []
    filter_id: List[int] = []

    for fs_idx, fs in enumerate(filter_series_list):
        series = fs.series
        max_t = len(series) - horizon - 1
        min_t = max_lag - 1
        if max_t < min_t:
            continue

        for t_idx in range(min_t, max_t + 1):
            rows.append(build_feature_vector(series=series, spec=fs.spec, t_idx=t_idx, horizon=horizon))
            target.append(float(series[t_idx + horizon]))
            target_month_idx.append(t_idx + horizon)
            baseline_pred.append(seasonal_naive_forecast(series=series, t_idx=t_idx, horizon=horizon))
            filter_id.append(fs_idx)

    if not rows:
        raise ValueError(f"No supervised samples were built for horizon={horizon}.")

    return SupervisedDataset(
        X=np.vstack(rows).astype(np.float32),
        y=np.asarray(target, dtype=np.float32),
        target_month_idx=np.asarray(target_month_idx, dtype=np.int16),
        baseline_pred=np.asarray(baseline_pred, dtype=np.float32),
        filter_id=np.asarray(filter_id, dtype=np.int32),
    )
