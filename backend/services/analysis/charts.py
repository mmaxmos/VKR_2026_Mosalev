import logging
import traceback
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from constants.consts import COLORS, TEXTS, colorscale, layout_dark
from utils.database import db
from schemas.request import GameAnalysisRequest
from schemas.response import GameAnalysisResponse, PlotlyChart

logger = logging.getLogger(__name__)


def _build_main_filters(request: GameAnalysisRequest) -> Tuple[str, List[Any]]:
    clauses: List[str] = []
    params: List[Any] = []
    param_index = 1

    if request.copiesSoldFrom is not None:
        clauses.append(f'"copiessold" >= ${param_index}')
        params.append(request.copiesSoldFrom)
        param_index += 1
    if request.copiesSoldTo is not None:
        clauses.append(f'"copiessold" <= ${param_index}')
        params.append(request.copiesSoldTo)
        param_index += 1
    if request.priceFrom is not None:
        clauses.append(f'price >= ${param_index}')
        params.append(request.priceFrom)
        param_index += 1
    if request.priceTo is not None:
        clauses.append(f'price <= ${param_index}')
        params.append(request.priceTo)
        param_index += 1
    if request.revenueFrom is not None:
        clauses.append(f'revenue >= ${param_index}')
        params.append(request.revenueFrom)
        param_index += 1
    if request.revenueTo is not None:
        clauses.append(f'revenue <= ${param_index}')
        params.append(request.revenueTo)
        param_index += 1
    if request.ratingFrom is not None:
        clauses.append(f'"reviewscore" >= ${param_index}')
        params.append(request.ratingFrom)
        param_index += 1
    if request.ratingTo is not None:
        clauses.append(f'"reviewscore" <= ${param_index}')
        params.append(request.ratingTo)
        param_index += 1
    if request.playtimeFrom is not None:
        clauses.append(f'"Average playtime forever" >= ${param_index}')
        params.append(request.playtimeFrom)
        param_index += 1
    if request.playtimeTo is not None:
        clauses.append(f'"Average playtime forever" <= ${param_index}')
        params.append(request.playtimeTo)
        param_index += 1
    if request.publishers:
        clauses.append(f'publishers = ANY(${param_index})')
        params.append(request.publishers)
        param_index += 1
    if request.developers:
        clauses.append(f'developers = ANY(${param_index})')
        params.append(request.developers)
        param_index += 1
    if request.publisherClass:
        clauses.append(f'"publisherclass" = ANY(${param_index})')
        params.append(request.publisherClass)
        param_index += 1

    if clauses:
        return 'WHERE ' + ' AND '.join(clauses), params
    return '', []


def _apply_filters(request: GameAnalysisRequest) -> Tuple[str, List[Any]]:
    where_sql, params = _build_main_filters(request)

    language_equiv = {'русский': 'russian', 'русский язык': 'russian', 'руський': 'russian'}
    filter_parts = []
    if where_sql:
        filter_parts.append(where_sql[6:])

    param_index = len(params) + 1

    def _normalize_list(values: Optional[List[str]]) -> List[str]:
        if not values:
            return []
        out = []
        for value in values:
            if not value:
                continue
            s = value.strip().lower()
            if s in language_equiv:
                s = language_equiv[s]
            out.append(s)
        return out

    if request.genres:
        normalized = _normalize_list(request.genres)
        if normalized:
            filter_parts.append(f'trim(lower(g_filt)) = ANY(${param_index})')
            params.append(normalized)
            param_index += 1

    if request.tags:
        normalized = _normalize_list(request.tags)
        if normalized:
            filter_parts.append(f'trim(lower(t_filt)) = ANY(${param_index})')
            params.append(normalized)
            param_index += 1

    if request.languages:
        normalized = _normalize_list(request.languages)
        if normalized:
            filter_parts.append(f'trim(lower(l_filt)) = ANY(${param_index})')
            params.append(normalized)
            param_index += 1

    if filter_parts:
        return 'WHERE ' + ' AND '.join(filter_parts), params
    return '', []


async def build_response(request: GameAnalysisRequest) -> List[Any]:
    logger.info("Building response with ALL charts + New Requirements...")

    where_sql, params = _apply_filters(request)

    query = """
        SELECT DISTINCT
            mg."Release date",
            mg."genres",
            mg."tags",
            mg."Supported languages",
            mg."Full audio languages",
            mg."publisherclass",
            mg.revenue,
            mg."Average playtime forever",
            mg."Peak CCU",
            mg.price,
            mg.reviewscore,
            mg.positive,
            mg.negative
        FROM main_games mg
    """

    if request.genres:
        query += ' JOIN LATERAL regexp_split_to_table(mg."genres", E\'[;,]\') AS g_filt ON TRUE'
    if request.tags:
        query += ' JOIN LATERAL regexp_split_to_table(mg."tags", E\'[;,]\') AS t_filt ON TRUE'
    if request.languages:
        query += ' JOIN LATERAL regexp_split_to_table(mg."Supported languages", E\'[;,]\') AS l_filt ON TRUE'

    if where_sql:
        query += f" {where_sql}"

    try:
        logger.info("Executing database query for game analysis...")
        raw_data = await db.execute_query(query, tuple(params))

        if not raw_data:
            logger.warning("No data found for the given filters")
            empty_resp = GameAnalysisResponse(success=True, plots=[], meta={"msg": "No data found"})
            return [{"ru": empty_resp, "eng": empty_resp}, {}]

        logger.info(f"Retrieved {len(raw_data)} records from database")

        df = pd.DataFrame(raw_data)

        numeric_cols = [
            'revenue',
            'Peak CCU',
            'price',
            'reviewscore',
            'positive',
            'negative',
            'Average playtime forever',
        ]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # Use a conservative proxy for profit until a true cost model is available.
        df['profit_estimate'] = df['revenue'] * 0.3

        df['total_reviews'] = df['positive'] + df['negative']
        df['pos_ratio'] = np.where(df['total_reviews'] > 0, (df['positive'] / df['total_reviews']) * 100, np.nan)

        def safe_val(val, default=0):
            if pd.isna(val) or val is None:
                return default
            return val

        metrics = {
            "games_count": int(len(df)),
            "total_ccu": int(safe_val(df['Peak CCU'].sum())),
            "median_peak_ccu": float(safe_val(df['Peak CCU'].median())),
            "avg_peak_ccu": float(safe_val(df['Peak CCU'].mean())),
            "total_revenue": float(safe_val(df['revenue'].sum())),
            "median_revenue": float(safe_val(df['revenue'].median())),
            "avg_revenue": float(safe_val(df['revenue'].mean())),
            "median_price": float(safe_val(df['price'].median())),
            "avg_price": float(safe_val(df['price'].mean())),
            "min_price": float(safe_val(df['price'].min())),
            "max_price": float(safe_val(df['price'].max())),
            "avg_review_score": float(safe_val(df['reviewscore'].mean())),
            "avg_positive_reviews": float(safe_val(df['positive'].mean())),
            "avg_negative_reviews": float(safe_val(df['negative'].mean())),
            "avg_positive_ratio": float(safe_val(df['pos_ratio'].mean())),
        }

        df['dt'] = pd.to_datetime(df['Release date'], format='%b %d, %Y', errors='coerce')
        if request.releaseStart:
            rs = pd.to_datetime(request.releaseStart, errors='coerce')
            if pd.notna(rs):
                df = df[df['dt'] >= rs]
        if request.releaseFinish:
            rf = pd.to_datetime(request.releaseFinish, errors='coerce')
            if pd.notna(rf):
                df = df[df['dt'] <= rf]

        df['month_str'] = df['dt'].dt.to_period('M').astype(str)

        def clean_list(lst):
            if not isinstance(lst, list):
                return []
            return [x.strip() for x in lst if x and x.strip()]

        for col in ['genres', 'tags', 'Supported languages', 'Full audio languages']:
            if col in df.columns:
                df[col] = df[col].fillna("").astype(str).str.split(r'[;,]')
                df[col] = df[col].apply(clean_list)

        def _get_layout_with_desc(chart_key: str, lang: str):
            t_data = TEXTS[lang].get(chart_key, {})
            title_text = t_data.get("title", "")
            desc_text = t_data.get("desc", "")
            layout = layout_dark.copy()
            layout["title"] = title_text
            layout["meta"] = {"description": desc_text}
            return layout

        exploded_genres = df.explode('genres') if 'genres' in df.columns else pd.DataFrame()
        exploded_tags = df.explode('tags') if 'tags' in df.columns else pd.DataFrame()
        exploded_langs = (
            df.explode('Supported languages') if 'Supported languages' in df.columns else pd.DataFrame()
        )
        exploded_audio = (
            df.explode('Full audio languages') if 'Full audio languages' in df.columns else pd.DataFrame()
        )

        def prepare_pie_data_exploded(
            exploded, label_col, value_col=None, top_n=10, other_label="Other"
        ):
            if exploded.empty:
                return pd.DataFrame()

            if value_col:
                grouped = exploded.groupby(label_col)[value_col].sum().reset_index()
                grouped.columns = ['label', 'value']
                grouped = grouped.sort_values('value', ascending=False)
            else:
                grouped = exploded[label_col].value_counts().reset_index()
                grouped.columns = ['label', 'value']

            grouped = grouped[grouped['label'] != ""]

            if len(grouped) > top_n:
                top = grouped.head(top_n - 1).copy()
                other_val = grouped.iloc[top_n - 1:]['value'].sum()
                other_row = pd.DataFrame([{'label': other_label, 'value': other_val}])
                return pd.concat([top, other_row], ignore_index=True)
            return grouped

        def _to_numeric_list(values: List[Any]) -> List[float]:
            numeric: List[float] = []
            for v in values:
                if v is None or pd.isna(v):
                    continue
                try:
                    numeric.append(float(v))
                except (TypeError, ValueError):
                    continue
            return numeric

        def _series_summary(values: List[Any]) -> Dict[str, Any]:
            arr = _to_numeric_list(values)
            if not arr:
                return {
                    "count": 0,
                    "sum": 0.0,
                    "mean": 0.0,
                    "median": 0.0,
                    "min": 0.0,
                    "max": 0.0,
                    "avg_derivative": 0.0,
                }
            derivatives = [arr[i] - arr[i - 1] for i in range(1, len(arr))]
            return {
                "count": len(arr),
                "sum": float(np.sum(arr)),
                "mean": float(np.mean(arr)),
                "median": float(np.median(arr)),
                "min": float(np.min(arr)),
                "max": float(np.max(arr)),
                "avg_derivative": float(np.mean(derivatives)) if derivatives else 0.0,
            }

        def _trace_aggregates(trace: Dict[str, Any]) -> Dict[str, Any]:
            if "z" in trace and isinstance(trace.get("z"), list):
                flattened: List[Any] = []
                for row in trace["z"]:
                    if isinstance(row, list):
                        flattened.extend(row)
                return _series_summary(flattened)
            if "values" in trace and isinstance(trace.get("values"), list):
                return _series_summary(trace["values"])
            if "y" in trace and isinstance(trace.get("y"), list):
                return _series_summary(trace["y"])
            return {}

        def _plot_aggregates(data: List[Dict[str, Any]]) -> Dict[str, Any]:
            per_trace: List[Dict[str, Any]] = []
            merged_values: List[float] = []

            for idx, trace in enumerate(data):
                tr_summary = _trace_aggregates(trace)
                if tr_summary:
                    per_trace.append(
                        {
                            "trace_index": idx,
                            "trace_name": trace.get("name") or f"trace_{idx}",
                            **tr_summary,
                        }
                    )
                    if "z" in trace and isinstance(trace.get("z"), list):
                        for row in trace["z"]:
                            if isinstance(row, list):
                                merged_values.extend(_to_numeric_list(row))
                    elif "values" in trace and isinstance(trace.get("values"), list):
                        merged_values.extend(_to_numeric_list(trace["values"]))
                    elif "y" in trace and isinstance(trace.get("y"), list):
                        merged_values.extend(_to_numeric_list(trace["y"]))

            return {
                "trace_count": len(data),
                "overall": _series_summary(merged_values),
                "traces": per_trace,
            }

        def _build_plot(chart_id: str, data: List[Dict[str, Any]], layout: Dict[str, Any]) -> PlotlyChart:
            return PlotlyChart(id=chart_id, data=data, layout=layout, aggregates=_plot_aggregates(data))

        def _generate_plots(lang: str) -> List[PlotlyChart]:
            plots: List[PlotlyChart] = []
            texts = TEXTS[lang]

            if 'month_str' in df.columns:
                monthly = df.groupby('month_str').size().reset_index(name='cnt')
                monthly = monthly.sort_values('month_str')

                layout = _get_layout_with_desc("dynamics", lang)
                layout["xaxis"] = {"title": texts["month"]}

                plots.append(
                    _build_plot(
                        "release_dynamics",
                        [
                            {
                                "x": monthly['month_str'].tolist(),
                                "y": monthly['cnt'].tolist(),
                                "type": "scatter",
                                "mode": "lines+markers",
                                "name": texts["dynamics"]["trace"],
                                "line": {"color": COLORS[0], "width": 3},
                            }
                        ],
                        layout,
                    )
                )

            if 'dt' in df.columns:
                df_dates = df[df['dt'].notna()].copy()
                seasonal_counts = (
                    df_dates.groupby(df_dates['dt'].dt.month)
                    .size()
                    .reindex(range(1, 13), fill_value=0)
                    .reset_index()
                )
                seasonal_counts.columns = ['month_idx', 'cnt']
                seasonal_counts['label'] = seasonal_counts['month_idx'].map(texts["months"])

                layout = _get_layout_with_desc("seasonality", lang)
                layout["barcornerradius"] = 5

                plots.append(
                    _build_plot(
                        "release_seasonality",
                        [
                            {
                                "x": seasonal_counts['label'].tolist(),
                                "y": seasonal_counts['cnt'].tolist(),
                                "type": "bar",
                                "marker": {"color": COLORS[1]},
                            }
                        ],
                        layout,
                    )
                )

            if 'publisherclass' in df.columns:
                p_counts = df['publisherclass'].fillna("Unknown").value_counts().reset_index()
                p_counts.columns = ['label', 'value']
                if len(p_counts) > 10:
                    top_p = p_counts.head(9)
                    rest_p = p_counts.iloc[9:]['value'].sum()
                    p_counts = pd.concat(
                        [top_p, pd.DataFrame([{'label': texts["other"], 'value': rest_p}])],
                        ignore_index=True,
                    )

                plots.append(
                    _build_plot(
                        "publisher_tier_share",
                        [
                            {
                                "labels": p_counts['label'].tolist(),
                                "values": p_counts['value'].tolist(),
                                "type": "pie",
                                "hole": 0.4,
                                "marker": {"colors": COLORS * 2},
                            }
                        ],
                        _get_layout_with_desc("pub_types", lang),
                    )
                )

            genre_cnt_df = prepare_pie_data_exploded(
                exploded_genres, 'genres', value_col=None, top_n=10, other_label=texts["other"]
            )
            if not genre_cnt_df.empty:
                req_genres = [g.lower().strip() for g in (request.genres or [])]
                cols = []
                color_idx = 0
                for lbl in genre_cnt_df['label']:
                    if lbl == texts["other"]:
                        cols.append("#ffffff")
                    elif lbl.lower() in req_genres:
                        cols.append("#ff3e20")
                    else:
                        cols.append(COLORS[color_idx % len(COLORS)])
                        color_idx += 1

                plots.append(
                    _build_plot(
                        "genre_share_count",
                        [
                            {
                                "labels": genre_cnt_df['label'].tolist(),
                                "values": genre_cnt_df['value'].tolist(),
                                "type": "pie",
                                "hole": 0.4,
                                "marker": {"colors": cols},
                                "textinfo": "percent+label",
                                "hovertemplate": f"%{{label}}<br>{texts['count_lbl']}: %{{value}}<br>%{{percent}}<extra></extra>",
                            }
                        ],
                        _get_layout_with_desc("genre_count", lang),
                    )
                )

            genre_rev_df = prepare_pie_data_exploded(
                exploded_genres, 'genres', value_col='revenue', top_n=10, other_label=texts["other"]
            )
            if not genre_rev_df.empty:
                req_genres = [g.lower().strip() for g in (request.genres or [])]
                cols = []
                color_idx = 0
                for lbl in genre_rev_df['label']:
                    if lbl == texts["other"]:
                        cols.append("#ffffff")
                    elif lbl.lower() in req_genres:
                        cols.append("#ff3e20")
                    else:
                        cols.append(COLORS[color_idx % len(COLORS)])
                        color_idx += 1

                plots.append(
                    _build_plot(
                        "genre_share_revenue",
                        [
                            {
                                "labels": genre_rev_df['label'].tolist(),
                                "values": genre_rev_df['value'].tolist(),
                                "type": "pie",
                                "hole": 0.4,
                                "marker": {"colors": cols},
                                "textinfo": "percent+label",
                                "hovertemplate": f"%{{label}}<br>{texts['revenue_lbl']}: $%{{value}}<br>%{{percent}}<extra></extra>",
                            }
                        ],
                        _get_layout_with_desc("genre_rev", lang),
                    )
                )

            genre_ccu_df = prepare_pie_data_exploded(
                exploded_genres,
                'genres',
                value_col='Peak CCU',
                top_n=10,
                other_label=texts["other"],
            )
            if not genre_ccu_df.empty:
                req_genres = [g.lower().strip() for g in (request.genres or [])]
                cols = []
                color_idx = 0
                for lbl in genre_ccu_df['label']:
                    if lbl == texts["other"]:
                        cols.append("#ffffff")
                    elif lbl.lower() in req_genres:
                        cols.append("#ff3e20")
                    else:
                        cols.append(COLORS[color_idx % len(COLORS)])
                        color_idx += 1

                plots.append(
                    _build_plot(
                        "genre_share_players",
                        [
                            {
                                "labels": genre_ccu_df['label'].tolist(),
                                "values": genre_ccu_df['value'].tolist(),
                                "type": "pie",
                                "hole": 0.4,
                                "marker": {"colors": cols},
                                "textinfo": "percent+label",
                                "hovertemplate": f"%{{label}}<br>{texts['players_lbl']}: %{{value}}<br>%{{percent}}<extra></extra>",
                            }
                        ],
                        _get_layout_with_desc("genre_ccu", lang),
                    )
                )

            tags_cnt_df = prepare_pie_data_exploded(
                exploded_tags, 'tags', value_col=None, top_n=10, other_label=texts["other"]
            )
            if not tags_cnt_df.empty:
                plots.append(
                    _build_plot(
                        "tag_share",
                        [
                            {
                                "labels": tags_cnt_df['label'].tolist(),
                                "values": tags_cnt_df['value'].tolist(),
                                "type": "pie",
                                "hole": 0.4,
                                "marker": {"colors": COLORS * 2},
                                "textinfo": "percent+label",
                            }
                        ],
                        _get_layout_with_desc("tag_share", lang),
                    )
                )

            if not exploded_tags.empty:
                exploded_rev = exploded_tags
                exploded_rev['revenue'] = exploded_rev['revenue'].fillna(0)
                tag_rev = exploded_rev.groupby('tags')['revenue'].sum().reset_index()
                tag_rev = tag_rev.sort_values('revenue', ascending=False).head(20)
                tag_rev = tag_rev[tag_rev['tags'] != ""]

                layout = _get_layout_with_desc("tag_rev", lang)
                layout["barcornerradius"] = 5

                plots.append(
                    _build_plot(
                        "tag_revenue_top20",
                        [
                            {
                                "x": tag_rev['tags'].tolist(),
                                "y": tag_rev['revenue'].tolist(),
                                "type": "bar",
                                "marker": {"color": COLORS[3]},
                            }
                        ],
                        layout,
                    )
                )

            lang_cnt_df = prepare_pie_data_exploded(
                exploded_langs,
                'Supported languages',
                value_col=None,
                top_n=10,
                other_label=texts["other"],
            )
            if not lang_cnt_df.empty:
                plots.append(
                    _build_plot(
                        "localization_interface_share",
                        [
                            {
                                "labels": lang_cnt_df['label'].tolist(),
                                "values": lang_cnt_df['value'].tolist(),
                                "type": "pie",
                                "hole": 0.4,
                                "marker": {"colors": COLORS * 2},
                            }
                        ],
                        _get_layout_with_desc("langs_if", lang),
                    )
                )

            if_counts = prepare_pie_data_exploded(
                exploded_langs, 'Supported languages', top_n=10, other_label=texts["other"]
            )
            audio_counts = (
                exploded_audio['Full audio languages'].value_counts().reset_index()
                if not exploded_audio.empty
                else pd.DataFrame(columns=['label', 'value'])
            )
            if not audio_counts.empty:
                audio_counts.columns = ['label', 'value']

            if not if_counts.empty:
                top_langs = if_counts[if_counts['label'] != texts['other']]['label'].tolist()
                if_dict = dict(zip(if_counts['label'], if_counts['value']))
                audio_dict = dict(zip(audio_counts['label'], audio_counts['value']))

                y_axis = top_langs[::-1]
                x_if = [if_dict.get(l, 0) for l in y_axis]
                x_audio = [audio_dict.get(l, 0) for l in y_axis]

                layout = _get_layout_with_desc("loc_bar", lang)
                layout.update(
                    {
                        "barmode": "overlay",
                        "bargap": 0.2,
                        "bargroupgap": 0,
                        "barcornerradius": 5,
                        "xaxis": {"title": texts["lang_axis"], "type": "category", "tickangle": -45},
                        "yaxis": {"title": texts["games_count_axis"]},
                    }
                )

                plots.append(
                    _build_plot(
                        "localization_interface_vs_audio",
                        [
                            {
                                "type": "bar",
                                "x": y_axis,
                                "y": x_if,
                                "name": texts["loc_bar"]["trace_if"],
                                "marker": {"color": COLORS[0]},
                                "width": 0.8,
                            },
                            {
                                "type": "bar",
                                "x": y_axis,
                                "y": x_audio,
                                "name": texts["loc_bar"]["trace_audio"],
                                "marker": {"color": COLORS[6]},
                                "width": 0.8,
                            },
                        ],
                        layout,
                    )
                )

            tags_all_raw = prepare_pie_data_exploded(
                exploded_tags, 'tags', top_n=15, other_label=texts["other"]
            )
            if not tags_all_raw.empty:
                top_20_list = tags_all_raw[tags_all_raw['label'] != texts['other']]['label'].tolist()
                filtered_tags = exploded_tags[exploded_tags['tags'].isin(top_20_list)]

                if not filtered_tags.empty:
                    matrix = pd.crosstab(filtered_tags.index, filtered_tags['tags']).clip(upper=1)
                    matrix_np = matrix.to_numpy(dtype=float)

                    count_matrix = matrix_np.T @ matrix_np
                    np.fill_diagonal(count_matrix, 0)

                    game_indices = matrix.index

                    def _avg_pair_matrix(metric_col: str) -> np.ndarray:
                        metric_values = (
                            df.loc[game_indices, metric_col]
                            .fillna(0)
                            .to_numpy(dtype=float)
                        )
                        weighted = (matrix_np * metric_values[:, None]).T @ matrix_np
                        avg = np.divide(
                            weighted,
                            count_matrix,
                            out=np.zeros_like(weighted, dtype=float),
                            where=count_matrix > 0,
                        )
                        np.fill_diagonal(avg, 0)
                        return avg

                    avg_revenue_matrix = _avg_pair_matrix('revenue')
                    avg_playtime_matrix = _avg_pair_matrix('Average playtime forever')
                    avg_price_matrix = _avg_pair_matrix('price')
                    avg_profit_matrix = _avg_pair_matrix('profit_estimate')

                    metric_matrices = {
                        "cooccurrence_count": count_matrix.tolist(),
                        "avg_revenue": avg_revenue_matrix.tolist(),
                        "avg_playtime": avg_playtime_matrix.tolist(),
                        "avg_price": avg_price_matrix.tolist(),
                        "avg_profit": avg_profit_matrix.tolist(),
                    }

                    customdata = []
                    for i in range(count_matrix.shape[0]):
                        row = []
                        for j in range(count_matrix.shape[1]):
                            row.append(
                                [
                                    int(count_matrix[i, j]),
                                    float(avg_revenue_matrix[i, j]),
                                    float(avg_playtime_matrix[i, j]),
                                    float(avg_price_matrix[i, j]),
                                    float(avg_profit_matrix[i, j]),
                                ]
                            )
                        customdata.append(row)

                    if lang == "ru":
                        metric_labels = {
                            "cooccurrence_count": "Количество совместных вхождений",
                            "avg_revenue": "Средняя выручка",
                            "avg_playtime": "Средний playtime",
                            "avg_price": "Средняя цена",
                            "avg_profit": "Средняя прибыль (оценка)",
                        }
                    else:
                        metric_labels = {
                            "cooccurrence_count": "Co-occurrence count",
                            "avg_revenue": "Average revenue",
                            "avg_playtime": "Average playtime",
                            "avg_price": "Average price",
                            "avg_profit": "Average profit (estimate)",
                        }

                    layout = _get_layout_with_desc("heatmap", lang)
                    layout["defaultMetric"] = "cooccurrence_count"
                    layout["metricMatrices"] = metric_matrices
                    layout["heatmapMetrics"] = [
                        {"key": key, "label": label}
                        for key, label in metric_labels.items()
                    ]

                    heatmap_data = [
                        {
                            "x": matrix.columns.tolist(),
                            "y": matrix.columns.tolist(),
                            "z": metric_matrices["cooccurrence_count"],
                            "type": "heatmap",
                            "colorscale": colorscale,
                            "customdata": customdata,
                            "hovertemplate": (
                                "%{y} × %{x}<br>"
                                + f"{metric_labels['cooccurrence_count']}: %{{customdata[0]}}<br>"
                                + f"{metric_labels['avg_revenue']}: $%{{customdata[1]:,.0f}}<br>"
                                + f"{metric_labels['avg_playtime']}: %{{customdata[2]:,.0f}}<br>"
                                + f"{metric_labels['avg_price']}: $%{{customdata[3]:,.2f}}<br>"
                                + f"{metric_labels['avg_profit']}: $%{{customdata[4]:,.0f}}<extra></extra>"
                            ),
                        }
                    ]

                    heatmap_chart = _build_plot("tags_heatmap", heatmap_data, layout)
                    if heatmap_chart.aggregates is None:
                        heatmap_chart.aggregates = {}
                    heatmap_chart.aggregates["metric_summaries"] = {
                        k: _series_summary(
                            [float(val) for row in v for val in row if float(val) > 0]
                        )
                        for k, v in metric_matrices.items()
                    }
                    plots.append(heatmap_chart)

            return plots

        plots_ru = _generate_plots("ru")
        plots_eng = _generate_plots("eng")

        response_dict = {
            "ru": GameAnalysisResponse(success=True, plots=plots_ru, meta={"count": len(df)}),
            "eng": GameAnalysisResponse(success=True, plots=plots_eng, meta={"count": len(df)}),
        }

        logger.info(f"Successfully built response with {len(plots_ru)} plots")
        return [response_dict, metrics]

    except Exception as exc:
        logger.error(f"Error building response: {exc}")
        logger.debug(traceback.format_exc())
        err_resp = GameAnalysisResponse(success=False, plots=[], meta={"error": str(exc)})
        return [{"ru": err_resp, "eng": err_resp}, {}]
