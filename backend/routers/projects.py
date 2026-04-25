from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from schemas.projects import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListItem,
    AnalysisCreate, AnalysisUpdate, AnalysisSave, AnalysisResponse, AnalysisListItem,
    ProjectWithAnalyses
)
from utils.security import get_current_user
from utils.database import db
from utils.analysis import verify_project_belongs_to_user, verify_analysis_belongs_to_user, is_analysis_locked
import uuid
from datetime import datetime, timezone

router = APIRouter()


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new project for the current user."""
    query = """
        INSERT INTO projects (id, user_id, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, name, created_at, updated_at
    """
    project_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    
    result = await db.execute_query(
        query,
        (project_id, current_user["user_id"], project.name, now, now)
    )
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create project")
    
    return result[0]


@router.get("/projects", response_model=List[ProjectListItem])
async def get_user_projects(current_user: dict = Depends(get_current_user)):
    """Get all projects for the current user."""
    query = """
        SELECT id, name
        FROM projects
        WHERE user_id = $1
        ORDER BY created_at DESC
    """
    
    results = await db.execute_query(query, (current_user["user_id"],))
    return results


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific project by ID."""
    query = """
        SELECT id, user_id, name, created_at, updated_at
        FROM projects
        WHERE id = $1 AND user_id = $2
    """
    
    results = await db.execute_query(query, (project_id, current_user["user_id"]))
    
    if not results:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return results[0]


@router.patch("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project: ProjectUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a project's name."""
    query = """
        UPDATE projects
        SET name = $1, updated_at = $2
        WHERE id = $3 AND user_id = $4
        RETURNING id, user_id, name, created_at, updated_at
    """
    
    result = await db.execute_query(
        query,
        (project.name, datetime.now(timezone.utc), project_id, current_user["user_id"])
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return result[0]


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a project and all its analyses."""
    query = """
        DELETE FROM projects
        WHERE id = $1 AND user_id = $2
    """
    
    await db.execute_query(query, (project_id, current_user["user_id"]))
    return None


@router.post("/analyses", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    analysis: AnalysisCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new analysis in a project."""
    # Verify project belongs to user
    if not await verify_project_belongs_to_user(analysis.project_id, current_user["user_id"]):
        raise HTTPException(status_code=404, detail="Project not found")
    
    query = """
        INSERT INTO analyses (id, project_id, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, project_id, name, idea_json, game_json, is_locked, created_at, updated_at
    """
    analysis_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    
    result = await db.execute_query(
        query,
        (analysis_id, analysis.project_id, analysis.name, now, now)
    )
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create analysis")
    
    return result[0]


@router.get("/projects/{project_id}/analyses", response_model=List[AnalysisListItem])
async def get_project_analyses(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all analyses for a specific project."""
    query = """
        SELECT a.id, a.name, a.is_locked
        FROM analyses a
        JOIN projects p ON a.project_id = p.id
        WHERE a.project_id = $1 AND p.user_id = $2
        ORDER BY a.created_at DESC
    """

    return await db.execute_query(query, (project_id, current_user["user_id"]))


@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific analysis by ID."""
    query = """
        SELECT a.id, a.project_id, a.name, a.idea_json, a.game_json, 
               a.is_locked, a.created_at, a.updated_at
        FROM analyses a
        JOIN projects p ON a.project_id = p.id
        WHERE a.id = $1 AND p.user_id = $2
    """
    
    results = await db.execute_query(query, (analysis_id, current_user["user_id"]))
    
    if not results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return results[0]


@router.patch("/analyses/{analysis_id}/name", response_model=AnalysisResponse)
async def update_analysis_name(
    analysis_id: str,
    analysis: AnalysisUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an analysis name (only if not locked)."""
    # Verify analysis belongs to user
    if not await verify_analysis_belongs_to_user(analysis_id, current_user["user_id"]):
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Check if locked
    if await is_analysis_locked(analysis_id):
        raise HTTPException(status_code=403, detail="Cannot modify locked analysis")
    
    query = """
        UPDATE analyses
        SET name = $1, updated_at = $2
        WHERE id = $3
        RETURNING id, project_id, name, idea_json, game_json, is_locked, created_at, updated_at
    """
    
    result = await db.execute_query(query, (analysis.name, datetime.now(timezone.utc), analysis_id))
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update analysis")
    
    return result[0]


@router.patch("/analyses/{analysis_id}/save", response_model=AnalysisResponse)
async def save_analysis(
    analysis_id: str,
    data: AnalysisSave,
    current_user: dict = Depends(get_current_user)
):
    """Save analysis data."""
    # Verify analysis belongs to user
    if not await verify_analysis_belongs_to_user(analysis_id, current_user["user_id"]):
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Check if locked
    if await is_analysis_locked(analysis_id):
        raise HTTPException(status_code=403, detail="Cannot modify locked analysis")
    
    # Build update query dynamically based on what's provided
    updates = []
    params = []
    param_count = 1
    
    if data.idea_json is not None:
        updates.append(f"idea_json = ${param_count}")
        params.append(data.idea_json)
        param_count += 1
    
    if data.game_json is not None:
        updates.append(f"game_json = ${param_count}")
        params.append(data.game_json)
        param_count += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No data provided to save")
    
    updates.append(f"updated_at = ${param_count}")
    params.append(datetime.now(timezone.utc))
    param_count += 1
    
    params.append(analysis_id)
    
    query = f"""
        UPDATE analyses
        SET {', '.join(updates)}
        WHERE id = ${param_count}
        RETURNING id, project_id, name, idea_json, game_json, is_locked, created_at, updated_at
    """
    
    result = await db.execute_query(query, tuple(params))
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to save analysis")
    
    return result[0]


@router.post("/analyses/{analysis_id}/lock", response_model=AnalysisResponse)
async def lock_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Lock an analysis to make it non-editable."""
    query = """
        UPDATE analyses a
        SET is_locked = TRUE, updated_at = $1
        FROM projects p
        WHERE a.id = $2 AND a.project_id = p.id AND p.user_id = $3
        RETURNING a.id, a.project_id, a.name, a.idea_json, a.game_json, a.is_locked, a.created_at, a.updated_at
    """
    
    result = await db.execute_query(query, (datetime.now(timezone.utc), analysis_id, current_user["user_id"]))
    
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return result[0]


@router.post("/analyses/{analysis_id}/duplicate", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Duplicate an analysis (creates a copy with all current content)."""
    # Get original analysis
    get_query = """
        SELECT a.project_id, a.name, a.idea_json, a.game_json
        FROM analyses a
        JOIN projects p ON a.project_id = p.id
        WHERE a.id = $1 AND p.user_id = $2
    """
    
    original = await db.execute_query(get_query, (analysis_id, current_user["user_id"]))
    
    if not original:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    original_data = original[0]
    
    # Create duplicate
    insert_query = """
        INSERT INTO analyses (id, project_id, name, idea_json, game_json, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, project_id, name, idea_json, game_json, is_locked, created_at, updated_at
    """
    
    new_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    duplicate_name = f"{original_data['name']} (Copy)"
    
    result = await db.execute_query(
        insert_query,
        (
            new_id,
            original_data["project_id"],
            duplicate_name,
            original_data["idea_json"],
            original_data["game_json"],
            now,
            now
        )
    )
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to duplicate analysis")
    
    return result[0]


@router.delete("/analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an analysis."""
    query = """
        DELETE FROM analyses a
        USING projects p
        WHERE a.id = $1 AND a.project_id = p.id AND p.user_id = $2
    """
    
    await db.execute_query(query, (analysis_id, current_user["user_id"]))
    return None
