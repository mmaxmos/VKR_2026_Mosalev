import logging
import os
import traceback
from statistics import median
from typing import Any, Dict, List, Tuple

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

from utils.database import db
from schemas.request import IdeaAnalysisRequest
from schemas.response import GameDetails, GameMetrics, IdeaAnalysisResponse

load_dotenv()

logger = logging.getLogger(__name__)


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


async def _fetch_similar_games(request: IdeaAnalysisRequest) -> List[Dict[str, Any]]:
    api_url = os.getenv("ANALYSIS_API_URL")
    if not api_url:
        raise ValueError("ANALYSIS_API_URL not configured in .env")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                api_url,
                json={
                    "idea": request.idea,
                    "min_reviews": request.min_reviews,
                    "min_review_score": request.min_review_score,
                    "min_revenue": request.min_revenue,
                    "min_semantic_score": request.min_semantic_score,
                    "popularity_weight": request.popularity_weight,
                    "limit": 150 * len(request.tags) if request.tags else 150,
                },
                timeout=120.0,
            )
            response.raise_for_status()
            service_data = response.json()
    except httpx.RequestError as exc:
        logger.error(f"Network error calling analysis service: {exc}")
        raise HTTPException(status_code=502, detail="Analysis service unreachable (network/DNS error)")
    except httpx.HTTPStatusError as exc:
        logger.error(f"Analysis service returned HTTP error: {exc}")
        raise HTTPException(
            status_code=502, detail=f"Analysis service returned error: {exc.response.status_code}"
        )

    return service_data.get("similar_games", [])


async def _fetch_db_games(steam_ids: List[int]) -> List[Dict[str, Any]]:
    if not steam_ids:
        return []

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
        WHERE mg.appid = ANY($1)
    """

    try:
        return await db.execute_query(query, (steam_ids,))
    except Exception as db_error:
        logger.error(f"Database error while fetching game details: {str(db_error)}")
        logger.debug(traceback.format_exc())
        raise HTTPException(
            status_code=503,
            detail="Database service temporarily unavailable. Please try again in a few moments.",
        )


async def analyze_idea_competitors(request: IdeaAnalysisRequest) -> Dict[str, Any]:
    try:
        similar_games_raw = await _fetch_similar_games(request)
        steam_ids = [game["steam_id"] for game in similar_games_raw if "steam_id" in game]

        if not steam_ids:
            empty_response = IdeaAnalysisResponse(
                metrics=GameMetrics(
                    found="0",
                    revenue="$0",
                    medianRevenue="$0",
                    avgRevenue="$0",
                    avgPrice="$0",
                ),
                list=[],
            )
            return {"competitors": empty_response.model_dump(), "ids": []}

        db_games = await _fetch_db_games(steam_ids)
        if not db_games:
            empty_response = IdeaAnalysisResponse(
                metrics=GameMetrics(
                    found="0",
                    revenue="$0",
                    medianRevenue="$0",
                    avgRevenue="$0",
                    avgPrice="$0",
                ),
                list=[],
            )
            return {"competitors": empty_response.model_dump(), "ids": []}

        similarity_map = {game["steam_id"]: game["similarity_score"] for game in similar_games_raw}

        enriched_games: List[Tuple[GameDetails, float]] = []
        total_revenue = 0.0
        revenues: List[float] = []
        prices: List[float] = []

        for game in db_games:
            steam_id = game["id"]
            similarity = similarity_map.get(steam_id, 0)

            revenue_val = float(game.get("revenue")) if game.get("revenue") is not None else 0
            price_val = float(game.get("price")) if game.get("price") is not None else 0

            total_revenue += revenue_val
            revenues.append(revenue_val)
            prices.append(price_val)

            game_detail = GameDetails(
                id=steam_id,
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
                tags=_parse_delimited_list(game.get("tags")),
                similarity=f"{int(similarity * 100)}%",
                peakCCU=_format_number(game.get("peakccu")),
                developer=game.get("developer") if game.get("developer") is not None else "—",
                publisherClass=game.get("publisherclass") if game.get("publisherclass") is not None else "—",
                estimatedRevenue=_format_currency(revenue_val * 0.3) if revenue_val else "—",
                publisher=game.get("publisher") if game.get("publisher") is not None else "—",
                genres=_parse_delimited_list(game.get("genres")),
                categories=_parse_delimited_list(game.get("categories"))
                #mechanics=[],
                #pros=[],
                #cons=[],
            )
            enriched_games.append((game_detail, similarity))

        enriched_games.sort(key=lambda x: x[1], reverse=True)
        top_games = [game[0] for game in enriched_games[:48]]

        found_count = len(enriched_games)
        median_revenue = float(median(revenues)) if revenues else 0
        avg_revenue = float(sum(revenues) / len(revenues)) if revenues else 0
        avg_price = float(sum(prices) / len(prices)) if prices else 0

        metrics = GameMetrics(
            found=str(found_count),
            revenue=_format_currency(total_revenue),
            medianRevenue=_format_currency(median_revenue),
            avgRevenue=_format_currency(avg_revenue),
            avgPrice=_format_currency(avg_price),
        )

        response = IdeaAnalysisResponse(metrics=metrics, list=top_games)
        return {"competitors": response.model_dump(), "ids": steam_ids}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"ERROR in analyze_idea_competitors: {exc}")
        logger.debug(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error during analysis")


async def analyze_idea_deep(competitor_ids: List[int], request: IdeaAnalysisRequest) -> Dict[str, Any]:
    second_service_url = os.getenv("SECOND_SERVICE_URL")
    if not second_service_url:
        return {}

    payload = {
        "competitor_ids": competitor_ids,
        "description": request.idea,
        "tags": request.tags if request.tags else [],
        "genres": request.genres if request.genres else [],
        "filter_match_mode": request.filter_match_mode,
        "language": request.language,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(second_service_url, json=payload, timeout=120.0)
            response.raise_for_status()
            return response.json()
    except Exception as exc:
        logger.warning(f"Failed to send data to second service: {exc}")
        return {}
