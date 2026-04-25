import json
import logging
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import HTTPException

from schemas.request import ChartHypothesesRequest
from schemas.response import ChartHypothesesResponse, ChartHypothesis
from utils.database import db

logger = logging.getLogger(__name__)


def _normalize_lang(language: str) -> str:
    lang = (language or "ru").strip().lower()
    if lang.startswith("en"):
        return "eng"
    return "ru"


def _resolve_llm_config() -> Tuple[str, str]:
    raw_endpoint = os.getenv("OPENROUTER_URL", "https://openrouter.ai/api/v1/chat/completions").strip()
    raw_model = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat-v3-0324").strip()

    if "openrouter.ai" in raw_endpoint:
        endpoint = raw_endpoint
        model = raw_model if raw_model.startswith("deepseek/") else "deepseek/deepseek-chat-v3-0324"
        return endpoint, model

    if "api.deepseek.com" in raw_endpoint:
        endpoint = raw_endpoint.rstrip("/")
        if not endpoint.endswith("/chat/completions"):
            endpoint = f"{endpoint}/chat/completions"
        model = raw_model if raw_model else "deepseek-chat"
        if model.startswith("deepseek/"):
            model = "deepseek-chat"
        return endpoint, model

    endpoint = raw_endpoint
    model = raw_model or "deepseek-chat"
    return endpoint, model


def _extract_game_description(idea_json: Optional[Dict[str, Any]], fallback: Optional[str]) -> str:
    if fallback and fallback.strip():
        return fallback.strip()

    if not isinstance(idea_json, dict):
        return ""

    candidates = [
        idea_json.get("idea"),
        (idea_json.get("userDescr") or {}).get("ideaDescription") if isinstance(idea_json.get("userDescr"), dict) else None,
        idea_json.get("description"),
    ]

    for candidate in candidates:
        if isinstance(candidate, str) and candidate.strip():
            return candidate.strip()
    return ""


def _extract_charts(game_payload: Any, lang_key: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    if not game_payload:
        return [], {}

    response_part: Dict[str, Any] = {}
    metrics: Dict[str, Any] = {}

    if isinstance(game_payload, list):
        if len(game_payload) > 0 and isinstance(game_payload[0], dict):
            response_part = game_payload[0]
        if len(game_payload) > 1 and isinstance(game_payload[1], dict):
            metrics = game_payload[1]
    elif isinstance(game_payload, dict):
        response_part = game_payload

    # Case: direct single-language payload, e.g. {"success": true, "plots": [...]}
    if isinstance(response_part.get("plots"), list):
        charts = response_part.get("plots")
        clean_charts = [c for c in charts if isinstance(c, dict)]
        return clean_charts, metrics

    lang_payload = response_part.get(lang_key)
    if not isinstance(lang_payload, dict):
        lang_payload = response_part.get("ru") if lang_key == "eng" else response_part.get("eng")

    if not isinstance(lang_payload, dict):
        return [], metrics

    charts = lang_payload.get("plots")
    if not isinstance(charts, list):
        return [], metrics

    clean_charts = [c for c in charts if isinstance(c, dict)]
    return clean_charts, metrics


def _series_aggregate(values: List[float]) -> Dict[str, Any]:
    filtered = [float(v) for v in values if isinstance(v, (int, float))]
    if not filtered:
        return {
            "count": 0,
            "sum": 0.0,
            "mean": 0.0,
            "median": 0.0,
            "min": 0.0,
            "max": 0.0,
            "avg_derivative": 0.0,
        }

    sorted_vals = filtered
    derivatives = [sorted_vals[i] - sorted_vals[i - 1] for i in range(1, len(sorted_vals))]

    n = len(sorted_vals)
    sorted_copy = sorted(sorted_vals)
    mid = n // 2
    median_val = sorted_copy[mid] if n % 2 else (sorted_copy[mid - 1] + sorted_copy[mid]) / 2

    return {
        "count": n,
        "sum": float(sum(sorted_vals)),
        "mean": float(sum(sorted_vals) / n),
        "median": float(median_val),
        "min": float(min(sorted_vals)),
        "max": float(max(sorted_vals)),
        "avg_derivative": float(sum(derivatives) / len(derivatives)) if derivatives else 0.0,
    }


def _fallback_aggregates(chart: Dict[str, Any]) -> Dict[str, Any]:
    data = chart.get("data") if isinstance(chart.get("data"), list) else []
    merged_values: List[float] = []

    for trace in data:
        if not isinstance(trace, dict):
            continue
        if isinstance(trace.get("y"), list):
            merged_values.extend([v for v in trace["y"] if isinstance(v, (int, float))])
        elif isinstance(trace.get("values"), list):
            merged_values.extend([v for v in trace["values"] if isinstance(v, (int, float))])
        elif isinstance(trace.get("z"), list):
            for row in trace["z"]:
                if isinstance(row, list):
                    merged_values.extend([v for v in row if isinstance(v, (int, float))])

    return {
        "trace_count": len(data),
        "overall": _series_aggregate(merged_values),
    }


def _prepare_chart_digest(charts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    digest: List[Dict[str, Any]] = []

    for index, chart in enumerate(charts):
        chart_id = chart.get("id") or f"chart_{index + 1}"
        layout = chart.get("layout") if isinstance(chart.get("layout"), dict) else {}
        title = layout.get("title") or chart_id
        layout_meta = layout.get("meta") if isinstance(layout.get("meta"), dict) else {}
        description = layout.get("description") or layout_meta.get("description") or ""

        aggregates = chart.get("aggregates") if isinstance(chart.get("aggregates"), dict) else None
        if not aggregates:
            aggregates = _fallback_aggregates(chart)

        digest.append(
            {
                "id": chart_id,
                "title": title,
                "description": description,
                "aggregates": aggregates,
            }
        )

    return digest


def _parse_llm_json(content: str) -> Dict[str, Any]:
    cleaned = content.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    decoder = json.JSONDecoder()

    for candidate in (cleaned, cleaned[cleaned.find("{") :] if "{" in cleaned else "", cleaned[cleaned.find("[") :] if "[" in cleaned else ""):
        candidate = candidate.strip()
        if not candidate:
            continue
        try:
            parsed, _ = decoder.raw_decode(candidate)
            if isinstance(parsed, list):
                return {"items": parsed}
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            continue

    raise HTTPException(status_code=502, detail="Invalid OpenRouter JSON output: could not parse structured JSON")


async def _call_openrouter(language: str, game_description: str, charts_digest: List[Dict[str, Any]], global_metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail=(
                "OPENROUTER_API_KEY is not configured. Add it to backend/.env, "
                "for example: OPENROUTER_API_KEY=sk-or-v1-your-token"
            ),
        )

    endpoint, model = _resolve_llm_config()

    if language == "eng":
        task_line = (
            "For each chart: briefly describe it and provide exactly 2 insight hypotheses "
            "grounded in the chart metrics."
        )
        system_line = "You are a senior game market analyst. Be concise and evidence-driven."
    else:
        task_line = (
            "Для каждого графика: кратко опиши график и дай ровно 2 гипотезы-инсайта "
            "на основе метрик графика."
        )
        system_line = "Ты senior-аналитик игрового рынка. Пиши кратко и опирайся на данные."

    user_payload = {
        "game_description": game_description,
        "global_metrics": global_metrics,
        "charts": charts_digest,
        "task": task_line,
        "output_format": {
            "items": [
                {
                    "id": "chart_id",
                    "title": "chart title",
                    "insights": ["insight 1", "insight 2"],
                }
            ]
        },
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system_line},
            {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
    except httpx.HTTPStatusError as exc:
        logger.error("OpenRouter HTTP error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"LLM API returned HTTP {exc.response.status_code} at {endpoint}",
        )
    except httpx.RequestError as exc:
        logger.error("OpenRouter request error: %s", exc)
        raise HTTPException(status_code=502, detail="OpenRouter is unreachable")

    content = (
        (result.get("choices") or [{}])[0]
        .get("message", {})
        .get("content", "")
    )

    if not isinstance(content, str) or not content.strip():
        raise HTTPException(status_code=502, detail="OpenRouter returned an empty response")

    parsed = _parse_llm_json(content)

    items = parsed.get("items") if isinstance(parsed, dict) else None
    if not isinstance(items, list):
        raise HTTPException(status_code=502, detail="OpenRouter output does not contain items[]")

    normalized: List[Dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        insight_values = item.get("insights")
        if isinstance(insight_values, list):
            clean_insights = [str(v).strip() for v in insight_values if str(v).strip()]
        else:
            clean_insights = [str(insight_values).strip()] if insight_values else []

        normalized.append(
            {
                "id": str(item.get("id", "")).strip(),
                "title": str(item.get("title", "")).strip(),
                "insights": clean_insights,
            }
        )

    return normalized


async def generate_chart_hypotheses(request: ChartHypothesesRequest, user_id: str) -> ChartHypothesesResponse:
    lang_key = _normalize_lang(request.appLanguage)

    game_payload = request.chartsPayload
    idea_json: Optional[Dict[str, Any]] = None
    source = "request"

    if not game_payload and request.analysisId:
        query = """
            SELECT a.charts_json, a.game_json, a.idea_json
            FROM analyses a
            JOIN projects p ON a.project_id = p.id
            WHERE a.id = $1 AND p.user_id = $2
        """
        rows = await db.execute_query(query, (request.analysisId, user_id))
        if not rows:
            raise HTTPException(status_code=404, detail="Analysis not found")

        game_payload = rows[0].get("charts_json") or rows[0].get("game_json")
        idea_json = rows[0].get("idea_json")
        source = "analysis.charts_json" if rows[0].get("charts_json") is not None else "analysis.game_json"

    if not game_payload:
        raise HTTPException(
            status_code=400,
            detail="Provide analysisId or chartsPayload with charts data",
        )

    charts, global_metrics = _extract_charts(game_payload, lang_key)
    if not charts:
        raise HTTPException(status_code=400, detail="No charts found in provided payload")

    game_description = _extract_game_description(idea_json, request.gameDescription)
    charts_digest = _prepare_chart_digest(charts)

    model_items = await _call_openrouter(lang_key, game_description, charts_digest, global_metrics)

    title_by_id = {item["id"]: item["title"] for item in charts_digest}
    hypotheses: List[ChartHypothesis] = []

    for item in model_items:
        chart_id = item.get("id")
        if not chart_id:
            continue
        hypotheses.append(
            ChartHypothesis(
                id=chart_id,
                title=item.get("title") or title_by_id.get(chart_id) or chart_id,
                insights=item.get("insights") or [],
            )
        )

    if not hypotheses:
        raise HTTPException(status_code=502, detail="No chart hypotheses generated")

    return ChartHypothesesResponse(
        success=True,
        hypotheses=hypotheses,
        meta={
            "source": source,
            "language": lang_key,
            "count": len(hypotheses),
            "model": os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat-v3-0324"),
        },
    )
