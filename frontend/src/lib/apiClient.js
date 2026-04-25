const DEFAULT_BACKEND_ORIGIN = 'http://127.0.0.1:8000';

const normalizePathPrefix = (value = '') => {
    const normalized = String(value || '').trim().replace(/\/+$/, '');
    if (!normalized || normalized === '/') return '';
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

const resolveBackendApiBase = () => {
    const raw =
        import.meta.env.VITE_BACKEND_API_URL ||
        import.meta.env.VITE_API_URL ||
        DEFAULT_BACKEND_ORIGIN;

    const pageOrigin = typeof window !== 'undefined'
        ? window.location.origin.replace(/\/$/, '')
        : DEFAULT_BACKEND_ORIGIN;

    const rawString = String(raw || '').trim();
    const isAbsolute = /^https?:\/\//i.test(rawString);

    try {
        const parsed = isAbsolute ? new URL(rawString) : new URL(rawString, pageOrigin);
        const origin = isAbsolute
            ? `${parsed.protocol}//${parsed.host}`
            : pageOrigin;
        const prefix = normalizePathPrefix(parsed.pathname);
        return { origin, prefix };
    } catch {
        return {
            origin: pageOrigin || DEFAULT_BACKEND_ORIGIN,
            prefix: '',
        };
    }
};

const BACKEND_API_BASE = resolveBackendApiBase();

const toUrl = (path) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (
        BACKEND_API_BASE.prefix &&
        (normalizedPath === BACKEND_API_BASE.prefix || normalizedPath.startsWith(`${BACKEND_API_BASE.prefix}/`))
    ) {
        return `${BACKEND_API_BASE.origin}${normalizedPath}`;
    }

    return `${BACKEND_API_BASE.origin}${BACKEND_API_BASE.prefix}${normalizedPath}`;
};

export const apiRequest = async (path, options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (!headers['Content-Type'] && options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(toUrl(path), {
        ...options,
        headers,
        cache: 'no-store',
    });
};
