layout_dark = dict(
    template="plotly_dark",
    paper_bgcolor="#0A0F18",
    plot_bgcolor="#0A0F18",
    font=dict(color="white", family="Onest SemiBold, Inter, sans-serif"),
)

COLORS = ["#ff5620",
            "#ff7016",
            "#ff880b",
            "#ff9f06",
            "#ffb50f",
            "#ffca20",
            "#ffdf33",
            "#fff349",
            "#ff790b",
            "#fff2d8",
            "#ffc132" ]

colorscale = [
    [0.00, "#f9d0b1"],  # минимум
    [0.15, "#ffa86d"],  # промежуточный (между white и #ffd9dd)
    [0.30, "#ff9c5f"],
    [0.45, "#ff9051"],
    [0.60, "#ff8344"],
    [0.75, "#ff7637"],
    [0.90, "#ff672b"],  # промежуточный (между #f0627f и #e52862)
    [1.00, "#ff3e20"],  # максимум
]

TEXTS = {
    "ru": {
        "other": "Другое",
        "month": "Месяц",
        "count_lbl": "Количество",
        "revenue_lbl": "Выручка",
        "players_lbl": "Игроки",
        "lang_axis": "Язык",
        "games_count_axis": "Количество игр",

        "dynamics": {
            "title": "Динамика релизов",
            "trace": "Релизы",
            "desc": "Количество релизов в Steam в указанный период времени."
        },
        "pub_types": {
            "title": "Класс разработчика",
            "desc": "Сегментация разработчиков по уровню ресурсов и масштабу проектов. Hobbyist — микрокоманды, Indie — независимые студии, AA — средний бюджет, AAA — крупные студии, Unknown — недостаточно информации для классификации."
        },
        "genre_count": {
            "title": "Распределение игр по жанрам",
            "desc": "Доля игр в указанных жанрах от общего числа доступных игр в Steam."
        },
        "genre_rev": {
            "title": "Распределение выручки по жанрам",
            "desc": "Доля выручки игр в указанных жанрах от всей выручки игр в Steam."
        },
        "genre_ccu": {
            "title": "Распределение игроков по жанру",
            "desc": "Доля игроков в указанных жанрах от числа всех игроков в Steam."
        },
        "langs_if": {
            "title": "Локализация интерфейсов",
            "desc": "Распределение игр по языкам локализации интерфейса в указанной выборке. Доля рассчитана по количеству игр."
        },
        "seasonality": {
            "title": "Сезонность релизов",
            "desc": "Распределение количества релизов в Steam по месяцам в указанной выборке."
        },
        "tag_share": {
            "title": "Распределение тегов",
            "desc": "Распределение долей тегов в Steam в указанной выборке по количеству игр с тегом."
        },
        "tag_rev": {
            "title": "Выручка по тегам",
            "desc": "Топ-20 тегов по суммарной выручке игр в Steam в указанной выборке."
        },
        "loc_bar": {
            "title": "Локализация: языки озвучек и интерфейсов",
            "trace_if": "Интерфейс",
            "trace_audio": "Озвучка",
            "desc": "Сравнение количества игр в Steam с локализацией интерфейса и озвучки по языкам в указанной выборке."
        },
        "heatmap": {
            "title": "Совместная встречаемость тегов",
            "desc": "Распределение частоты совместного использования тегов в Steam в указанной выборке. Матрица по парам тегов: совместная встречаемость, средняя выручка, средний playtime, средняя цена и средняя прибыль (оценка)."
        },

        "months": {
            1: 'Янв', 2: 'Фев', 3: 'Март', 4: 'Апр', 5: 'Май', 6: 'Июнь',
            7: 'Июль', 8: 'Авг', 9: 'Сен', 10: 'Окт', 11: 'Ноя', 12: 'Дек'
        }
    },
    "eng": {
        "other": "Other",
        "month": "Month",
        "count_lbl": "Count",
        "revenue_lbl": "Revenue",
        "players_lbl": "Players",
        "lang_axis": "Language",
        "games_count_axis": "Number of Games",

        "dynamics": {
            "title": "Release dynamics",
            "trace": "Releases",
            "desc": "Number of releases on Steam in the specified time period."
        },
        "pub_types": {
            "title": "Developer tier",
            "desc": "A segmentation of studios by scale and production capacity. Hobbyist — micro teams, Indie — independent studios, AA — mid-budget teams, AAA — large companies, Unknown — data isn’t sufficient to assign a tier."
        },
        "genre_count": {
            "title": "Game distribution by genre",
            "desc": "The share of games in the specified genres from the total number of games available on Steam."
        },
        "genre_rev": {
            "title": "Revenue distribution by genre",
            "desc": "The share of revenue from games in the specified genres from all game revenue on Steam."
        },
        "genre_ccu": {
            "title": "Distribution of players by genre",
            "desc": "The percentage of players in the specified genres out of all Steam players."
        },
        "langs_if": {
            "title": "Interface localization",
            "desc": "Distribution of games by interface localization language in the specified sample. The share is calculated based on the number of games."
        },
        "seasonality": {
            "title": "Release seasonality",
            "desc": "Distribution of the number of releases on Steam by month in the specified sample."
        },
        "tag_share": {
            "title": "Tag distribution",
            "desc": "Distribution of tag shares on Steam within the selected dataset by number of games with the tag."
        },
        "tag_rev": {
            "title": "Revenue by tags",
            "desc": "Top 20 tags by total game revenue on Steam within the selected dataset."
        },
        "loc_bar": {
            "title": "Localization: voice and interface languages",
            "trace_if": "Interface",
            "trace_audio": "Audio",
            "desc": "Comparison of the number of Steam games with interface and voice localization by language within the selected dataset."
        },
        "heatmap": {
            "title": "Tag co-occurrence",
            "desc": "Distribution of tag co-occurrence in Steam within the selected dataset. Tag-pair matrix with switchable metrics: co-occurrence count, average revenue, average playtime, average price, and estimated average profit."
        },

        "months": {
            1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
            7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
        }
    }
}