# Release Forecasting

Пайплайн обучения моделей прогноза `количества релизов` на горизонтах `3/6/9/12/24` месяцев для пользовательских фильтров по базовым полям:

- `genres`
- `tags`
- `categories`
- `languages` (`supported_languages` в данных)

## Что делает пайплайн

1. Загружает `games.json`, нормализует multi-label поля.
2. Выбрасывает последний частичный месяц (по cutoff дня, по умолчанию `<= 7`).
3. Генерирует пространство валидных фильтров (single-token + случайные комбинации).
4. Строит исторические месячные ряды для каждого фильтра.
5. Формирует supervised-датасет для каждого горизонта.
6. Обучает XGBoost с выбором лучшего пресета по валидации.
7. Сравнивает с baseline `seasonal naive`.
8. Сохраняет модели, метаданные и метрики.

## Запуск обучения

Из каталога `backend`:

```bash
python -m release_forecasting.train ^
  --data-path "C:\Users\maxmm\Desktop\GG\archive (1)\games.json" ^
  --artifacts-dir "release_forecasting/artifacts" ^
  --max-filters 1400 ^
  --min-games-per-filter 40
```

## Артефакты

После обучения:

- `release_forecasting/artifacts/models/h3_xgb.joblib`
- `release_forecasting/artifacts/models/h6_xgb.joblib`
- `release_forecasting/artifacts/models/h9_xgb.joblib`
- `release_forecasting/artifacts/models/h12_xgb.joblib`
- `release_forecasting/artifacts/models/h24_xgb.joblib`
- `release_forecasting/artifacts/metadata.json`
- `release_forecasting/artifacts/metrics.json`
- `release_forecasting/artifacts/filter_space.jsonl`

## Инференс для конкретного фильтра

```bash
python -m release_forecasting.predict ^
  --data-path "C:\Users\maxmm\Desktop\GG\archive (1)\games.json" ^
  --artifacts-dir "release_forecasting/artifacts" ^
  --filter "{\"genres\":[\"Action\"],\"tags\":[\"Singleplayer\"],\"categories\":[],\"languages\":[\"English\"]}"
```

