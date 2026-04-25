const parseCompactNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const raw = String(value).trim().toUpperCase().replace(',', '.');
    if (!raw || raw === '-') return 0;

    const suffix = raw.match(/[KMB]$/)?.[0] || '';
    const numeric = Number.parseFloat(raw.replace(/[^\d.]/g, ''));
    if (Number.isNaN(numeric)) return 0;

    if (suffix === 'K') return numeric * 1_000;
    if (suffix === 'M') return numeric * 1_000_000;
    if (suffix === 'B') return numeric * 1_000_000_000;

    return numeric;
};

export const sortCompetitors = (list = [], sortOption = 'reviewsDesc') => {
    const sorted = [...(Array.isArray(list) ? list : [])];

    switch (sortOption) {
        case 'reviewsAsc':
            return sorted.sort((a, b) => parseCompactNumber(a?.reviewCount) - parseCompactNumber(b?.reviewCount));
        case 'priceDesc':
            return sorted.sort((a, b) => parseCompactNumber(b?.price) - parseCompactNumber(a?.price));
        case 'priceAsc':
            return sorted.sort((a, b) => parseCompactNumber(a?.price) - parseCompactNumber(b?.price));
        case 'reviewsDesc':
        default:
            return sorted.sort((a, b) => parseCompactNumber(b?.reviewCount) - parseCompactNumber(a?.reviewCount));
    }
};

const normalizeArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return [value];
};

export const buildExportViewModel = ({
    selectedSections,
    format,
    theme,
    fileName,
    gameName,
    appLanguage,
    language,
    formState,
    marketData,
    ideaData,
    competitorsData,
    competitorsSortOption,
}) => {
    const selected = new Set(selectedSections);
    const sortedCompetitors = sortCompetitors(competitorsData?.list || [], competitorsSortOption);

    const effectiveLanguage = appLanguage || language || 'en';

    const vm = {
        meta: {
            format,
            theme,
            language: effectiveLanguage,
            fileName,
            gameName: gameName?.trim() || 'Untitled Game',
            generatedDate: new Date().toLocaleDateString(effectiveLanguage === 'ru' ? 'ru-RU' : 'en-US'),
        },
        sections: {
            description: selected.has('description'),
            market: selected.has('market'),
            competitors: selected.has('competitors'),
            idea: selected.has('idea'),
        },
        description: {
            text: formState?.ideaDescription || '',
            genres: normalizeArray(formState?.genre || formState?.genres),
            tags: normalizeArray(formState?.tags),
            categories: normalizeArray(formState?.categories),
            languages: normalizeArray(formState?.language || formState?.languages),
        },
        market: {
            metrics: marketData?.metrics || {},
            plots: Array.isArray(marketData?.plots) ? marketData.plots : [],
            intro: marketData?.intro?.description || '',
        },
        competitors: {
            metrics: competitorsData?.metrics || {},
            list: sortedCompetitors,
            top3: sortedCompetitors.slice(0, 3),
            rest: sortedCompetitors.slice(3),
        },
        idea: {
            suggestedName: ideaData?.suggested_name || '',
            summary: ideaData?.summary || '',
            scores: ideaData?.scores || {},
            growthPoints: Array.isArray(ideaData?.growth_points) ? ideaData.growth_points : [],
        },
    };

    return vm;
};

