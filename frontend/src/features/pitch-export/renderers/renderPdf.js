import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const PAGE_WIDTH_PX = 794;
const SAFE_BREAK_SELECTORS = [
    '.section-title',
    '.summary-grid',
    '.stat-grid',
    '.top-grid',
    '.market-2x2',
    '.metric-card',
    '.plot-card',
    '.comp-card',
    '.comp-overview-kpi',
    '.comp-overview-kpi-item',
    '.comp-overview-card',
    '.risk-card',
    '.risk-aspects',
    '.stat-card',
].join(',');

const NON_BREAKABLE_SELECTORS = [
    '.plot-card',
    '.metric-card',
    '.comp-card',
    '.comp-overview-card',
    '.risk-card',
    '.risk-aspects',
    '.stat-card',
    '.comp-overview-kpi-item',
].join(',');

const FORCE_NEW_PAGE_SECTION_TITLES = [
    'market analysis',
    'анализ рынка',
    'competitors overview',
    'обзор конкурентов',
    'risks & mitigation',
    'риски и пути снижения',
];

const normalizeTitle = (value) => String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const waitForImages = async (root) => {
    const images = Array.from(root.querySelectorAll('img'));
    await Promise.all(images.map((img) => new Promise((resolve) => {
        if (img.complete) {
            resolve();
            return;
        }
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
    })));
};

const collectBreakpoints = (element, scaleY, canvasHeight) => {
    const rootRect = element.getBoundingClientRect();
    const points = new Set([0, canvasHeight]);
    const nodes = Array.from(element.querySelectorAll(SAFE_BREAK_SELECTORS));

    nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const top = Math.max(0, Math.round((rect.top - rootRect.top) * scaleY));
        const bottom = Math.max(0, Math.round((rect.bottom - rootRect.top) * scaleY));
        if (top > 0 && top < canvasHeight) points.add(top);
        if (bottom > 0 && bottom < canvasHeight) points.add(bottom);
    });

    return Array.from(points).sort((a, b) => a - b);
};

const collectNonBreakableIntervals = (element, scaleY, canvasHeight) => {
    const rootRect = element.getBoundingClientRect();
    const nodes = Array.from(element.querySelectorAll(NON_BREAKABLE_SELECTORS));
    return nodes
        .map((node) => {
            const rect = node.getBoundingClientRect();
            const top = Math.max(0, Math.round((rect.top - rootRect.top) * scaleY));
            const bottom = Math.max(0, Math.round((rect.bottom - rootRect.top) * scaleY));
            const height = Math.max(0, bottom - top);
            return { top, bottom, height };
        })
        .filter((interval) => interval.height > 0 && interval.top < canvasHeight && interval.bottom > 0)
        .sort((a, b) => a.top - b.top);
};

const collectForcedBreakpoints = (element, scaleY, canvasHeight) => {
    const rootRect = element.getBoundingClientRect();
    const titles = Array.from(element.querySelectorAll('.section-title'));
    const points = new Set();

    titles.forEach((title) => {
        const titleText = normalizeTitle(title.textContent);
        const shouldForceBreak = FORCE_NEW_PAGE_SECTION_TITLES.some((needle) => titleText.includes(needle));
        if (!shouldForceBreak) return;

        const rect = title.getBoundingClientRect();
        const top = Math.max(0, Math.round((rect.top - rootRect.top) * scaleY));
        if (top > 0 && top < canvasHeight) {
            points.add(top);
        }
    });

    return Array.from(points).sort((a, b) => a - b);
};

const collectKeepWithNextIntervals = (element, scaleY, canvasHeight) => {
    const rootRect = element.getBoundingClientRect();
    const titles = Array.from(element.querySelectorAll('.section-title'));

    return titles
        .map((title) => {
            const next = title.nextElementSibling;
            if (!next) return null;

            const titleRect = title.getBoundingClientRect();
            const nextRect = next.getBoundingClientRect();
            const top = Math.max(0, Math.round((titleRect.top - rootRect.top) * scaleY));
            const bottom = Math.max(0, Math.round((nextRect.bottom - rootRect.top) * scaleY));
            const height = Math.max(0, bottom - top);
            if (!height) return null;

            return { top, bottom, height };
        })
        .filter((interval) => interval && interval.top < canvasHeight && interval.bottom > 0)
        .sort((a, b) => a.top - b.top);
};

const splitCanvasRanges = (
    canvasHeight,
    maxSliceHeight,
    breakpoints = [],
    nonBreakableIntervals = [],
    forcedBreakpoints = []
) => {
    const ranges = [];
    const minSliceHeight = Math.max(220, Math.round(maxSliceHeight * 0.45));
    const preferredFillHeight = Math.round(maxSliceHeight * 0.82);
    let start = 0;

    while (start < canvasHeight - 1) {
        const hardEnd = Math.min(start + maxSliceHeight, canvasHeight);
        let end = hardEnd;
        const nextForcedBreak = forcedBreakpoints.find((point) => point > start + 4);

        if (nextForcedBreak && nextForcedBreak <= hardEnd) {
            end = nextForcedBreak;
        }

        if (end < canvasHeight && (!nextForcedBreak || nextForcedBreak > hardEnd)) {
            const crossingNonBreakable = nonBreakableIntervals.find((interval) => (
                interval.top < hardEnd
                && interval.bottom > hardEnd
                && interval.top >= start
                && interval.height <= maxSliceHeight
            ));

            if (crossingNonBreakable && crossingNonBreakable.top > start) {
                end = crossingNonBreakable.top;
            }

            const candidates = breakpoints
                .filter((point) => point > start + minSliceHeight && point <= hardEnd);

            const candidate = candidates
                .pop();

            if (
                candidate
                && candidate - start >= preferredFillHeight
                && candidate <= hardEnd
                && (end === hardEnd || candidate > end)
            ) {
                end = candidate;
            }
        }

        if (end <= start) {
            end = Math.min(start + maxSliceHeight, canvasHeight);
        }

        ranges.push({ start, end });
        start = end;
    }

    return ranges;
};

const cssColorToRgb = (cssColor) => {
    const color = String(cssColor || '').trim();
    const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
        return [
            Number.parseInt(rgbMatch[1], 10),
            Number.parseInt(rgbMatch[2], 10),
            Number.parseInt(rgbMatch[3], 10),
        ];
    }

    const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
        const hex = hexMatch[1].length === 3
            ? hexMatch[1].split('').map((ch) => `${ch}${ch}`).join('')
            : hexMatch[1];
        return [
            Number.parseInt(hex.slice(0, 2), 16),
            Number.parseInt(hex.slice(2, 4), 16),
            Number.parseInt(hex.slice(4, 6), 16),
        ];
    }

    return [255, 255, 255];
};

const resolvePageBackgroundColor = (root) => {
    const pageElement = root.querySelector('.page');
    const source = pageElement || root;
    const bg = getComputedStyle(source).backgroundColor;
    if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
        return '#ffffff';
    }
    return bg;
};

export const renderPdfBlob = async (html) => {
    const parsed = new DOMParser().parseFromString(html, 'text/html');

    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-10000px';
    host.style.top = '0';
    host.style.width = `${PAGE_WIDTH_PX}px`;
    host.style.pointerEvents = 'none';
    host.style.zIndex = '-1';

    const styleNodes = Array.from(parsed.head.querySelectorAll('style,link[rel="stylesheet"]'));
    styleNodes.forEach((node) => {
        host.appendChild(node.cloneNode(true));
    });

    const pdfOverrides = document.createElement('style');
    pdfOverrides.textContent = `
      .page {
        width: ${PAGE_WIDTH_PX}px !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 auto !important;
        break-after: auto !important;
        page-break-after: auto !important;
      }
      h1 {
        font-size: 38px !important;
      }
      .section-title {
        font-size: 28px !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .comp-card h4 {
        font-size: 20px !important;
      }
      .metric-card h3,
      .plot-card h4 {
        font-size: 18px !important;
      }
      .risk-title {
        font-size: 19px !important;
      }
      .comp-overview-head h3 {
        font-size: 15px !important;
      }
      @media print {
        .page {
          break-after: auto !important;
          page-break-after: auto !important;
        }
      }
    `;
    host.appendChild(pdfOverrides);

    const root = document.createElement('div');
    root.style.width = `${PAGE_WIDTH_PX}px`;
    root.innerHTML = parsed.body?.innerHTML || html;
    host.appendChild(root);

    document.body.appendChild(host);

    try {
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }
        await waitForImages(root);

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
            compress: true,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let renderedPages = 0;
        const pageBackgroundColor = resolvePageBackgroundColor(root);
        const [bgR, bgG, bgB] = cssColorToRgb(pageBackgroundColor);

        const canvas = await html2canvas(root, {
            scale: 2,
            useCORS: true,
            backgroundColor: pageBackgroundColor,
            logging: false,
            width: PAGE_WIDTH_PX,
            windowWidth: PAGE_WIDTH_PX,
            imageTimeout: 15000,
        });

        const elementHeight = Math.max(1, root.getBoundingClientRect().height);
        const scaleY = canvas.height / elementHeight;
        const maxSliceHeight = Math.floor((pageHeight * canvas.width) / pageWidth);
        const breakpoints = collectBreakpoints(root, scaleY, canvas.height);
        const forcedBreakpoints = collectForcedBreakpoints(root, scaleY, canvas.height);
        const nonBreakableIntervals = [
            ...collectNonBreakableIntervals(root, scaleY, canvas.height),
            ...collectKeepWithNextIntervals(root, scaleY, canvas.height),
        ].sort((a, b) => a.top - b.top);
        const ranges = splitCanvasRanges(
            canvas.height,
            maxSliceHeight,
            breakpoints,
            nonBreakableIntervals,
            forcedBreakpoints
        );

        for (const { start, end } of ranges) {
            const sliceHeight = Math.max(1, end - start);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sliceHeight;
            const ctx = sliceCanvas.getContext('2d');
            if (!ctx) continue;

            ctx.fillStyle = pageBackgroundColor;
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(
                canvas,
                0,
                start,
                canvas.width,
                sliceHeight,
                0,
                0,
                canvas.width,
                sliceHeight
            );

            const imageData = sliceCanvas.toDataURL('image/jpeg', 0.98);
            const drawHeight = (sliceHeight * pageWidth) / canvas.width;

            if (renderedPages > 0) {
                pdf.addPage('a4', 'portrait');
            }
            pdf.setFillColor(bgR, bgG, bgB);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, drawHeight, undefined, 'FAST');
            renderedPages += 1;
        }

        return pdf.output('blob');
    } finally {
        document.body.removeChild(host);
    }
};
