import { buildExportViewModel } from '../model/buildExportViewModel';
import { renderPitchPackHtml } from '../renderers/renderHtml';
import { renderPdfBlob } from '../renderers/renderPdf';
import { renderDocxBlob } from '../renderers/renderDocx';
import { sanitizeFileName, triggerDownload } from '../utils/fileDownload';
import { convertPlotsToImages } from '../utils/plotlyExport';

const mimeByFormat = {
    html: 'text/html;charset=utf-8',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export const exportPitchPackClient = async (params) => {
    const vm = buildExportViewModel(params);
    const ext = vm.meta.format;
    const interactivePlots = ext === 'html';
    const plotImageOptions = ext === 'docx'
        ? {
            textColor: '#1E232F',
            axisLineColor: 'rgba(10,15,24,0.25)',
            zeroLineColor: 'rgba(10,15,24,0.2)',
            gridColor: 'rgba(10,15,24,0.14)',
            backgroundColor: '#FFFFFF',
        }
        : ext === 'pdf' && vm.meta.theme !== 'dark'
            ? {
                textColor: '#1E232F',
                axisLineColor: 'rgba(10,15,24,0.25)',
                zeroLineColor: 'rgba(10,15,24,0.2)',
                gridColor: 'rgba(10,15,24,0.14)',
            }
        : {};

    const plotImages = vm.sections.market && !interactivePlots
        ? await convertPlotsToImages(vm.market.plots, plotImageOptions)
        : [];

    const html = renderPitchPackHtml({ vm, plotImages, interactivePlots });
    const baseName = sanitizeFileName(vm.meta.fileName || vm.meta.gameName || 'pitch-pack');
    const outputName = `${baseName}.${ext}`;

    if (ext === 'html') {
        const blob = new Blob([html], { type: mimeByFormat.html });
        triggerDownload({ blob, fileName: outputName });
        return;
    }

    if (ext === 'pdf') {
        const blob = await renderPdfBlob(html);
        triggerDownload({ blob, fileName: outputName });
        return;
    }

    const blob = await renderDocxBlob({ vm, plotImages });
    triggerDownload({ blob, fileName: outputName });
};
