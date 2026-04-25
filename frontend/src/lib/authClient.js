const DEFAULT_LOCAL_AUTH_BASE = 'http://127.0.0.1:8005';
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

const normalizePathPrefix = (value = '') => {
    const normalized = String(value || '').trim().replace(/\/+$/, '');
    if (!normalized || normalized === '/') return '';
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

const normalizeAuthBaseUrl = (raw, fallbackOrigin = '') => {
    if (!raw) return '';

    const candidate = String(raw).trim();
    if (!candidate) return '';

    const baseOrigin = fallbackOrigin || (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : DEFAULT_LOCAL_AUTH_BASE);
    const isAbsolute = /^https?:\/\//i.test(candidate);

    try {
        const parsed = isAbsolute ? new URL(candidate) : new URL(candidate, baseOrigin);
        const origin = isAbsolute ? `${parsed.protocol}//${parsed.host}` : baseOrigin;
        const prefix = normalizePathPrefix(parsed.pathname);
        return `${origin}${prefix}`;
    } catch {
        return '';
    }
};

const isLoopbackHost = (host) => host === 'localhost' || host === '127.0.0.1';

const normalizeLoopbackHost = (origin) => {
    try {
        const parsed = new URL(origin);
        const pageHost = window.location.hostname;
        if (isLoopbackHost(parsed.hostname) && isLoopbackHost(pageHost) && parsed.hostname !== pageHost) {
            parsed.hostname = pageHost;
        }
        return parsed.toString().replace(/\/$/, '');
    } catch {
        return origin;
    }
};

const deriveAuthUrlFromBackend = () => {
    const backendRaw = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_URL || '';
    if (!backendRaw) return '';

    const pageOrigin = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '';
    const rawString = String(backendRaw).trim();
    const isAbsolute = /^https?:\/\//i.test(rawString);

    try {
        const parsed = isAbsolute ? new URL(rawString) : new URL(rawString, pageOrigin || DEFAULT_LOCAL_AUTH_BASE);
        if (isAbsolute && parsed.port === '8000') {
            parsed.port = '8005';
        }
        const origin = isAbsolute ? `${parsed.protocol}//${parsed.host}` : (pageOrigin || `${parsed.protocol}//${parsed.host}`);
        const prefix = normalizePathPrefix(parsed.pathname);
        return `${origin}${prefix}`;
    } catch {
        return '';
    }
};

const resolveAuthApiBaseUrl = () => {
    const pageOrigin = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '';
    const explicit = normalizeAuthBaseUrl(import.meta.env.VITE_AUTH_API_URL || '', pageOrigin);
    if (explicit) {
        return normalizeLoopbackHost(explicit);
    }

    const fromBackend = deriveAuthUrlFromBackend();
    if (fromBackend) {
        return normalizeLoopbackHost(fromBackend);
    }

    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (isLocalHost) {
        return normalizeLoopbackHost(`http://${host}:8005`);
    }

    return normalizeLoopbackHost(pageOrigin || DEFAULT_LOCAL_AUTH_BASE);
};

const AUTH_API_BASE_URL = resolveAuthApiBaseUrl();
if (import.meta.env.PROD && !import.meta.env.VITE_AUTH_API_URL) {
    console.warn('[authClient] VITE_AUTH_API_URL is not set. Using fallback:', AUTH_API_BASE_URL);
}

const deriveLoopbackAliasOrigin = (origin) => {
    try {
        const parsed = new URL(origin);
        if (!isLoopbackHost(parsed.hostname)) {
            return '';
        }
        parsed.hostname = parsed.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
        return parsed.toString().replace(/\/$/, '');
    } catch {
        return '';
    }
};

const AUTH_API_LOOPBACK_ALIAS_URL = deriveLoopbackAliasOrigin(AUTH_API_BASE_URL);

const safeStorageGet = (key) => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeStorageSet = (key, value) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage errors (private mode, quota, etc.)
    }
};

const safeStorageRemove = (key) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    } catch {
        // Ignore storage errors.
    }
};

const decodeJwtPayload = (token) => {
    try {
        const parts = String(token || '').split('.');
        if (parts.length < 2) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const isJwtExpired = (token, leewaySeconds = 15) => {
    const payload = decodeJwtPayload(token);
    const exp = Number(payload?.exp);
    if (!Number.isFinite(exp)) return false;
    return (Date.now() / 1000) >= (exp - leewaySeconds);
};

let accessToken = safeStorageGet(ACCESS_TOKEN_STORAGE_KEY);
if (accessToken && isJwtExpired(accessToken)) {
    accessToken = null;
    safeStorageRemove(ACCESS_TOKEN_STORAGE_KEY);
}
let refreshPromise = null;
let activeAuthApiBaseUrl = AUTH_API_BASE_URL;

const toUrl = (path, baseUrl = activeAuthApiBaseUrl) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    try {
        const parsedBase = new URL(baseUrl);
        const basePath = normalizePathPrefix(parsedBase.pathname);
        const origin = `${parsedBase.protocol}//${parsedBase.host}`;

        if (
            basePath &&
            (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`))
        ) {
            return `${origin}${normalizedPath}`;
        }

        return `${origin}${basePath}${normalizedPath}`;
    } catch {
        return `${baseUrl}${normalizedPath}`;
    }
};

const toError = async (response, fallbackMessage) => {
    try {
        const data = await response.json();
        if (data?.detail) {
            return new Error(String(data.detail));
        }
    } catch {
        // Ignore json parse failures.
    }
    return new Error(fallbackMessage);
};

export const getAccessToken = () => {
    if (accessToken && isJwtExpired(accessToken)) {
        accessToken = null;
        safeStorageRemove(ACCESS_TOKEN_STORAGE_KEY);
    }
    return accessToken;
};

export const setAccessToken = (token) => {
    accessToken = typeof token === 'string' && token.trim() ? token : null;
    if (accessToken) {
        safeStorageSet(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    } else {
        safeStorageRemove(ACCESS_TOKEN_STORAGE_KEY);
    }
};

export const clearAccessToken = () => {
    accessToken = null;
    safeStorageRemove(ACCESS_TOKEN_STORAGE_KEY);
};

const authRequest = async (path, options = {}, requestConfig = {}) => {
    const headers = { ...(options.headers || {}) };
    if (!headers['Content-Type'] && options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const { tryAlternateOnNetworkError = false } = requestConfig;
    const requestOptions = {
        ...options,
        headers,
        credentials: 'include',
        cache: 'no-store',
    };

    const candidates = [activeAuthApiBaseUrl];
    if (tryAlternateOnNetworkError) {
        if (AUTH_API_BASE_URL && !candidates.includes(AUTH_API_BASE_URL)) {
            candidates.push(AUTH_API_BASE_URL);
        }
        if (AUTH_API_LOOPBACK_ALIAS_URL && !candidates.includes(AUTH_API_LOOPBACK_ALIAS_URL)) {
            candidates.push(AUTH_API_LOOPBACK_ALIAS_URL);
        }
    }

    let lastNetworkError = null;
    for (const baseUrl of candidates) {
        try {
            const response = await fetch(toUrl(path, baseUrl), requestOptions);
            activeAuthApiBaseUrl = baseUrl;
            return response;
        } catch (error) {
            lastNetworkError = error;
        }
    }

    throw lastNetworkError || new Error('Auth service is unavailable');
};

export const registerUser = async (payload) => {
    const response = await authRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw await toError(response, 'Registration failed');
    }
    return response.json();
};

export const loginUser = async (payload) => {
    const response = await authRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    }, { tryAlternateOnNetworkError: true });
    if (!response.ok) {
        throw await toError(response, 'Login failed');
    }
    const data = await response.json();
    setAccessToken(data.access_token);
    try {
        const authBase = new URL(AUTH_API_BASE_URL);
        const pageHost = window.location.hostname;
        const authHost = authBase.hostname;
        const isLocalPair =
            (pageHost === 'localhost' || pageHost === '127.0.0.1') &&
            (authHost === 'localhost' || authHost === '127.0.0.1');
        if (isLocalPair && pageHost !== authHost) {
            // Auth host differs from page host - cookies may not work
        }
    } catch {
        // Ignore URL parsing failures.
    }
    return data;
};

export const confirmEmail = async (token) => {
    const response = await authRequest(`/api/auth/confirm?token=${encodeURIComponent(token)}`, {
        method: 'GET',
    });
    if (!response.ok) {
        throw await toError(response, 'Email confirmation failed');
    }
    return response.json();
};

export const requestPasswordReset = async (email) => {
    const response = await authRequest('/api/auth/password-reset-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        throw await toError(response, 'Password reset request failed');
    }
    return response.json();
};

export const resetPassword = async ({ token, newPassword }) => {
    const response = await authRequest('/api/auth/password-reset', {
        method: 'POST',
        body: JSON.stringify({
            token,
            new_password: newPassword,
        }),
    });
    if (!response.ok) {
        throw await toError(response, 'Password reset failed');
    }
    return response.json();
};

export const logoutUser = async () => {
    let token = getAccessToken();
    if (!token) {
        try {
            token = await refreshAccessToken();
        } catch {
            token = null;
        }
    }
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        await authRequest('/api/auth/logout', {
            method: 'POST',
            headers,
        });
    } finally {
        clearAccessToken();
    }
};

export const getCurrentUser = async () => {
    const token = getAccessToken();
    if (!token) {
        throw new Error('No access token');
    }
    const response = await authRequest('/api/auth/me', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }, { tryAlternateOnNetworkError: true });
    if (!response.ok) {
        throw await toError(response, 'Failed to fetch current user');
    }
    return response.json();
};

export const refreshAccessToken = async () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const token = getAccessToken();
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const requestOptions = { method: 'POST', headers };

        let response;
        try {
            response = await authRequest('/api/auth/refresh', requestOptions, { tryAlternateOnNetworkError: true });
        } catch {
            const networkError = new Error('Auth service is unavailable');
            networkError.code = 'AUTH_NETWORK_ERROR';
            throw networkError;
        }

        if (!response.ok && (response.status === 401 || response.status === 403) && AUTH_API_LOOPBACK_ALIAS_URL) {
            const currentBase = activeAuthApiBaseUrl;
            const alternateCandidates = [AUTH_API_BASE_URL, AUTH_API_LOOPBACK_ALIAS_URL]
                .filter((baseUrl) => baseUrl && baseUrl !== currentBase);

            for (const baseUrl of alternateCandidates) {
                try {
                    const alternateResponse = await fetch(toUrl('/api/auth/refresh', baseUrl), {
                        ...requestOptions,
                        credentials: 'include',
                        cache: 'no-store',
                    });
                    if (alternateResponse.ok) {
                        activeAuthApiBaseUrl = baseUrl;
                        response = alternateResponse;
                        break;
                    }
                } catch {
                    // Ignore alternate network errors and keep original response handling.
                }
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const detail = errorData?.detail || 'Token refresh failed';
            console.warn(`[authClient] Refresh failed: ${response.status} - ${detail}`);
            clearAccessToken();
            const error = new Error(String(detail));
            error.status = response.status;
            error.code = (response.status === 401 || response.status === 403) ? 'UNAUTHORIZED' : 'AUTH_REFRESH_FAILED';
            throw error;
        }

        const data = await response.json();
        setAccessToken(data.access_token);
        return data.access_token;
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
};
