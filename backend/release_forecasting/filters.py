from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence, Set, Tuple

import numpy as np

from .config import BASE_FILTER_FIELDS, DATA_FIELD_BY_FILTER_FIELD
from .types import FilterSeries, FilterSpec, PreparedData


def build_filter_mask(data: PreparedData, spec: FilterSpec) -> np.ndarray:
    mask = np.ones(data.game_count, dtype=bool)
    for filter_field in BASE_FILTER_FIELDS:
        selected = getattr(spec, filter_field)
        if not selected:
            continue

        data_field = DATA_FIELD_BY_FILTER_FIELD[filter_field]
        field_masks = data.token_masks[data_field]

        selected_mask = np.zeros(data.game_count, dtype=bool)
        for token in selected:
            token_mask = field_masks.get(token)
            if token_mask is not None:
                selected_mask |= token_mask

        if not selected_mask.any():
            return selected_mask

        mask &= selected_mask
        if not mask.any():
            return mask
    return mask


def count_series_for_filter(data: PreparedData, spec: FilterSpec) -> FilterSeries:
    mask = build_filter_mask(data, spec)
    matched_games = int(mask.sum())
    counts = np.bincount(data.month_idx[mask], minlength=len(data.month_labels)).astype(np.float32)
    return FilterSeries(spec=spec, matched_games=matched_games, series=counts)


@dataclass
class FilterSamplingStats:
    requested: int
    accepted: int
    duplicates: int
    too_small: int
    attempts: int


def _weighted_choice_without_replacement(
    rng: np.random.Generator,
    candidates: Sequence[str],
    probs: np.ndarray,
    k: int,
) -> Tuple[str, ...]:
    if k >= len(candidates):
        return tuple(sorted(candidates))
    indices = rng.choice(len(candidates), size=k, replace=False, p=probs)
    return tuple(sorted(candidates[i] for i in indices))


def _build_field_pools(
    data: PreparedData,
    min_games_per_token: int,
) -> Dict[str, Tuple[List[str], np.ndarray]]:
    pools: Dict[str, Tuple[List[str], np.ndarray]] = {}
    for filter_field in BASE_FILTER_FIELDS:
        data_field = DATA_FIELD_BY_FILTER_FIELD[filter_field]
        freq = data.token_freq[data_field]
        items = [(token, count) for token, count in freq.items() if count >= min_games_per_token]
        items.sort(key=lambda x: x[1], reverse=True)
        if not items:
            pools[filter_field] = ([], np.array([], dtype=np.float64))
            continue
        tokens = [token for token, _ in items]
        weights = np.asarray([count for _, count in items], dtype=np.float64) ** 0.75
        probs = weights / weights.sum()
        pools[filter_field] = (tokens, probs)
    return pools


def sample_filter_specs(
    data: PreparedData,
    max_filters: int,
    min_games_per_filter: int,
    min_games_per_token: int,
    max_values_per_field: int,
    seed: int,
) -> Tuple[List[FilterSpec], FilterSamplingStats]:
    rng = np.random.default_rng(seed)
    pools = _build_field_pools(data=data, min_games_per_token=min_games_per_token)

    accepted: List[FilterSpec] = []
    signatures: Set[str] = set()
    duplicates = 0
    too_small = 0
    attempts = 0

    # Always include global "no filter" series.
    root = FilterSpec()
    accepted.append(root)
    signatures.add(root.signature())

    # Add single-token filters first for coverage.
    for field in BASE_FILTER_FIELDS:
        tokens, _ = pools[field]
        for token in tokens:
            if len(accepted) >= max_filters:
                break
            kwargs = {f: () for f in BASE_FILTER_FIELDS}
            kwargs[field] = (token,)
            spec = FilterSpec(**kwargs)
            sig = spec.signature()
            if sig in signatures:
                continue
            series = count_series_for_filter(data, spec)
            if series.matched_games < min_games_per_filter:
                too_small += 1
                continue
            accepted.append(spec)
            signatures.add(sig)
        if len(accepted) >= max_filters:
            break

    # Fill the rest with random multi-field combinations.
    field_counts = np.asarray([1, 2, 3, 4], dtype=np.int8)
    field_count_probs = np.asarray([0.35, 0.35, 0.22, 0.08], dtype=np.float64)
    values_count_options = np.asarray([1, 2, 3], dtype=np.int8)
    values_count_probs = np.asarray([0.68, 0.24, 0.08], dtype=np.float64)

    max_attempts = max_filters * 50
    while len(accepted) < max_filters and attempts < max_attempts:
        attempts += 1
        chosen_field_count = int(rng.choice(field_counts, p=field_count_probs))
        chosen_fields = rng.choice(BASE_FILTER_FIELDS, size=chosen_field_count, replace=False)

        kwargs = {field: () for field in BASE_FILTER_FIELDS}
        valid = True
        for field in chosen_fields:
            tokens, probs = pools[field]
            if not tokens:
                valid = False
                break
            max_k = min(max_values_per_field, len(tokens))
            possible_k = values_count_options[values_count_options <= max_k]
            possible_p = values_count_probs[: len(possible_k)]
            possible_p = possible_p / possible_p.sum()
            k = int(rng.choice(possible_k, p=possible_p))
            kwargs[field] = _weighted_choice_without_replacement(rng, tokens, probs, k)

        if not valid:
            continue

        spec = FilterSpec(**kwargs)
        sig = spec.signature()
        if sig in signatures:
            duplicates += 1
            continue

        series = count_series_for_filter(data, spec)
        if series.matched_games < min_games_per_filter:
            too_small += 1
            continue

        accepted.append(spec)
        signatures.add(sig)

    stats = FilterSamplingStats(
        requested=max_filters,
        accepted=len(accepted),
        duplicates=duplicates,
        too_small=too_small,
        attempts=attempts,
    )
    return accepted, stats


def materialize_filter_series(data: PreparedData, specs: Sequence[FilterSpec]) -> List[FilterSeries]:
    return [count_series_for_filter(data=data, spec=spec) for spec in specs]

