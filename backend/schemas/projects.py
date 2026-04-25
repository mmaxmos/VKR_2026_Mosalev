import uuid

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class ProjectUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class ProjectResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    id: uuid.UUID
    name: str


class AnalysisCreate(BaseModel):
    project_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=255)


class AnalysisUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class AnalysisSave(BaseModel):
    idea_json: Optional[dict] = None
    game_json: Optional[dict] = None


class AnalysisResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    idea_json: Optional[dict] = None
    game_json: Optional[dict] = None
    is_locked: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnalysisListItem(BaseModel):
    id: uuid.UUID
    name: str
    is_locked: bool


class ProjectWithAnalyses(BaseModel):
    id: uuid.UUID
    name: str
    analyses: list[AnalysisListItem]
