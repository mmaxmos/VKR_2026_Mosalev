from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query

from schemas.response import GameDetails, GameSearchResult
from utils.security import get_current_user
from services.games import get_game_details_by_id, search_games_by_name

router = APIRouter()


@router.get("/games/search", response_model=List[GameSearchResult])
async def search_games(
    query: str = Query(..., min_length=2),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return await search_games_by_name(query.strip(), limit)


@router.get("/games/{game_id}", response_model=GameDetails)
async def get_game_details(
    game_id: int,
    current_user: dict = Depends(get_current_user),
):
    return await get_game_details_by_id(game_id)
