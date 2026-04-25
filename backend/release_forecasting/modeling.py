from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Tuple

import numpy as np
from xgboost import XGBRegressor

from .metrics import wape


@dataclass
class ModelSelectionResult:
    model: XGBRegressor
    model_name: str
    val_scores: Dict[str, float]


def _predict_counts(model: XGBRegressor, X: np.ndarray) -> np.ndarray:
    pred_log = model.predict(X)
    pred = np.expm1(pred_log)
    return np.clip(pred, a_min=0.0, a_max=None)


def train_xgb_with_selection(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    candidate_configs: Iterable[dict],
    random_seed: int,
) -> ModelSelectionResult:
    y_train_log = np.log1p(y_train)
    y_val_log = np.log1p(y_val)

    best_model: XGBRegressor | None = None
    best_name = ""
    best_score = float("inf")
    val_scores: Dict[str, float] = {}

    for candidate in candidate_configs:
        name = candidate["name"]
        params = candidate["params"]

        model = XGBRegressor(
            objective="reg:squarederror",
            random_state=random_seed,
            n_jobs=-1,
            tree_method="hist",
            early_stopping_rounds=40,
            **params,
        )

        model.fit(
            X_train,
            y_train_log,
            eval_set=[(X_val, y_val_log)],
            verbose=False,
        )

        pred_val = _predict_counts(model=model, X=X_val)
        score = wape(y_val, pred_val)
        val_scores[name] = score
        if score < best_score:
            best_score = score
            best_model = model
            best_name = name

    if best_model is None:
        raise RuntimeError("No model candidates were trained.")

    return ModelSelectionResult(model=best_model, model_name=best_name, val_scores=val_scores)


def predict_counts(model: XGBRegressor, X: np.ndarray) -> np.ndarray:
    return _predict_counts(model=model, X=X)

