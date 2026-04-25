const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

let cachedPlotly = null;
const getPlotly = async () => {
    if (cachedPlotly) return cachedPlotly;
    const mod = await import('plotly.js/dist/plotly');
    cachedPlotly = mod.default || mod;
    return cachedPlotly;
};

const withVisibleAxes = (layout = {}) => {
    const normalized = { ...(layout || {}) };
    const axisKeyRe = /^(xaxis|yaxis)(\d+)?$/i;
    const axisKeys = Object.keys(normalized).filter((key) => axisKeyRe.test(key));

    axisKeys.forEach((axisKey) => {
        normalized[axisKey] = {
            ...(normalized[axisKey] || {}),
            visible: true,
            showticklabels: true,
            automargin: true,
        };
    });

    return normalized;
};

const sanitizeLayoutForExport = (layout = {}, options = {}) => {
    const normalized = withVisibleAxes(layout || {});
    const textColor = options.textColor;
    const axisLineColor = options.axisLineColor || options.textColor;
    const gridColor = options.gridColor;
    const zeroLineColor = options.zeroLineColor || options.axisLineColor;

    if (textColor) {
        normalized.font = {
            ...(normalized.font || {}),
            color: textColor,
        };

        if (normalized.legend && typeof normalized.legend === 'object') {
            normalized.legend = {
                ...normalized.legend,
                font: {
                    ...(normalized.legend.font || {}),
                    color: textColor,
                },
            };
        }

        if (Array.isArray(normalized.annotations)) {
            normalized.annotations = normalized.annotations.map((annotation) => ({
                ...annotation,
                font: {
                    ...(annotation?.font || {}),
                    color: textColor,
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
                            color: textColor,
                        },
                        title: colorAxis.colorbar?.title
                            ? {
                                ...(colorAxis.colorbar.title || {}),
                                font: {
                                    ...(colorAxis.colorbar.title?.font || {}),
                                    color: textColor,
                                },
                            }
                            : colorAxis.colorbar?.title,
                    },
                };
            });

        Object.keys(normalized)
            .filter((key) => /^(xaxis|yaxis)(\d+)?$/i.test(key))
            .forEach((axisKey) => {
                const axis = normalized[axisKey] || {};
                normalized[axisKey] = {
                    ...axis,
                    tickfont: {
                        ...(axis.tickfont || {}),
                        color: textColor,
                    },
                    title: axis.title
                        ? {
                            ...(axis.title || {}),
                            font: {
                                ...(axis.title?.font || {}),
                                color: textColor,
                            },
                        }
                        : axis.title,
                    linecolor: axisLineColor || axis.linecolor,
                    gridcolor: gridColor || axis.gridcolor,
                    zerolinecolor: zeroLineColor || axis.zerolinecolor,
                };
            });
    }

    delete normalized.title;
    return normalized;
};

const sanitizeDataForExport = (data = []) => (Array.isArray(data) ? data : []).map((trace) => {
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

export const convertPlotsToImages = async (plots = [], options = {}) => {
    const Plotly = await getPlotly();

    const images = await Promise.all(
        (Array.isArray(plots) ? plots : []).map(async (plot, index) => {
            try {
                const figure = {
                    data: sanitizeDataForExport(plot?.data || []),
                    layout: {
                        ...sanitizeLayoutForExport(plot?.layout || {}, options),
                        paper_bgcolor: options.backgroundColor || 'rgba(0,0,0,0)',
                        plot_bgcolor: options.backgroundColor || 'rgba(0,0,0,0)',
                    },
                };

                const dataUri = await Plotly.toImage(figure, {
                    format: 'png',
                    width: 1024,
                    height: 560,
                    scale: 2,
                });

                return {
                    id: `plot-${index + 1}`,
                    title: plot?.layout?.title || `Chart ${index + 1}`,
                    description: plot?.layout?.description || '',
                    dataUri,
                };
            } catch (error) {
                console.warn('Failed to render plot image for export:', error);
                return {
                    id: `plot-${index + 1}`,
                    title: plot?.layout?.title || `Chart ${index + 1}`,
                    description: plot?.layout?.description || '',
                    dataUri: null,
                };
            }
        })
    );

    return images;
};

const RADAR_KEYS_ORDER = ['niche', 'story', 'visual', 'gameplay', 'innovation', 'monetization'];

export const scoreToRadarPoints = (scores = {}) => {
    return RADAR_KEYS_ORDER.map((key) => {
        const raw = scores?.[key]?.score;
        const number = Number.isFinite(Number(raw)) ? Number(raw) : 0;
        return Math.max(0, Math.min(5, number));
    });
};

const radarLabelsByLang = {
    ru: ['Ниша', 'Сюжет', 'Графика', 'Геймплей', 'Инновация', 'Монетизация'],
    en: ['Niche', 'Story', 'Visuals', 'Gameplay', 'Innovation', 'Monetization'],
};

export const buildRadarSvg = (scores = {}, dark = false, language = 'en') => {
    const labels = radarLabelsByLang[language] || radarLabelsByLang.en;
    const values = scoreToRadarPoints(scores);
    const size = 210;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 72;

    const polygonPoints = values
        .map((value, i) => {
            const angle = -Math.PI / 2 + (Math.PI * 2 * i) / values.length;
            const r = (radius * value) / 5;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    const levels = [1, 2, 3, 4, 5].map((level) => {
        const points = labels
            .map((_, i) => {
                const angle = -Math.PI / 2 + (Math.PI * 2 * i) / labels.length;
                const r = (radius * level) / 5;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(' ');
        return `<polygon points="${points}" fill="none" stroke="${dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}" stroke-width="1" />`;
    }).join('');

    const axes = labels.map((_, i) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / labels.length;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" stroke="${dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}" stroke-width="1" />`;
    }).join('');

    const text = labels.map((label, i) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / labels.length;
        const x = cx + Math.cos(angle) * (radius + 24);
        const y = cy + Math.sin(angle) * (radius + 24);
        return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="middle" font-family="Onest, Segoe UI, Arial" font-size="11" fill="${dark ? '#BABCC1' : '#4E525C'}">${escapeHtml(label)}</text>`;
    }).join('');

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="radar-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF7549" stop-opacity="0.45" /><stop offset="100%" stop-color="#FF5620" stop-opacity="0.45" /></linearGradient></defs>${levels}${axes}<polygon points="${polygonPoints}" fill="url(#radar-grad)" stroke="#FF5620" stroke-width="2" />${text}</svg>`;
};

