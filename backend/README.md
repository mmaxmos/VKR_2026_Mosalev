# Backend (FastAPI)

# Быстрый старт

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## OpenRouter / DeepSeek Setup

Add these variables to `backend/.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-token-here
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
```

`OPENROUTER_API_KEY` is the exact place where you should insert your token.
If you use OpenRouter, do not point `OPENROUTER_URL` to `https://api.deepseek.com`.
That URL is for DeepSeek Direct API and will return 404 with the OpenRouter-style setup.

## New Endpoint: AI hypotheses for all charts

`POST /analyze_charts/hypotheses`

Access: `pro`, `admin` only.

Body example:

```json
{
	"analysisId": "8b55af20-87bf-4f0f-bcb6-cd730f76cbf6",
	"appLanguage": "ru",
	"gameDescription": "Кооперативный extraction-shooter в sci-fi сеттинге"
}
```

Response format:

```json
{
	"success": true,
	"hypotheses": [
		{
			"id": "release_dynamics",
			"title": "Динамика релизов",
			"insights": ["...", "..."]
		}
	],
	"meta": {
		"source": "analysis",
		"language": "ru",
		"count": 11,
		"model": "deepseek/deepseek-chat-v3-0324"
	}
}
```
