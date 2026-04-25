const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed || trimmed.length > 254) return false;
    return EMAIL_REGEX.test(trimmed);
};

export const isStrongPassword = (value) => {
    const str = String(value || '');
    if (str.length < 8) return false;
    if (!/[A-Z]/.test(str)) return false;
    if (!/[a-z]/.test(str)) return false;
    if (!/[0-9]/.test(str)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(str)) return false;
    return true;
};
