import json
from typing import Any
from fastapi.encoders import jsonable_encoder

from utils.database import db
from datetime import datetime, timezone


_HAS_CHARTS_JSON_COLUMN: Any = None


async def _has_charts_json_column() -> bool:
    global _HAS_CHARTS_JSON_COLUMN
    if _HAS_CHARTS_JSON_COLUMN is not None:
        return bool(_HAS_CHARTS_JSON_COLUMN)

    query = """
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'analyses' AND column_name = 'charts_json'
        LIMIT 1
    """
    rows = await db.execute_query(query)
    _HAS_CHARTS_JSON_COLUMN = bool(rows)
    return bool(_HAS_CHARTS_JSON_COLUMN)


async def _has_hypotheses_json_column() -> bool:
    query = """
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'analyses' AND column_name = 'hypotheses_json'
        LIMIT 1
    """
    rows = await db.execute_query(query)
    return bool(rows)


async def save_idea_to_analysis(analysis_id: str, user_id: str, data: dict):
    """Background task to save idea analysis to database."""
    try:
        # Verify analysis belongs to user
        check_query = """
            SELECT a.id FROM analyses a
            JOIN projects p ON a.project_id = p.id
            WHERE a.id = $1 AND p.user_id = $2 AND a.is_locked = FALSE
        """
        check = await db.execute_query(check_query, (analysis_id, user_id))
        
        if check:
            update_query = """
                UPDATE analyses
                SET idea_json = $1::jsonb, updated_at = $2
                WHERE id = $3
            """
            await db.execute_query(update_query, (data, datetime.now(timezone.utc), analysis_id))
    except Exception as e:
        print(f"Error saving idea analysis: {e}")


async def save_game_to_analysis(analysis_id: str, user_id: str, data: Any):
    """Background task to save game analysis to database."""
    try:
        # Verify analysis belongs to user
        check_query = """
            SELECT a.id FROM analyses a
            JOIN projects p ON a.project_id = p.id
            WHERE a.id = $1 AND p.user_id = $2 AND a.is_locked = FALSE
        """
        check = await db.execute_query(check_query, (analysis_id, user_id))
        
        if check:
            serializable_data = jsonable_encoder(data)
            now = datetime.now(timezone.utc)
            if await _has_charts_json_column():
                update_query = """
                    UPDATE analyses
                    SET charts_json = $1::jsonb,
                        updated_at = $2
                    WHERE id = $3
                    RETURNING id
                """
            else:
                update_query = """
                    UPDATE analyses
                    SET game_json = $1::jsonb, updated_at = $2
                    WHERE id = $3
                    RETURNING id
                """
            updated = await db.execute_query(update_query, (serializable_data, now, analysis_id))
            if not updated:
                print(
                    f"Game analysis update skipped: analysis_id={analysis_id}, user_id={user_id}."
                )
        else:
            print(
                f"Skip saving game analysis: analysis_id={analysis_id}, user_id={user_id}. "
                "Either analysis does not belong to user or it is locked."
            )
    except Exception as e:
        print(f"Error saving game analysis: {e}")


async def save_hypotheses_to_analysis(analysis_id: str, user_id: str, data: Any):
    """Background task to save hypotheses analysis to database."""
    try:
        check_query = """
            SELECT a.id FROM analyses a
            JOIN projects p ON a.project_id = p.id
            WHERE a.id = $1 AND p.user_id = $2 AND a.is_locked = FALSE
        """
        check = await db.execute_query(check_query, (analysis_id, user_id))

        if check:
            serializable_data = jsonable_encoder(data)
            now = datetime.now(timezone.utc)
            if await _has_hypotheses_json_column():
                update_query = """
                    UPDATE analyses
                    SET hypotheses_json = $1::jsonb,
                        updated_at = $2
                    WHERE id = $3
                    RETURNING id
                """
                updated = await db.execute_query(update_query, (serializable_data, now, analysis_id))
                if not updated:
                    print(
                        f"Hypotheses update skipped: analysis_id={analysis_id}, user_id={user_id}."
                    )
            else:
                print(
                    f"Skip saving hypotheses analysis: hypotheses_json column is missing, analysis_id={analysis_id}."
                )
        else:
            print(
                f"Skip saving hypotheses analysis: analysis_id={analysis_id}, user_id={user_id}. "
                "Either analysis does not belong to user or it is locked."
            )
    except Exception as e:
        print(f"Error saving hypotheses analysis: {e}")


async def verify_project_belongs_to_user(project_id: str, user_id: str) -> bool:
    """Verify that a project belongs to a specific user."""
    verify_query = """
        SELECT id FROM projects WHERE id = $1 AND user_id = $2
    """
    result = await db.execute_query(verify_query, (project_id, user_id))
    return bool(result)


async def verify_analysis_belongs_to_user(analysis_id: str, user_id: str) -> bool:
    """Verify that an analysis belongs to a specific user."""
    verify_query = """
        SELECT a.id FROM analyses a
        JOIN projects p ON a.project_id = p.id
        WHERE a.id = $1 AND p.user_id = $2
    """
    result = await db.execute_query(verify_query, (analysis_id, user_id))
    return bool(result)


async def is_analysis_locked(analysis_id: str) -> bool:
    """Check if an analysis is locked."""
    check_query = """
        SELECT is_locked FROM analyses WHERE id = $1
    """
    result = await db.execute_query(check_query, (analysis_id,))
    return result[0]["is_locked"] if result else False
