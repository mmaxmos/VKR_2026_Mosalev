from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Tuple

import numpy as np
import pandas as pd

from .types import FilterSpec, PreparedData


def canonicalize_token(value: str) -> str:
    return " ".join(str(value).strip().lower().split())


def parse_release_date(raw: str) -> datetime:
    value = str(raw).strip()
    for fmt in ("%b %d, %Y", "%Y-%m-%d", "%b %Y"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unsupported release_date format: {raw!r}")


def normalize_multi_value(raw: object) -> List[str]:
    if raw is None:
        return []
    if isinstance(raw, dict):
        values = raw.keys()
    elif isinstance(raw, list):
        values = raw
    elif isinstance(raw, str):
        if not raw.strip():
            return []
        values = raw.replace(";", ",").split(",")
    else:
        return []

    result = []
    for item in values:
        token = canonicalize_token(str(item))
        if token:
            result.append(token)
    return result


def _month_labels(start_dt: datetime, end_dt: datetime) -> Tuple[str, ...]:
    months = pd.period_range(start=start_dt.strftime("%Y-%m"), end=end_dt.strftime("%Y-%m"), freq="M")
    return tuple(str(m) for m in months)


def _drop_partial_month_if_needed(
    month_labels: Tuple[str, ...],
    max_date: datetime,
    partial_month_day_cutoff: int,
) -> Tuple[Tuple[str, ...], str | None]:
    if not month_labels:
        return month_labels, None
    last_month = month_labels[-1]
    if max_date.day <= partial_month_day_cutoff:
        return month_labels[:-1], last_month
    return month_labels, None


def _build_token_masks(
    token_lists_by_game: Sequence[Sequence[str]],
    game_count: int,
) -> Tuple[Dict[str, np.ndarray], Dict[str, int]]:
    index_map: Dict[str, List[int]] = defaultdict(list)
    for game_idx, values in enumerate(token_lists_by_game):
        for token in values:
            index_map[token].append(game_idx)

    token_masks: Dict[str, np.ndarray] = {}
    token_freq: Dict[str, int] = {}
    for token, indices in index_map.items():
        mask = np.zeros(game_count, dtype=bool)
        mask[np.asarray(indices, dtype=np.int32)] = True
        token_masks[token] = mask
        token_freq[token] = len(indices)
    return token_masks, token_freq


def load_prepared_data(
    data_path: Path,
    partial_month_day_cutoff: int = 7,
) -> PreparedData:
    with data_path.open("r", encoding="utf-8") as fp:
        raw = json.load(fp)

    fields = ("genres", "tags", "categories", "supported_languages")
    games: List[dict] = []
    dates: List[datetime] = []

    for game in raw.values():
        release_dt = parse_release_date(game.get("release_date"))
        normalized = {field: sorted(set(normalize_multi_value(game.get(field)))) for field in fields}
        games.append(normalized)
        dates.append(release_dt)

    if not dates:
        raise ValueError("No records with release dates found in the dataset.")

    min_date = min(dates)
    max_date = max(dates)
    all_month_labels = _month_labels(min_date, max_date)
    final_month_labels, dropped_partial = _drop_partial_month_if_needed(
        month_labels=all_month_labels,
        max_date=max_date,
        partial_month_day_cutoff=partial_month_day_cutoff,
    )

    if not final_month_labels:
        raise ValueError("All months were dropped as partial. Check partial_month_day_cutoff.")

    allowed_months = set(final_month_labels)
    month_index = {month: idx for idx, month in enumerate(final_month_labels)}

    kept_games: List[dict] = []
    month_idx: List[int] = []
    for game, release_dt in zip(games, dates):
        month_label = release_dt.strftime("%Y-%m")
        if month_label not in allowed_months:
            continue
        kept_games.append(game)
        month_idx.append(month_index[month_label])

    if not kept_games:
        raise ValueError("No games left after dropping the partial month.")

    game_count = len(kept_games)
    month_idx_arr = np.asarray(month_idx, dtype=np.int16)

    token_masks: Dict[str, Dict[str, np.ndarray]] = {}
    token_freq: Dict[str, Dict[str, int]] = {}

    for field in fields:
        token_lists = [game[field] for game in kept_games]
        field_masks, field_freq = _build_token_masks(token_lists_by_game=token_lists, game_count=game_count)
        token_masks[field] = field_masks
        token_freq[field] = field_freq

    return PreparedData(
        month_labels=final_month_labels,
        month_idx=month_idx_arr,
        token_masks=token_masks,
        token_freq=token_freq,
        game_count=game_count,
        dropped_partial_month=dropped_partial,
    )


def normalize_filter_spec(payload: Dict[str, Iterable[str]]) -> FilterSpec:
    def _norm(values: Iterable[str] | None) -> Tuple[str, ...]:
        if not values:
            return ()
        uniq = sorted({canonicalize_token(v) for v in values if canonicalize_token(v)})
        return tuple(uniq)

    return FilterSpec(
        genres=_norm(payload.get("genres")),
        tags=_norm(payload.get("tags")),
        categories=_norm(payload.get("categories")),
        languages=_norm(payload.get("languages")),
    )
