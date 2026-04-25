from fastapi import APIRouter
from routers.analyze import router as analyze_router
from routers.games import router as games_router
from routers.projects import router as projects_router

router = APIRouter()
router.include_router(analyze_router)
router.include_router(games_router)
router.include_router(projects_router)
