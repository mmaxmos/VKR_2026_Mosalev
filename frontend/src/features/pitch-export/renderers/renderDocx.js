import {
    Document,
    ExternalHyperlink,
    HeadingLevel,
    ImageRun,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from 'docx';

const dataUriToImage = (dataUri) => {
    if (!dataUri || typeof dataUri !== 'string') return null;

    const match = dataUri.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;

    const rawType = match[1]?.toLowerCase();
    const base64 = match[2];
    if (!base64) return null;

    const typeMap = {
        png: 'png',
        jpg: 'jpg',
        jpeg: 'jpg',
        gif: 'gif',
        bmp: 'bmp',
        'svg+xml': 'svg',
    };

    const imageType = typeMap[rawType];
    if (!imageType) return null;

    const decoded = atob(base64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i += 1) {
        bytes[i] = decoded.charCodeAt(i);
    }

    const pngSignature = [0x89, 0x50, 0x4e, 0x47];
    const jpgSignature = [0xff, 0xd8, 0xff];
    const isPng = imageType === 'png' && pngSignature.every((sig, idx) => bytes[idx] === sig);
    const isJpg = imageType === 'jpg' && jpgSignature.every((sig, idx) => bytes[idx] === sig);
    const isOtherType = imageType === 'gif' || imageType === 'bmp' || imageType === 'svg';

    if (!(isPng || isJpg || isOtherType)) return null;

    return { data: bytes, type: imageType };
};

const toCsv = (value) => {
    if (!Array.isArray(value)) return '-';
    const items = value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
    return items.length ? items.join(', ') : '-';
};

const asText = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
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

const resolveSteamUrl = (game) => {
    if (!game || typeof game !== 'object') return '';
    const explicitUrl = game.steamUrl || game.steam_url || game.steamLink || game.steam_link || game.url;
    if (explicitUrl) return String(explicitUrl);
    if (game.id) return `https://store.steampowered.com/app/${encodeURIComponent(String(game.id))}`;
    return '';
};

const copyByLang = {
    ru: {
        pitchPack: 'Pitch Pack',
        description: 'Описание',
        idea: 'Анализ идеи',
        market: 'Анализ рынка',
        competitors: 'Конкуренты',
        genres: 'Жанры',
        tags: 'Тэги',
        language: 'Язык',
        categories: 'Категории',
        aspectsCommentary: 'Комментарии по аспектам',
        aspectColumn: 'Аспект',
        commentaryColumn: 'Комментарий',
        aspectNiche: 'Ниша',
        aspectStory: 'Сюжет',
        aspectVisual: 'Графика',
        aspectGameplay: 'Геймплей',
        aspectInnovation: 'Инновация',
        aspectMonetization: 'Монетизация',
        competitorsRevenue: 'Выручка конкурентов',
        competitorsMedianRevenue: 'Медианная выручка',
        competitorsAvgRevenue: 'Средняя выручка',
        competitorsAvgPrice: 'Средняя цена',
        currentState: 'Как сейчас',
        recommendation: 'Рекомендация',
        result: 'Результат',
        point: 'Пункт',
        gameTitleFallback: 'Название игры',
        similarity: 'Сходство',
        release: 'Релиз',
        price: 'Цена',
        peakCcu: 'Пик CCU',
        revenue: 'Выручка',
        budget: 'Бюджет',
        reviewCount: 'Количество отзывов',
        positiveReviewPercent: 'Положительные отзывы',
        developer: 'Разработчик',
        publisher: 'Издатель',
        steam: 'Steam',
        genresGame: 'Жанры игры',
        tagsGame: 'Тэги игры',
        categoriesGame: 'Категории игры',
        descriptionGame: 'Описание',
    },
    en: {
        pitchPack: 'Pitch Pack',
        description: 'Description',
        idea: 'Idea Analysis',
        market: 'Market Analysis',
        competitors: 'Competitors',
        genres: 'Genres',
        tags: 'Tags',
        language: 'Language',
        categories: 'Categories',
        aspectsCommentary: 'Aspect commentary',
        aspectColumn: 'Aspect',
        commentaryColumn: 'Commentary',
        aspectNiche: 'Niche',
        aspectStory: 'Story',
        aspectVisual: 'Visuals',
        aspectGameplay: 'Gameplay',
        aspectInnovation: 'Innovation',
        aspectMonetization: 'Monetization',
        competitorsRevenue: 'Competitors Revenue',
        competitorsMedianRevenue: 'Median Revenue',
        competitorsAvgRevenue: 'Average Revenue',
        competitorsAvgPrice: 'Average Price',
        currentState: 'Current state',
        recommendation: 'Recommendation',
        result: 'Result',
        point: 'Point',
        gameTitleFallback: 'Game title',
        similarity: 'Similarity',
        release: 'Release',
        price: 'Price',
        peakCcu: 'Peak CCU',
        revenue: 'Revenue',
        budget: 'Budget',
        reviewCount: 'Review count',
        positiveReviewPercent: 'Positive reviews',
        developer: 'Developer',
        publisher: 'Publisher',
        steam: 'Steam',
        genresGame: 'Game genres',
        tagsGame: 'Game tags',
        categoriesGame: 'Game categories',
        descriptionGame: 'Description',
    },
};

const tableValueCell = (value) => {
    if (value && typeof value === 'object' && value.type === 'link') {
        const url = value.url || '';
        if (!url) return new TableCell({ children: [new Paragraph('-')] });

        return new TableCell({
            children: [
                new Paragraph({
                    children: [
                        new ExternalHyperlink({
                            link: url,
                            children: [
                                new TextRun({
                                    text: value.label || url,
                                    color: '0563C1',
                                    underline: {},
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });
    }

    return new TableCell({ children: [new Paragraph(asText(value))] });
};

const kvTable = (rows = []) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([k, v]) => new TableRow({
        children: [
            new TableCell({ children: [new Paragraph(asText(k))] }),
            tableValueCell(v),
        ],
    })),
});

const twoColumnTableWithHeader = ({ leftHeader, rightHeader, rows = [] }) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
        new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: asText(leftHeader), bold: true })] })],
                }),
                new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: asText(rightHeader), bold: true })] })],
                }),
            ],
        }),
        ...rows.map(([left, right]) => new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(asText(left))] }),
                new TableCell({ children: [new Paragraph(asText(right))] }),
            ],
        })),
    ],
});

export const renderDocxBlob = async ({ vm, plotImages }) => {
    const copy = copyByLang[vm.meta.language] || copyByLang.en;
    const children = [];

    children.push(new Paragraph({
        children: [
            new TextRun({
                text: 'GameGlory',
                color: 'FF5620',
                bold: true,
                size: 30,
            }),
        ],
    }));

    children.push(new Paragraph({
        text: `${vm.meta.gameName} - ${copy.pitchPack}`,
        heading: HeadingLevel.TITLE,
    }));

    if (vm.sections.description) {
        children.push(new Paragraph({ text: copy.description, heading: HeadingLevel.HEADING_1 }));
        children.push(new Paragraph(asText(vm.description.text)));
        children.push(new Paragraph(`${copy.genres}: ${toCsv(vm.description.genres)}`));
        children.push(new Paragraph(`${copy.tags}: ${toCsv(vm.description.tags)}`));
        children.push(new Paragraph(`${copy.language}: ${toCsv(vm.description.languages)}`));
        children.push(new Paragraph(`${copy.categories}: ${toCsv(vm.description.categories)}`));
    }

    if (vm.sections.idea) {
        children.push(new Paragraph(''));
        children.push(new Paragraph({ text: copy.idea, heading: HeadingLevel.HEADING_1 }));
        children.push(new Paragraph(asText(vm.idea.summary)));
        children.push(new Paragraph(''));
        children.push(new Paragraph({ text: copy.aspectsCommentary, heading: HeadingLevel.HEADING_2 }));
        children.push(twoColumnTableWithHeader({
            leftHeader: copy.aspectColumn,
            rightHeader: copy.commentaryColumn,
            rows: aspectOrder.map((scoreKey) => [
                copy[aspectLabelKeyByScoreKey[scoreKey]] || scoreKey,
                vm.idea?.scores?.[scoreKey]?.reasoning || '-',
            ]),
        }));
        children.push(new Paragraph(''));

        (vm.idea.growthPoints || []).forEach((point, idx) => {
            children.push(new Paragraph({ text: `${idx + 1}. ${point.aspect || copy.point}`, heading: HeadingLevel.HEADING_2 }));
            children.push(new Paragraph(`${copy.currentState}: ${asText(point.current_state)}`));
            children.push(new Paragraph(`${copy.recommendation}: ${asText(point.recommendation)}`));
            children.push(new Paragraph(`${copy.result}: ${asText(point.expected_outcome)}`));
        });
    }

    if (vm.sections.market) {
        children.push(new Paragraph(''));
        children.push(new Paragraph({ text: copy.market, heading: HeadingLevel.HEADING_1 }));
        children.push(kvTable(Object.entries(vm.market.metrics || {})));

        for (const plot of plotImages) {
            children.push(new Paragraph({ text: asText(plot.title), heading: HeadingLevel.HEADING_2 }));
            if (plot.description) {
                children.push(new Paragraph(asText(plot.description)));
            }

            const image = dataUriToImage(plot.dataUri);
            if (image) {
                try {
                    children.push(new Paragraph({
                        children: [
                            new ImageRun({
                                data: image.data,
                                type: image.type,
                                transformation: { width: 520, height: 285 },
                            }),
                        ],
                    }));
                } catch (error) {
                    console.warn('Skipping invalid chart image in DOCX export:', error);
                }
            }
        }
    }

    if (vm.sections.competitors) {
        children.push(new Paragraph(''));
        children.push(new Paragraph({ text: copy.competitors, heading: HeadingLevel.HEADING_1 }));
        children.push(kvTable([
            [copy.competitorsRevenue, vm.competitors.metrics?.revenue || vm.competitors.metrics?.totalRevenue],
            [copy.competitorsMedianRevenue, vm.competitors.metrics?.medianRevenue],
            [copy.competitorsAvgRevenue, vm.competitors.metrics?.avgRevenue],
            [copy.competitorsAvgPrice, vm.competitors.metrics?.avgPrice],
        ]));
        children.push(new Paragraph(''));

        for (const [index, item] of (vm.competitors.list || []).entries()) {
            const steamUrl = resolveSteamUrl(item);

            children.push(new Paragraph({ text: `${index + 1}. ${asText(item.title || copy.gameTitleFallback)}`, heading: HeadingLevel.HEADING_2 }));
            children.push(kvTable([
                [copy.similarity, item.similarity],
                [copy.release, item.releaseDate],
                [copy.price, item.price],
                [copy.peakCcu, item.peakCCU],
                [copy.revenue, item.estimatedRevenue || item.revenue],
                [copy.budget, item.publisherClass],
                [copy.reviewCount, item.reviewCount],
                [copy.positiveReviewPercent, item.positiveReviewPercent],
                [copy.developer, item.developer],
                [copy.publisher, item.publisher],
                [copy.tagsGame, toCsv(item.tags)],
                [copy.genresGame, toCsv(item.genres)],
                [copy.categoriesGame, toCsv(item.categories)],
                [copy.steam, { type: 'link', url: steamUrl, label: steamUrl || '-' }],
            ]));
            children.push(new Paragraph(''));
            children.push(new Paragraph(`${copy.descriptionGame}: ${asText(item.description)}`));
            children.push(new Paragraph(''));
        }
    }

    const doc = new Document({
        sections: [{
            children,
        }],
    });

    return await Packer.toBlob(doc);
};
