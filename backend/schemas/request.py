from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union


class IdeaAnalysisRequest(BaseModel):
    idea: str
    tags: Optional[List[str]] = None
    genres: Optional[List[str]] = None
    filter_match_mode: str = "any"  # "any" or "all"
    language: str = "en"
    min_reviews: Optional[int] = 0
    min_review_score: Optional[float] = 0
    min_revenue: Optional[float] = 0
    min_semantic_score: float = 0.8
    popularity_weight: float = 0.1
    limit: Optional[int] = 100


class GameAnalysisRequest(BaseModel):
    genres: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    publisherClass: Optional[List[str]] = None
    releaseStart: Optional[str] = None
    releaseFinish: Optional[str] = None
    copiesSoldFrom: Optional[int] = None
    copiesSoldTo: Optional[int] = None
    priceFrom: Optional[float] = None
    priceTo: Optional[float] = None
    revenueFrom: Optional[float] = None
    revenueTo: Optional[float] = None
    ratingFrom: Optional[float] = None
    ratingTo: Optional[float] = None
    publishers: Optional[List[str]] = None
    developers: Optional[List[str]] = None
    reviewsFrom: Optional[int] = None
    reviewsTo: Optional[int] = None
    playtimeFrom: Optional[float] = None
    playtimeTo: Optional[float] = None
    followersFrom: Optional[int] = None
    followersTo: Optional[int] = None
    appLanguage: Optional[str] = "ru"


class ChartHypothesesRequest(BaseModel):
    analysisId: Optional[str] = None
    appLanguage: str = "ru"
    gameDescription: Optional[str] = None
    chartsPayload: Optional[Any] = None


class ReleaseForecastHistory(BaseModel):
    x: List[str]
    y: List[float]


class ReleaseForecastRequest(BaseModel):
    chartId: Optional[str] = "release_dynamics"
    appLanguage: Optional[str] = "ru"
    horizons: Optional[List[int]] = None
    genres: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    history: ReleaseForecastHistory

# ============ SCHEMAS FOR PITCH PACK============

class UserDescription(BaseModel):
    """Описание игры от пользователя"""
    ideaDescription: Optional[str] = None
    genres: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    languages: Optional[List[str]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "ideaDescription": "Мобильная кооперативная игра в жанре extraction shooter",
                "genres": ["Action", "Shooter", "Survival", "Extraction"],
                "tags": ["PvPvE", "Co-op", "Loot", "Procedural Generation"],
                "categories": ["Multiplayer", "Online Co-Op", "Early Access"],
                "languages": ["English", "Russian", "Simplified Chinese"]
            }
        }


class AspectScore(BaseModel):
    """Оценка отдельного аспекта идеи"""
    score: Optional[int] = None
    reasoning: Optional[str] = None
    lack_of_info: Optional[str] = None


class GrowthPoint(BaseModel):
    """Точка роста для улучшения идеи"""
    aspect: str
    current_state: str
    recommendation: str
    expected_outcome: str


class IdeaAnalysis(BaseModel):
    """Анализ идеи игры"""
    suggested_name: Optional[str] = None
    summary: Optional[str] = None
    scores: Optional[Dict[str, AspectScore]] = None
    growth_points: Optional[List[GrowthPoint]] = None


class MarketIntro(BaseModel):
    """Введение в анализ рынка"""
    description: Optional[str] = None


class PlotData(BaseModel):
    """Данные для одного trace в Plotly"""
    x: Optional[List[Any]] = None
    y: Optional[List[Any]] = None
    labels: Optional[List[str]] = None
    values: Optional[List[Union[int, float]]] = None
    type: Optional[str] = None
    marker: Optional[Dict[str, Any]] = None
    hole: Optional[float] = None
    
    class Config:
        # Разрешаем любые дополнительные поля
        extra = "allow"


class PlotLayout(BaseModel):
    """Layout для Plotly графика"""
    title: Optional[str] = None
    description: Optional[str] = None
    template: Optional[str] = None
    paper_bgcolor: Optional[str] = None
    plot_bgcolor: Optional[str] = None
    barcornerradius: Optional[int] = None
    
    class Config:
        # Разрешаем любые дополнительные поля для Plotly
        extra = "allow"


class Plot(BaseModel):
    """Один Plotly график"""
    data: List[Dict[str, Any]]  # PlotData as dict для гибкости
    layout: Optional[Dict[str, Any]] = None  # PlotLayout as dict
    
    class Config:
        extra = "allow"


class MarketAnalysis(BaseModel):
    """Анализ рынка"""
    intro: Optional[MarketIntro] = None
    metrics: Optional[Dict[str, str]] = None
    plots: Optional[List[Dict[str, Any]]] = None  # Plotly графики как dict


class Competitor(BaseModel):
    """Информация о конкуренте"""
    id: Optional[int] = None
    title: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    releaseDate: Optional[str] = None
    price: Optional[str] = None
    revenue: Optional[str] = None
    estimatedRevenue: Optional[str] = None
    downloads: Optional[str] = None
    positiveReviewPercent: Optional[str] = None
    reviewCount: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    similarity: Optional[str] = None
    peakCCU: Optional[str] = None
    tags: Optional[List[str]] = None


class Competitors(BaseModel):
    """Анализ конкурентов"""
    metrics: Optional[Dict[str, str]] = None
    list: Optional[List[Competitor]] = None


class PitchDeckRequest(BaseModel):
    """Request для генерации Pitch Deck"""
    docLanguage: str = "ru"
    userDescr: Optional[UserDescription] = None
    idea_analysis: Optional[IdeaAnalysis] = None
    marketAnalysis: Optional[MarketAnalysis] = None
    competitors: Optional[Competitors] = None

    class Config:
        json_schema_extra = {
            "example": {
                "docLanguage": "ru",
                "userDescr": {
                    "ideaDescription": "Мобильная кооперативная игра в жанре extraction shooter с элементами выживания и крафта...",
                    "genres": ["Action", "Shooter", "Survival", "Extraction"],
                    "tags": ["PvPvE", "Co-op", "Loot", "Procedural Generation", "Tactical", "Team-Based", "First-Person"],
                    "categories": ["Multiplayer", "Online Co-Op", "Early Access"],
                    "languages": ["English", "Russian", "Simplified Chinese", "Spanish", "German", "French"]
                },
                "idea_analysis": {
                    "suggested_name": "Botanical Warfare: Political Roots",
                    "summary": "Анализ подтверждает: комбинация RTS с политической дипломатией и растительным сеттингом обладает высоким потенциалом для создания уникальной многопользовательской экосистемы.",
                    "scores": {
                        "gameplay": {
                            "score": 4,
                            "reasoning": "Описаны ключевые механики: RTS для 4+ игроков, политические отношения...",
                            "lack_of_info": None
                        },
                        "story": {
                            "score": 3,
                            "reasoning": "Есть базовый сеттинг, но отсутствует глубокая лоре-основа",
                            "lack_of_info": None
                        },
                        "visual": {
                            "score": None,
                            "reasoning": "Нет информации о визуальном стиле",
                            "lack_of_info": "Полное отсутствие описания визуальной составляющей"
                        }
                    },
                    "growth_points": [
                        {
                            "aspect": "Политические механики",
                            "current_state": "Упоминаются политические отношения и действия, но без деталей",
                            "recommendation": "Разработать систему дипломатии, альянсов, предательства",
                            "expected_outcome": "Глубина взаимодействия между игроками повысит реиграбельность"
                        }
                    ]
                },
                "marketAnalysis": {
                    "intro": {
                        "description": "Изучение игровой ниши с графиками и средними метриками рынка..."
                    },
                    "metrics": {
                        "foundGames": "73 111",
                        "totalCCU": "16 472 391",
                        "avMedCCU": "225 / 0",
                        "totalRevenue": "$52 928 446 047",
                        "medianRevenue": "$107",
                        "avgRevenue": "$723 946",
                        "medianPrice": "$4.99",
                        "avgPrice": "$7.44",
                        "minMaxPrice": "$0.00 / $999.00",
                        "avgReviewScore": "49.4 / 100",
                        "avgPositiveReviews": "888",
                        "avgNegativeReviews": "154",
                        "avgPositiveRatio": "76.7%"
                    },
                    "plots": [
                        {
                            "data": [{
                                "x": ["Янв", "Фев", "Март"],
                                "y": [5054, 5362, 5839],
                                "type": "bar",
                                "marker": {"color": "#f0627f"}
                            }],
                            "layout": {
                                "template": "plotly_dark",
                                "paper_bgcolor": "#191D28",
                                "plot_bgcolor": "#191D28",
                                "title": "Сезонность релизов",
                                "description": "Распределение количества релизов по месяцам",
                                "barcornerradius": 5
                            }
                        }
                    ]
                },
                "competitors": {
                    "metrics": {
                        "found": "10",
                        "revenue": "$3.9M",
                        "medianRevenue": "$3.1K",
                        "avgRevenue": "$391.8K",
                        "avgPrice": "$10.76"
                    },
                    "list": [
                        {
                            "id": 911500,
                            "title": "Antox vs. Free Radicals",
                            "image": "https://cdn.akamai.steamstatic.com/steam/apps/911500/header.jpg",
                            "positiveReviewPercent": "100%",
                            "reviewCount": "1",
                            "revenue": "—",
                            "downloads": "—",
                            "releaseDate": "Nov 13, 2018",
                            "price": "$0.99",
                            "description": "Introduction The real war is in you!",
                            "tags": ["Simulation", "Adventure", "Strategy"],
                            "similarity": "87%",
                            "peakCCU": "—",
                            "developer": "Greenlynx",
                            "publisher": "Greenlynx"
                        }
                    ]
                }
            }
        }
