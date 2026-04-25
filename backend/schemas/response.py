from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class SimilarGame(BaseModel):
    steam_id: int
    similarity_score: float


class ServiceResponse(BaseModel):
    normalized_idea: str
    similar_games: List[SimilarGame]


class GameMetrics(BaseModel):
    found: str
    revenue: str
    medianRevenue: str
    avgRevenue: str
    avgPrice: str


class GameDetails(BaseModel):
    id: int
    title: str
    image: str
    positiveReviewPercent: str
    reviewCount: str
    revenue: str
    downloads: str
    releaseDate: str
    price: str
    description: str
    tags: List[str]
    similarity: str
    peakCCU: str
    developer: str
    publisherClass: str
    estimatedRevenue: str
    publisher: str
    genres: List[str]
    categories: List[str]
    #mechanics: List[str] = Field(default_factory=list)
    #pros: List[str] = Field(default_factory=list)
    #cons: List[str] = Field(default_factory=list)


class GameSearchResult(BaseModel):
    id: int
    name: str
    image: str


class IdeaAnalysisResponse(BaseModel):
    metrics: GameMetrics
    list: List[GameDetails]


class Prediction(BaseModel):
    estimatedRevenue: int
    expectedReviews: int
    expectedRating: int
    successProbability: float


class PlotlyChart(BaseModel):
    id: Optional[str] = None
    data: List[Dict[str, Any]]
    layout: Dict[str, Any]
    aggregates: Optional[Dict[str, Any]] = None


class GameAnalysisResponse(BaseModel):
    success: bool
    plots: List[PlotlyChart]
    meta: Optional[Dict[str, Any]] = None

class PitchDeckResponse(BaseModel):
    """Response с информацией о сгенерированном файле"""
    message: str = Field(..., description="Сообщение о результате")
    filename: str = Field(..., description="Имя файла")
    generated_at: str = Field(..., description="Дата и время генерации")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Pitch Deck успешно сгенерирован",
                "filename": "pitch_deck_2026-01-11_14-30-45.html",
                "generated_at": "2026-01-11 14:30:45"
            }
        }


class ChartHypothesis(BaseModel):
    id: str
    title: str
    insights: List[str]


class ChartHypothesesResponse(BaseModel):
    success: bool
    hypotheses: List[ChartHypothesis]
    meta: Optional[Dict[str, Any]] = None


class ReleaseForecastPoint(BaseModel):
    horizon: int
    month: str
    value: float


class ReleaseForecastResponse(BaseModel):
    success: bool
    historyLastMonth: str
    historyPoints: int
    predictions: List[ReleaseForecastPoint]
    meta: Optional[Dict[str, Any]] = None
