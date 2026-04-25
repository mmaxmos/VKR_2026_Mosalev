import logging
from typing import Any, List

from fastapi import HTTPException

from utils.database import db
from schemas.response import GameDetails, GameSearchResult

logger = logging.getLogger(__name__)


def _parse_delimited_list(value: Any) -> List[str]:
    if not value:
        return []
    parts: List[str] = []
    for chunk in str(value).split(";"):
        for sub in chunk.split(","):
            item = sub.strip()
            if item:
                parts.append(item)
    return parts


def _format_currency(value: float) -> str:
    if not value:
        return "—"
    if value >= 1_000_000:
        return f"${value / 1_000_000:.1f}M"
    if value >= 1_000:
        return f"${value / 1_000:.1f}K"
    return f"${value:.2f}"


def _format_number(value: Any) -> str:
    if not value:
        return "—"
    try:
        val = float(value)
        if val >= 1_000_000:
            return f"{val / 1_000_000:.1f}M"
        if val >= 1_000:
            return f"{val / 1_000:.0f}K"
        return f"{int(val)}"
    except Exception:
        return "0"


async def get_game_details_by_id(game_id: int) -> GameDetails:
    query = """
        SELECT
            mg.appid as id,
            mg."Name" as title,
            mg."Header image" as image,
            COALESCE(ROUND((mg.positive::float / NULLIF(mg.positive + mg.negative, 0) * 100)::numeric, 0), 0) as positiveReviewPercent,
            COALESCE(mg.positive + mg.negative, 0) as reviewCount,
            COALESCE(mg.revenue, 0) as revenue,
            COALESCE(mg."Peak CCU", 0) as downloads,
            mg."Release date" as releaseDate,
            mg.price,
            mg."About the game" as description,
            mg.tags,
            mg.genres,
            mg.categories,
            mg."publisherclass" as publisherClass,
            mg.developers as developer,
            mg.publishers as publisher,
            mg."Peak CCU" as peakCCU
        FROM main_games mg
        WHERE mg.appid = $1
        LIMIT 1
    """

    try:
        results = await db.execute_query(query, (game_id,))
    except Exception as exc:
        logger.error(f"Database error while fetching game details: {exc}")
        raise HTTPException(status_code=503, detail="Database service temporarily unavailable")

    if not results:
        raise HTTPException(status_code=404, detail="Game not found")

    game = results[0]
    tags = _parse_delimited_list(game.get("tags"))
    genres = _parse_delimited_list(game.get("genres"))
    categories = _parse_delimited_list(game.get("categories"))

    revenue_val = float(game.get("revenue")) if game.get("revenue") is not None else 0
    price_val = float(game.get("price")) if game.get("price") is not None else 0

    return GameDetails(
        id=game.get("id"),
        title=game.get("title") or "—",
        image=game.get("image") or "—",
        positiveReviewPercent=(
            f"{int(game.get('positivereviewpercent'))}%"
            if game.get("positivereviewpercent") is not None
            else "—"
        ),
        reviewCount=_format_number(game.get("reviewcount")),
        revenue=_format_currency(revenue_val),
        downloads=_format_number(game.get("downloads")),
        releaseDate=game.get("releasedate") if game.get("releasedate") is not None else "—",
        price=_format_currency(price_val),
        description=game.get("description") if game.get("description") is not None else "—",
        tags=tags,
        similarity="—",
        peakCCU=_format_number(game.get("peakccu")),
        developer=game.get("developer") if game.get("developer") is not None else "—",
        publisherClass=game.get("publisherclass") if game.get("publisherclass") is not None else "—",
        estimatedRevenue=_format_currency(revenue_val * 0.3) if revenue_val else "—",
        publisher=game.get("publisher") if game.get("publisher") is not None else "—",
        genres=genres,
        categories=categories
        #mechanics=[],
        #pros=[],
        #cons=[],
    )


async def search_games_by_name(query_text: str, limit: int = 20) -> List[GameSearchResult]:
    query = """
        SELECT
            mg.appid as id,
            mg."Name" as name,
            mg."Header image" as image
        FROM main_games mg
        WHERE mg."Name" ILIKE $1
        ORDER BY mg."Name" ASC
        LIMIT $2
    """

    try:
        results = await db.execute_query(query, (f"%{query_text}%", limit))
    except Exception as exc:
        logger.error(f"Database error while searching games: {exc}")
        raise HTTPException(status_code=503, detail="Database service temporarily unavailable")

    return [
        GameSearchResult(id=row.get("id"), name=row.get("name") or "—", image=row.get("image") or "—")
        for row in results
    ]
