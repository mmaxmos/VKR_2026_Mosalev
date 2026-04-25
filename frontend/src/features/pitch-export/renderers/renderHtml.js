import { buildRadarSvg } from '../utils/plotlyExport';
import logoSvgRaw from '../assets/gameglory-logo.svg?raw';

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const logoSvgDataUri = () => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(logoSvgRaw)))}`;
const gameglorySiteUrl = 'https://gameglory.studio';

const resolveSteamUrl = (game) => {
    if (!game || typeof game !== 'object') return '';
    const explicitUrl = game.steamUrl || game.steam_url || game.steamLink || game.steam_link || game.url;
    if (explicitUrl) return String(explicitUrl);
    if (game.id) return `https://store.steampowered.com/app/${encodeURIComponent(String(game.id))}`;
    return '';
};

const aspectOrder = ['niche', 'story', 'visual', 'gameplay', 'innovation', 'monetization'];
const aspectLabelKeyByScoreKey = {
    niche: 'aspectNiche',
    story: 'aspectStory',
    visual: 'aspectVisual',
    gameplay: 'aspectGameplay',
    innovation: 'aspectInnovation',
    monetization: 'aspectMonetization',
};

const isFullWidthPlot = (title) => {
    const normalized = String(title || '').toLowerCase();
    const patterns = [
        'динамика релизов',
        'release dynamics',
        'выручка по тегам',
        'revenue by tags',
        'совместная встречаемость тегов',
        'tag co-occurrence',
        'co-occurrence of tags',
    ];
    return patterns.some((pattern) => normalized.includes(pattern));
};

const safeJson = (value) => JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const normalizePlotDataForExport = (data = []) => (Array.isArray(data) ? data : []).map((trace) => {
    if (!trace || typeof trace !== 'object') return trace;
    if (String(trace.type || '').toLowerCase() !== 'pie') return trace;

    return {
        ...trace,
        showlegend: trace.showlegend ?? true,
        textinfo: 'none',
        texttemplate: '',
        textposition: 'none',
    };
});

const normalizePlotLayoutForTheme = (layout = {}, theme = 'light') => {
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#D3D8E4' : '#1E232F';
    const gridColor = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(10,15,24,0.14)';
    const zeroLineColor = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(10,15,24,0.2)';
    const axisLineColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,15,24,0.25)';

    const normalized = {
        ...(layout || {}),
        font: {
            ...((layout || {}).font || {}),
            color: axisColor,
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        legend: {
            ...((layout || {}).legend || {}),
            font: {
                ...(((layout || {}).legend || {}).font || {}),
                color: axisColor,
            },
        },
    };

    if (typeof normalized.title === 'string') {
        normalized.title = {
            text: normalized.title,
            font: { color: axisColor },
        };
    } else if (normalized.title && typeof normalized.title === 'object') {
        normalized.title = {
            ...normalized.title,
            font: {
                ...(normalized.title.font || {}),
                color: axisColor,
            },
        };
    }

    const applyAxisTheme = (axis = {}) => ({
        ...(axis || {}),
        visible: true,
        showticklabels: true,
        automargin: true,
        tickfont: {
            ...((axis || {}).tickfont || {}),
            color: axisColor,
        },
        title: (axis || {}).title
            ? {
                ...((axis || {}).title || {}),
                font: {
                    ...((((axis || {}).title || {}).font) || {}),
                    color: axisColor,
                },
            }
            : (axis || {}).title,
        gridcolor: gridColor,
        zerolinecolor: zeroLineColor,
        linecolor: axisLineColor,
    });

    Object.keys(normalized)
        .filter((key) => /^(xaxis|yaxis)(\d+)?$/i.test(key))
        .forEach((axisKey) => {
            normalized[axisKey] = applyAxisTheme(normalized[axisKey]);
        });

    if (Array.isArray(normalized.annotations)) {
        normalized.annotations = normalized.annotations.map((annotation) => ({
            ...annotation,
            font: {
                ...(annotation?.font || {}),
                color: axisColor,
            },
        }));
    }

    Object.keys(normalized)
        .filter((key) => /^coloraxis(\d+)?$/i.test(key))
        .forEach((key) => {
            const colorAxis = normalized[key] || {};
            normalized[key] = {
                ...colorAxis,
                colorbar: {
                    ...(colorAxis.colorbar || {}),
                    tickfont: {
                        ...(colorAxis.colorbar?.tickfont || {}),
                        color: axisColor,
                    },
                    title: colorAxis.colorbar?.title
                        ? {
                            ...(colorAxis.colorbar.title || {}),
                            font: {
                                ...(colorAxis.colorbar.title?.font || {}),
                                color: axisColor,
                            },
                        }
                        : colorAxis.colorbar?.title,
                },
            };
        });

    // Plot title is rendered outside in the card header, so we hide in-frame title.
    delete normalized.title;

    return normalized;
};

const copyByLang = {
    ru: {
        pitchPack: 'PITCH PACK',
        titleSuffix: 'Питч-пак',
        summary: 'Сводка',
        aiAnalysis: 'AI-анализ и рыночное позиционирование',
        avgRevenueByMarket: 'Средняя выручка по рынку',
        medianRevenueByMarket: 'Медианная выручка по рынку',
        minMaxGamePrice: 'Мин. / макс. цена игры',
        foundGames: 'Найдено игр',
        topComparableTitles: 'Топ похожих игр',
        marketAnalysis: 'Анализ рынка',
        competitorsOverview: 'Обзор конкурентов',
        chartUnavailable: 'График недоступен',
        risksAndMitigation: 'Риски и пути снижения',
        resourceDilemma: 'Ресурсная дилемма',
        asIs: 'Как сейчас (As Is)',
        aiRecommendation: 'Рекомендация от AI',
        expectedOutcome: 'Ожидаемый результат',
        gameTitleFallback: 'Название игры',
        positive: 'позитивных',
        reviews: 'отзывов',
        release: 'Релиз',
        price: 'Стоимость',
        peakCcu: 'Пик CCU',
        similarity: 'Сходство',
        budget: 'Бюджет',
        revenue: 'Выручка',
        developer: 'Разработчик',
        publisher: 'Издатель',
        openInSteam: 'Открыть в Steam',
        competitorsRevenue: 'Выручка конкурентов',
        competitorsMedianRevenue: 'Медианная выручка',
        competitorsAvgRevenue: 'Средняя выручка',
        competitorsAvgPrice: 'Средняя цена',
        tags: 'Теги игры',
        genres: 'Жанры',
        categories: 'Категории',
        description: 'Описание',
        aspectsCommentary: 'Комментарии по аспектам',
        aspectColumn: 'Аспект',
        commentaryColumn: 'Комментарий',
        aspectNiche: 'Ниша',
        aspectStory: 'Сюжет',
        aspectVisual: 'Графика',
        aspectGameplay: 'Геймплей',
        aspectInnovation: 'Инновация',
        aspectMonetization: 'Монетизация',
        marketCards: [
            ['Данные на сегодня', [
                ['Найдено игр', 'foundGames'],
                ['Медиана пик. CCU', 'avMedCCU'],
                ['CCU сегодня', 'totalCCU'],
            ]],
            ['Выручка', [
                ['Суммарная', 'totalRevenue'],
                ['Медианная', 'medianRevenue'],
                ['Средняя', 'avgRevenue'],
            ]],
            ['Цена игры', [
                ['Медианная', 'medianPrice'],
                ['Средняя', 'avgPrice'],
                ['Мин./макс.', 'minMaxPrice'],
            ]],
            ['Отзывы и CCU', [
                ['Медиана', 'avgReviewScore'],
                ['Среднее', 'avgPositiveReviews'],
                ['Средний CCU', 'avgNegativeReviews'],
            ]],
        ],
    },
    en: {
        pitchPack: 'PITCH PACK',
        titleSuffix: 'Pitch Pack',
        summary: 'Summary',
        aiAnalysis: 'AI Analysis & Market Positioning',
        avgRevenueByMarket: 'Average revenue by market',
        medianRevenueByMarket: 'Median revenue by market',
        minMaxGamePrice: 'Min / max game price',
        foundGames: 'Found games',
        topComparableTitles: 'Top Comparable Titles',
        marketAnalysis: 'Market Analysis',
        competitorsOverview: 'Competitors overview',
        chartUnavailable: 'Chart unavailable',
        risksAndMitigation: 'Risks & Mitigation',
        resourceDilemma: 'Resource dilemma',
        asIs: 'Current state (As Is)',
        aiRecommendation: 'AI recommendation',
        expectedOutcome: 'Expected outcome',
        gameTitleFallback: 'Game title',
        positive: 'positive',
        reviews: 'reviews',
        release: 'Release',
        price: 'Price',
        peakCcu: 'Peak CCU',
        similarity: 'Similarity',
        budget: 'Budget',
        revenue: 'Revenue',
        developer: 'Developer',
        publisher: 'Publisher',
        openInSteam: 'Open in Steam',
        competitorsRevenue: 'Competitors Revenue',
        competitorsMedianRevenue: 'Median Revenue',
        competitorsAvgRevenue: 'Average Revenue',
        competitorsAvgPrice: 'Average Price',
        tags: 'Game Tags',
        genres: 'Genres',
        categories: 'Categories',
        description: 'Description',
        aspectsCommentary: 'Aspect commentary',
        aspectColumn: 'Aspect',
        commentaryColumn: 'Commentary',
        aspectNiche: 'Niche',
        aspectStory: 'Story',
        aspectVisual: 'Visuals',
        aspectGameplay: 'Gameplay',
        aspectInnovation: 'Innovation',
        aspectMonetization: 'Monetization',
        marketCards: [
            ['Today metrics', [
                ['Found games', 'foundGames'],
                ['Median peak CCU', 'avMedCCU'],
                ['CCU today', 'totalCCU'],
            ]],
            ['Revenue', [
                ['Total', 'totalRevenue'],
                ['Median', 'medianRevenue'],
                ['Average', 'avgRevenue'],
            ]],
            ['Game price', [
                ['Median', 'medianPrice'],
                ['Average', 'avgPrice'],
                ['Min / max', 'minMaxPrice'],
            ]],
            ['Reviews and CCU', [
                ['Median score', 'avgReviewScore'],
                ['Average positive', 'avgPositiveReviews'],
                ['Average CCU', 'avgNegativeReviews'],
            ]],
        ],
    },
};

const themeTokens = (theme) => {
    if (theme === 'dark') {
        return {
            bg: '#0A0F18',
            page: '#101827',
            panel: '#1A2234',
            panelSoft: '#252F44',
            text: '#F3F5F8',
            muted: '#A8ACB6',
            border: 'rgba(255,255,255,0.08)',
            chip: '#3C455A',
            button: '#0A0F18',
        };
    }

    return {
        bg: '#ECEDEE',
        page: '#ECEDEE',
        panel: '#F4F5F6',
        panelSoft: '#FFFFFF',
        text: '#1E232F',
        muted: '#6F7074',
        border: 'rgba(10,15,24,0.08)',
        chip: '#E3E4E5',
        button: '#0A0F18',
    };
};

const buildCompetitorCard = (game, tokens, copy) => {
    const steamUrl = resolveSteamUrl(game);
    return `
<article class="comp-card" style="background:${tokens.panel}; border-color:${tokens.border};">
  ${game.image ? `<img class="comp-img" src="${escapeHtml(game.image)}" alt="${escapeHtml(game.title || '')}"/>` : ''}
  <h4>${escapeHtml(game.title || copy.gameTitleFallback)}</h4>
  <div class="badges">
    <span class="badge green">${escapeHtml(game.positiveReviewPercent || '-')} ${copy.positive}</span>
    <span class="badge">${escapeHtml(game.reviewCount || '-')} ${copy.reviews}</span>
  </div>
  <div class="kv-grid">
    <span>${copy.release}</span><span>${escapeHtml(game.releaseDate || '-')}</span>
    <span>${copy.price}</span><span>${escapeHtml(game.price || '-')}</span>
    <span>${copy.peakCcu}</span><span>${escapeHtml(game.peakCCU || '-')}</span>
    <span>${copy.similarity}</span><span>${escapeHtml(game.similarity || '-')}</span>
    <span>${copy.budget}</span><span>${escapeHtml(game.publisherClass || '-')}</span>
    <span>${copy.revenue}</span><span>${escapeHtml(game.estimatedRevenue || game.revenue || '-')}</span>
    <span>${copy.developer}</span><span>${escapeHtml(game.developer || '-')}</span>
    <span>${copy.publisher}</span><span>${escapeHtml(game.publisher || '-')}</span>
  </div>
  ${steamUrl
        ? `<a class="steam-btn" style="background:${tokens.button};display:flex;align-items:center;justify-content:center;text-decoration:none;" href="${escapeHtml(steamUrl)}" target="_blank" rel="noopener noreferrer">${copy.openInSteam}</a>`
        : `<button class="steam-btn" style="background:${tokens.button};">${copy.openInSteam}</button>`}
</article>`;
};

const chipList = (items = [], tokens) => {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!list.length) return `<span class="mini-chip" style="background:${tokens.chip};">-</span>`;
    return list.slice(0, 24)
        .map((item) => `<span class="mini-chip" style="background:${tokens.chip};">${escapeHtml(item)}</span>`)
        .join('');
};

const buildCompetitorOverviewCard = (game, tokens, copy) => {
    const steamUrl = resolveSteamUrl(game);
    const metrics = [
        [copy.release, game.releaseDate],
        [copy.price, game.price],
        [copy.peakCcu, game.peakCCU],
        [copy.similarity, game.similarity],
        [copy.budget, game.publisherClass],
        [copy.revenue, game.estimatedRevenue || game.revenue],
        [copy.developer, game.developer],
        [copy.publisher, game.publisher],
    ];

    return `
<article class="comp-overview-card" style="background:${tokens.panel};border-color:${tokens.border}">
  <div class="comp-overview-left" style="border-color:${tokens.border}">
    ${game.image ? `<img class="comp-overview-img" src="${escapeHtml(game.image)}" alt="${escapeHtml(game.title || '')}"/>` : `<div class="comp-overview-img comp-overview-img--placeholder"></div>`}
    <div class="comp-overview-head">
      <h3>${escapeHtml(game.title || copy.gameTitleFallback)}</h3>
      <div class="badges">
        <span class="badge green">${escapeHtml(game.positiveReviewPercent || '-')} ${copy.positive}</span>
        <span class="badge">${escapeHtml(game.reviewCount || '-')} ${copy.reviews}</span>
      </div>
    </div>
    ${steamUrl
        ? `<a class="steam-btn" style="background:${tokens.button};display:flex;align-items:center;justify-content:center;text-decoration:none;" href="${escapeHtml(steamUrl)}" target="_blank" rel="noopener noreferrer">${copy.openInSteam}</a>`
        : `<button class="steam-btn" style="background:${tokens.button};">${copy.openInSteam}</button>`}
  </div>
  <div class="comp-overview-right">
    <div class="comp-overview-metrics">
      ${metrics.map(([label, value]) => `
        <div class="ov-metric">
          <div class="ov-metric-label">${escapeHtml(label)}</div>
          <div class="ov-metric-value">${escapeHtml(value || '-')}</div>
        </div>
      `).join('')}
    </div>
    <div class="ov-group">
      <div class="ov-group-title">${escapeHtml(copy.tags)}</div>
      <div class="ov-chip-wrap">${chipList(game.tags, tokens)}</div>
    </div>
    <div class="ov-group">
      <div class="ov-group-title">${escapeHtml(copy.description)}</div>
      <div class="ov-description" style="border-color:${tokens.border};background:${tokens.page};color:${tokens.text};">${escapeHtml(game.description || '-')}</div>
    </div>
    <div class="ov-dual">
      <div class="ov-group">
        <div class="ov-group-title">${escapeHtml(copy.genres)}</div>
        <div class="ov-chip-wrap">${chipList(game.genres, tokens)}</div>
      </div>
      <div class="ov-group">
        <div class="ov-group-title">${escapeHtml(copy.categories)}</div>
        <div class="ov-chip-wrap">${chipList(game.categories, tokens)}</div>
      </div>
    </div>
  </div>
</article>`;
};

export const renderPitchPackHtml = ({ vm, plotImages = [], interactivePlots = false }) => {
    const tokens = themeTokens(vm.meta.theme);
    const copy = copyByLang[vm.meta.language] || copyByLang.en;
    const radarSvg = buildRadarSvg(vm.idea.scores, vm.meta.theme === 'dark', vm.meta.language);
    const riskAspectRows = aspectOrder.map((scoreKey) => {
        const labelKey = aspectLabelKeyByScoreKey[scoreKey];
        const aspectName = copy[labelKey] || scoreKey;
        const commentary = vm.idea.scores?.[scoreKey]?.reasoning || '-';
        return { aspectName, commentary };
    });

    const chipsSource = [
        ...vm.description.genres,
        ...vm.description.tags,
        ...vm.description.languages,
        ...vm.description.categories,
    ];
    const chips = [...new Set(chipsSource.filter(Boolean))].slice(0, 24)
        .map((chip) => `<span class="chip" style="background:${tokens.chip};">${escapeHtml(chip)}</span>`)
        .join('');

    const marketCards = copy.marketCards.map(([title, rows]) => ([
        title,
        rows.map(([label, key]) => [label, vm.market.metrics[key]]),
    ]));

    const marketPlotFrames = interactivePlots
        ? (Array.isArray(vm.market?.plots) ? vm.market.plots : []).map((plot, index) => {
            const title = plot?.layout?.title || `Chart ${index + 1}`;
            return {
                id: `market-plot-${index + 1}`,
                title,
                fullWidth: isFullWidthPlot(title),
                data: normalizePlotDataForExport(plot?.data || []),
                layout: normalizePlotLayoutForTheme(plot?.layout || {}, vm.meta.theme),
            };
        })
        : [];

    return `<!doctype html>
<html lang="${vm.meta.language}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(vm.meta.gameName)} ${escapeHtml(copy.titleSuffix)}</title>
<style>
@font-face {
  font-family: 'Onest';
  src: url('/fonts/Onest/Onest-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter Tight';
  src: url('/fonts/Inter_Tight/InterTight-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

*{box-sizing:border-box}
body{margin:0;background:${tokens.bg};color:${tokens.text};font-family:Onest,Segoe UI,Arial,sans-serif}
.page{width:min(980px,calc(100vw - 24px));min-height:1123px;margin:0 auto;padding:26px;background:${tokens.page};page-break-after:always}
.header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}
.logo-link{display:inline-flex}
.logo{height:34px}
.pills{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.pill{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#FBE5DE;color:#FF5620;padding:0 12px;min-height:32px;font-size:16px;font-weight:600;line-height:1.1;white-space:nowrap}
h1{margin:8px 0 10px;font-size:48px;line-height:1.04;letter-spacing:-.03em}
.subtitle{color:${tokens.muted};font-size:14px;line-height:1.4;margin:12px 0 22px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 10px}
.chip{padding:2px 8px;border-radius:4px;font-size:12px;color:${tokens.text}}
.section-title{font-size:38px;line-height:1.1;margin:26px 0 14px;letter-spacing:-.03em}
.panel{background:${tokens.panel};border:1px solid ${tokens.border};border-radius:18px;padding:14px}
.summary-grid{display:grid;grid-template-columns:1.3fr .9fr;gap:12px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px}
.stat-card{background:${tokens.panel};border:1px solid ${tokens.border};border-radius:14px;padding:14px}
.stat-label{font-size:13px;color:${tokens.muted};margin:0 0 8px}
.stat-value{font-size:24px;margin:0;font-weight:600}
.top-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.comp-card{border:1px solid;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:10px;min-height:340px}
.comp-img{width:100%;height:94px;border-radius:8px;object-fit:cover}
.comp-card h4{font-size:28px;line-height:1.05;margin:0}
.badges{display:flex;flex-wrap:wrap;gap:4px}
.badge{font-size:12px;border-radius:999px;padding:2px 8px;background:${tokens.chip}}
.badge.green{background:#E2FAEE;color:#005819;border:1px solid #3AD867}
.kv-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:12px}
.kv-grid span:nth-child(odd){color:${tokens.muted}}
.steam-btn{margin-top:auto;color:white;border:0;border-radius:8px;min-height:40px}
.market-2x2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.metric-card{background:${tokens.panel};border:1px solid ${tokens.border};border-radius:16px;padding:14px}
.metric-card h3{margin:0 0 8px;font-size:24px}
.metric-row{display:flex;justify-content:space-between;font-size:14px;line-height:1.5}
.plot-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}
.plot-card{background:${tokens.panel};border:1px solid ${tokens.border};border-radius:16px;padding:12px}
.plot-card.plot-card-full{grid-column:1 / -1}
.plot-card h4{font-size:24px;margin:0 0 8px}
.plot-card img{width:100%;height:220px;object-fit:contain}
.plot-frame{width:100%;height:320px}
.plot-card.plot-card-full .plot-frame{height:360px}
.risk-card{background:${tokens.panel};border:1px solid ${tokens.border};border-radius:16px;padding:12px;margin-bottom:10px}
.risk-title{font-size:24px;margin:0 0 8px}
.risk-row{display:grid;grid-template-columns:30px 1fr;gap:10px;margin-bottom:8px}
.risk-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700}
.r1{background:rgba(220,30,30,.2);color:#DC1E1E}.r2{background:rgba(255,86,32,.2);color:#FF5620}.r3{background:rgba(58,216,103,.2);color:#3AD867}
.risk-aspects{background:${tokens.panel};border:1px solid ${tokens.border};border-radius:16px;padding:12px}
.risk-aspects h3{font-size:24px;margin:0 0 8px}
.risk-aspects-table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.4}
.risk-aspects-table th,.risk-aspects-table td{padding:8px 10px;text-align:left;vertical-align:top;border-top:1px solid ${tokens.border}}
.risk-aspects-table thead th{border-top:0;border-bottom:1px solid ${tokens.border};color:${tokens.muted};font-weight:600}
.comp-overview-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px}
.comp-overview-kpi-item{background:${tokens.panel};border:1px solid ${tokens.border};border-radius:14px;padding:12px}
.comp-overview-kpi-label{margin:0 0 6px;font-size:12px;color:${tokens.muted};line-height:1.2}
.comp-overview-kpi-value{margin:0;font-size:24px;font-weight:600;line-height:1}
.comp-overview-list{display:flex;flex-direction:column;gap:10px}
.comp-overview-card{display:flex;border:1px solid;border-radius:16px;overflow:hidden;min-height:285px}
.comp-overview-left{width:241px;display:flex;flex-direction:column;gap:16px;padding:16px;border-right:1px solid}
.comp-overview-img{width:100%;height:98px;border-radius:8px;object-fit:cover}
.comp-overview-img--placeholder{background:${tokens.chip}}
.comp-overview-head h3{margin:0 0 8px;font-size:18px;line-height:1.05}
.comp-overview-right{flex:1;display:flex;flex-direction:column;gap:14px;padding:16px}
.comp-overview-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.ov-metric{min-height:30px}
.ov-metric-label{font-size:12px;color:${tokens.muted};line-height:1.2}
.ov-metric-value{font-size:12px;color:${tokens.text};line-height:1.2}
.ov-group{display:flex;flex-direction:column;gap:8px}
.ov-group-title{font-size:12px;color:${tokens.muted}}
.ov-chip-wrap{display:flex;flex-wrap:wrap;gap:4px}
.ov-description{border:1px solid;border-radius:8px;padding:8px 10px;font-size:12px;line-height:1.35;max-height:84px;overflow:auto;white-space:pre-wrap}
.ov-description{scrollbar-width:thin;scrollbar-color:${tokens.chip} ${tokens.panel}}
.ov-description::-webkit-scrollbar{width:8px;height:8px}
.ov-description::-webkit-scrollbar-track{background:${tokens.panel};border-radius:999px}
.ov-description::-webkit-scrollbar-thumb{background:${tokens.chip};border-radius:999px;border:2px solid ${tokens.panel}}
.ov-description::-webkit-scrollbar-thumb:hover{background:${tokens.muted}}
.mini-chip{display:inline-flex;justify-content:center;align-items:center;padding:2px 6px;border-radius:4px;font-size:12px;line-height:1.2;color:${tokens.text}}
.ov-dual{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.comp-card,.metric-card,.plot-card,.risk-card,.comp-overview-card,.stat-card{break-inside:avoid;page-break-inside:avoid}
@media print{.page{margin:0;width:auto;min-height:auto;break-after:page}}
</style>
</head>
<body>
<section class="page">
  <header class="header">
    <a class="logo-link" href="${gameglorySiteUrl}" target="_blank" rel="noopener noreferrer"><img class="logo" src="${logoSvgDataUri()}" alt="gameglory" /></a>
    <div class="pills"><span class="pill">${escapeHtml(copy.pitchPack)}</span><span class="pill">${escapeHtml(vm.meta.generatedDate)}</span></div>
  </header>
  ${vm.sections.description ? `
    <h1>${escapeHtml(vm.meta.gameName)}</h1>
    <div class="chips">${chips}</div>
    <p class="subtitle">${escapeHtml(vm.description.text || '-')}</p>
  ` : ''}

  ${vm.sections.idea ? `
    <h2 class="section-title">${escapeHtml(copy.summary)}</h2>
    <div class="summary-grid">
      <div class="panel">
        <p style="margin:0;font-size:14px;line-height:1.5">${escapeHtml(vm.idea.summary || '-')}</p>
      </div>
      <div class="panel" style="display:flex;align-items:center;justify-content:center">${radarSvg}</div>
    </div>
  ` : ''}

  ${vm.sections.market ? `
    <div class="stat-grid">
      <div class="stat-card"><p class="stat-label">${escapeHtml(copy.avgRevenueByMarket)}</p><p class="stat-value">${escapeHtml(vm.market.metrics.avgRevenue || '-')}</p></div>
      <div class="stat-card"><p class="stat-label">${escapeHtml(copy.medianRevenueByMarket)}</p><p class="stat-value">${escapeHtml(vm.market.metrics.medianRevenue || '-')}</p></div>
      <div class="stat-card"><p class="stat-label">${escapeHtml(copy.minMaxGamePrice)}</p><p class="stat-value">${escapeHtml(vm.market.metrics.minMaxPrice || '-')}</p></div>
      <div class="stat-card"><p class="stat-label">${escapeHtml(copy.foundGames)}</p><p class="stat-value">${escapeHtml(vm.market.metrics.foundGames || '-')}</p></div>
    </div>
  ` : ''}

  ${vm.sections.competitors ? `
    <h2 class="section-title">${escapeHtml(copy.topComparableTitles)}</h2>
    <div class="top-grid">${vm.competitors.top3.map((item) => buildCompetitorCard(item, tokens, copy)).join('')}</div>
  ` : ''}
</section>

${vm.sections.market ? `
<section class="page">
  <h2 class="section-title">${escapeHtml(copy.marketAnalysis)}</h2>
  <div class="market-2x2">
    ${marketCards.map(([title, rows]) => `<article class="metric-card"><h3>${escapeHtml(title)}</h3>${rows.map(([k, v]) => `<div class="metric-row"><span style="color:${tokens.muted}">${escapeHtml(k)}</span><span>${escapeHtml(v || '-')}</span></div>`).join('')}</article>`).join('')}
  </div>
  <div class="plot-grid">
    ${interactivePlots
        ? marketPlotFrames.map((plot) => `<article class="plot-card ${plot.fullWidth ? 'plot-card-full' : ''}"><h4>${escapeHtml(plot.title)}</h4><div id="${plot.id}" class="plot-frame"></div></article>`).join('')
        : plotImages.map((plot) => `<article class="plot-card ${isFullWidthPlot(plot.title) ? 'plot-card-full' : ''}"><h4>${escapeHtml(plot.title)}</h4>${plot.dataUri ? `<img src="${plot.dataUri}" alt="${escapeHtml(plot.title)}"/>` : `<p style="color:${tokens.muted}">${escapeHtml(copy.chartUnavailable)}</p>`}</article>`).join('')}
  </div>
</section>` : ''}

${vm.sections.competitors ? `
<section class="page">
  <h2 class="section-title">${escapeHtml(copy.competitorsOverview)}</h2>
  <div class="comp-overview-kpi">
    <article class="comp-overview-kpi-item"><p class="comp-overview-kpi-label">${escapeHtml(copy.competitorsRevenue)}</p><p class="comp-overview-kpi-value">${escapeHtml(vm.competitors.metrics.revenue || vm.competitors.metrics.totalRevenue || '-')}</p></article>
    <article class="comp-overview-kpi-item"><p class="comp-overview-kpi-label">${escapeHtml(copy.competitorsMedianRevenue)}</p><p class="comp-overview-kpi-value">${escapeHtml(vm.competitors.metrics.medianRevenue || '-')}</p></article>
    <article class="comp-overview-kpi-item"><p class="comp-overview-kpi-label">${escapeHtml(copy.competitorsAvgRevenue)}</p><p class="comp-overview-kpi-value">${escapeHtml(vm.competitors.metrics.avgRevenue || '-')}</p></article>
    <article class="comp-overview-kpi-item"><p class="comp-overview-kpi-label">${escapeHtml(copy.competitorsAvgPrice)}</p><p class="comp-overview-kpi-value">${escapeHtml(vm.competitors.metrics.avgPrice || '-')}</p></article>
  </div>
  <div class="comp-overview-list">${vm.competitors.list.map((item) => buildCompetitorOverviewCard(item, tokens, copy)).join('')}</div>
</section>` : ''}

${vm.sections.idea ? `
<section class="page">
  <h2 class="section-title">${escapeHtml(copy.risksAndMitigation)}</h2>
  ${vm.idea.growthPoints.map((point) => `
    <article class="risk-card">
      <h3 class="risk-title">${escapeHtml(point.aspect || copy.resourceDilemma)}</h3>
      <div class="risk-row"><div class="risk-icon r1">?</div><div><div style="color:${tokens.muted};font-size:14px">${escapeHtml(copy.asIs)}</div><div>${escapeHtml(point.current_state || '-')}</div></div></div>
      <div class="risk-row"><div class="risk-icon r2">!</div><div><div style="color:${tokens.muted};font-size:14px">${escapeHtml(copy.aiRecommendation)}</div><div>${escapeHtml(point.recommendation || '-')}</div></div></div>
      <div class="risk-row"><div class="risk-icon r3">?</div><div><div style="color:${tokens.muted};font-size:14px">${escapeHtml(copy.expectedOutcome)}</div><div>${escapeHtml(point.expected_outcome || '-')}</div></div></div>
    </article>
  `).join('')}
  <article class="risk-aspects">
    <h3>${escapeHtml(copy.aspectsCommentary)}</h3>
    <table class="risk-aspects-table">
      <thead>
        <tr>
          <th>${escapeHtml(copy.aspectColumn)}</th>
          <th>${escapeHtml(copy.commentaryColumn)}</th>
        </tr>
      </thead>
      <tbody>
        ${riskAspectRows.map((row) => `
          <tr>
            <td>${escapeHtml(row.aspectName)}</td>
            <td>${escapeHtml(row.commentary)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </article>
</section>` : ''}

${interactivePlots && vm.sections.market ? `
<script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
<script>
(function() {
  const plots = ${safeJson(marketPlotFrames.map((plot) => ({ id: plot.id, data: plot.data, layout: plot.layout })))};
  const baseConfig = { responsive: true, displaylogo: false };
  const renderPlots = () => {
    if (!window.Plotly) return;
    plots.forEach((plot) => {
      const container = document.getElementById(plot.id);
      if (!container) return;
      const layout = Object.assign({}, plot.layout || {}, {
        autosize: true,
        margin: Object.assign({ l: 60, r: 24, t: 20, b: 56 }, (plot.layout && plot.layout.margin) || {}),
      });
      window.Plotly.newPlot(container, plot.data || [], layout, baseConfig).catch(() => {});
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderPlots, { once: true });
  } else {
    renderPlots();
  }
})();
</script>` : ''}

</body></html>`;
};
