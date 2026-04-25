# GameFuse — Frontend

Краткое описание
- Лёгкий интерфейс **(React + Vite + Tailwind)** для анализа игровых идей и ниши.

front — React-приложение (Vite). Основной файл: `src/App.jsx`.

## Быстрый старт
Создать окружение в корневой папке `frontend`  
`.env.development`:  
```
VITE_API_URL=http://localhost:8000
VITE_BACKEND_API_URL=http://localhost:8000
VITE_AUTH_API_URL=http://localhost:8005
```
`.env.production`:    
```
VITE_API_URL=
```
Запустить фронтенд:

```powershell
cd .\frontend
npm install   # если ещё не выполнено, подгружает node_modules
npm run dev
```

Важно: фронтенд делает POST на `http://localhost:8000/analyze_charts`. Убедитесь, что backend доступен по этому адресу.

## API контракт 
`/analyze_charts` (POST)

1) Ожидаемый входной JSON (frontend → backend)
- Схемы прописаны на бэке
- все поля необязательны (nullable/optional). Всего 23 параметра в фильтрею Примеры ключей и типов:

```json
{
	"genres": ["RPG", "Action"],            // array of strings
	"tags": ["Sci-Fi"],
	"categories": ["Single-player"],
	"languages": ["English"],
	"publisherClass": ["Indie"],             // currently array in schema
	"releaseStart": "2020-01-01",            // ISO date string or null
	"releaseFinish": "2024-12-31",
	"copiesSoldFrom": 1000,
	"copiesSoldTo": 100000,
	"priceFrom": 0.99,
	"priceTo": 59.99,
	"revenueFrom": 1000.0,
	"revenueTo": 1000000.0,
	"ratingFrom": 70.0,
	"ratingTo": 95.0,
	"publishers": ["EA"],
	"developers": ["Indie Dev"],
	"reviewsFrom": 10,
	"reviewsTo": 5000,
	"playtimeFrom": 1.2,
	"playtimeTo": 40.0,
	"followersFrom": 0,
	"followersTo": 100000,
	"appLanguage": "ru"                        // optional, UI language hint
}
```
Пример пустого запроса, необходимо возвращать аналитику рынка:
```json
{"genres":["Action"],"tags":["Sci-Fi"],"categories":["Single-player"],"languages":["English"],"publisherClass":[],"releaseStart":null,"releaseFinish":null,"copiesSoldFrom":null,"copiesSoldTo":null,"priceFrom":null,"priceTo":null,"revenueFrom":null,"revenueTo":null,"ratingFrom":null,"ratingTo":null,"publishers":[],"developers":[],"reviewsFrom":null,"reviewsTo":null,"playtimeFrom":null,"playtimeTo":null,"followersFrom":null,"followersTo":null,"appLanguage":"ru"}
```

Frontend sends two main kinds of payloads:
- Form submit (Idea analysis) — built from `IdeaForm` (keys: `description`, `genres`, `tags`, `categories`, `languages`, `appLanguage`, plus any other `formState` keys).
- Filter apply (Market filters) — built from `RightFilterSidebar` (keys shown above, e.g. `genres`, `tags`, `languages`, `publisherClass`, `releaseStart`, `copiesSoldFrom`, ...).


Frontend-compatible behavior:
- Если backend вернёт массив — фронтенд использует его как `plots`.
- Если backend вернёт объект — фронтенд ищет `plots` или `result` в ответе; иначе, при отсутствии этих ключей, frontend использует mock/empty state.
   


**Полезные замечания для разработки**
- Frontend dev: `cd frontend && npm run dev` (Vite) — dev server обычно на `http://localhost:5173`.
- CORS: backend уже настроен с `allow_origins=['*']` для локальной разработки.

