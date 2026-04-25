export const sanitizeFileName = (name, fallback = 'pitch-pack') => {
    const base = String(name || '').trim() || fallback;
    return base.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_');
};

export const triggerDownload = ({ blob, fileName }) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

