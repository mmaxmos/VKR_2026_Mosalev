from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

import numpy as np


@dataclass(frozen=True)
class FilterSpec:
    genres: Tuple[str, ...] = ()
    tags: Tuple[str, ...] = ()
    categories: Tuple[str, ...] = ()
    languages: Tuple[str, ...] = ()

    def signature(self) -> str:
        parts = []
        for field in ("genres", "tags", "categories", "languages"):
            values = getattr(self, field)
            joined = "|".join(sorted(values))
            parts.append(f"{field}:{joined}")
        return ";".join(parts)

    def selected_counts(self) -> Dict[str, int]:
        return {
            "genres": len(self.genres),
            "tags": len(self.tags),
            "categories": len(self.categories),
            "languages": len(self.languages),
        }

    def to_dict(self) -> Dict[str, list]:
        return {
            "genres": list(self.genres),
            "tags": list(self.tags),
            "categories": list(self.categories),
            "languages": list(self.languages),
        }


@dataclass
class PreparedData:
    month_labels: Tuple[str, ...]
    month_idx: np.ndarray
    token_masks: Dict[str, Dict[str, np.ndarray]]
    token_freq: Dict[str, Dict[str, int]]
    game_count: int
    dropped_partial_month: str | None


@dataclass
class FilterSeries:
    spec: FilterSpec
    matched_games: int
    series: np.ndarray

