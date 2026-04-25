import json
import logging
from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from fastapi.responses import Response, StreamingResponse
from schemas.request import (
    ChartHypothesesRequest,
    GameAnalysisRequest,
    IdeaAnalysisRequest,
    ReleaseForecastRequest,
)
from schemas.response import ChartHypothesesResponse, ReleaseForecastResponse
from services.analysis.charts import build_response
from services.analysis.hypotheses import generate_chart_hypotheses
from services.analysis.idea import analyze_idea_competitors, analyze_idea_deep
from services.analysis.release_forecast import (
    ForecastInputError,
    ForecastInsufficientDataError,
    ForecastModelLoadError,
    build_release_forecast,
)
from utils.security import get_current_user
from utils.analysis import save_idea_to_analysis, save_game_to_analysis, save_hypotheses_to_analysis
from typing import Optional

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze_game_idea")
async def analyze_idea(
    request_data: IdeaAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    analysis_id: Optional[str] = Query(None, alias="analysisId"),
):
    target_analysis_id = analysis_id

    async def event_generator():
        combined_result = {}
        try:
            result1 = await analyze_idea_competitors(request_data)
            combined_result.update(result1)
            yield f"data: {json.dumps({'event': 'function1_complete', 'data': result1})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'event': 'error', 'step': 1, 'message': str(exc)})}\n\n"
            return

        if current_user.get("role") not in ["admin", "pro", "indie", "base"]: #TODO - убрать base
            yield f"data: {json.dumps({'event': 'forbidden', 'message': 'У вас нет прав на этап 2'})}\n\n"
            if target_analysis_id:
                background_tasks.add_task(save_idea_to_analysis, target_analysis_id, current_user["user_id"], combined_result)
            return

        try:
            result2 = await analyze_idea_deep(result1.get("ids", []), request_data)
            combined_result.update(result2)
            yield f"data: {json.dumps({'event': 'function2_complete', 'data': result2})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'event': 'error', 'step': 2, 'message': str(exc)})}\n\n"
        
        # Save to database after all processing
        if target_analysis_id:
            background_tasks.add_task(save_idea_to_analysis, target_analysis_id, current_user["user_id"], combined_result)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/analyze_charts")
async def analyze_game(
    request_data: GameAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    analysis_id: Optional[str] = Query(None, alias="analysisId"),
):
    try:
        target_analysis_id = analysis_id
        result = await build_response(request_data)
        
        # Save to database in background
        if target_analysis_id:
            background_tasks.add_task(save_game_to_analysis, target_analysis_id, current_user["user_id"], result)
        
        return result
    except Exception as e:
        print(f"ERROR in analyze_game: {e}")
        raise


@router.post("/analyze_charts/hypotheses", response_model=ChartHypothesesResponse)
async def analyze_chart_hypotheses(
    request_data: ChartHypothesesRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    result = await generate_chart_hypotheses(request_data, current_user["user_id"])

    if request_data.analysisId:
        background_tasks.add_task(
            save_hypotheses_to_analysis,
            request_data.analysisId,
            current_user["user_id"],
            result.model_dump(),
        )

    return result


@router.post("/analyze_charts/release_forecast", response_model=ReleaseForecastResponse)
async def analyze_release_forecast(
    request_data: ReleaseForecastRequest,
    current_user: dict = Depends(get_current_user),
):
    del current_user
    try:
        return await build_release_forecast(request_data)
    except ForecastInsufficientDataError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except ForecastInputError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ForecastModelLoadError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected release forecast error")
        raise HTTPException(status_code=500, detail="Forecast service error") from exc
