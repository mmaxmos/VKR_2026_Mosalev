# ВКР Мосалева М.С. — программная реализация

Репозиторий содержит реализацию системы анализа игровой идеи и рынка (проект `GameFuse`): backend на FastAPI и frontend на React/Vite.

## Структура репозитория

- `backend/` — API и бизнес-логика:
  - роуты (`routers/`): анализ идеи/графиков, прогноз релизов, проекты и анализы;
  - сервисы (`services/`): аналитика, гипотезы, прогнозирование релизов;
  - схемы (`schemas/`), утилиты (`utils/`), константы (`constants/`);
  - модуль ML-прогнозирования (`release_forecasting/`) и артефакты моделей.
- `frontend/` — клиентская часть на React + Vite (основной UI и экспорт pitch-пакета).
- `etc/` — служебные файлы окружения (например, каталог `keys/`).

## Быстрый запуск (локально)

Требования: `Python 3.11+`, `Node.js 20+`, `npm`.

1. Запуск backend:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Минимум для `backend/.env` (по необходимости):
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `ANALYSIS_API_URL`, `SECOND_SERVICE_URL`
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_URL`

2. Запуск frontend (в новом терминале):

```powershell
cd frontend
npm ci
npm run dev
```

`frontend/.env.development`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_BACKEND_API_URL=http://127.0.0.1:8000
VITE_AUTH_API_URL=http://127.0.0.1:8005
```

После запуска:
- frontend: `http://localhost:5173`
- backend: `http://localhost:8000`

