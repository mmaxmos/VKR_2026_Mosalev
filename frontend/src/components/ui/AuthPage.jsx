import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { CheckCircle, Eye, EyeOff, X } from 'lucide-react';
import iconLanguage from '../../assets/sidebar/language.svg?raw';
import logoExpanded from '../../assets/sidebar/logo-expanded.svg';
import { AuthInput } from './AuthInput';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { i18n } from '../../constants/i18n';
import { getCurrentUser, loginUser } from '../../lib/authClient';
import { isValidEmail } from '../../lib/authValidation';

const normalizeSvgMarkup = (svg) => {
    if (!svg) return '';
    let normalized = svg
        .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
        .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
    normalized = normalized.replace(/<svg([^>]*)>/, (match, attrs) => {
        let nextAttrs = attrs
            .replace(/\swidth="[^"]*"/, '')
            .replace(/\sheight="[^"]*"/, '');
        if (!/\sviewBox="[^"]*"/.test(nextAttrs)) {
            nextAttrs = `${nextAttrs} viewBox="0 0 20 20"`;
        }
        return `<svg${nextAttrs} width="100%" height="100%">`;
    });
    return normalized;
};

const InlineIcon = ({ svg, size = 20, color, className = '' }) => {
    const markup = useMemo(() => normalizeSvgMarkup(svg), [svg]);
    return (
        <span
            className={`inline-flex ${className}`}
            style={{ width: `${size}px`, height: `${size}px`, color }}
            dangerouslySetInnerHTML={{ __html: markup }}
            aria-hidden="true"
        />
    );
};


const validateEmail = (value) => isValidEmail(value);

const validatePassword = (value) => value.trim().length > 0;

export const AuthPage = ({ onLoginSuccess }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [lang, setLang] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('lang') || 'ru';
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [toastKey, setToastKey] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const t = (key) => i18n[lang][key] || i18n.en[key] || key;

    const emailError = touched && !validateEmail(email);
    const passwordError = touched && !validatePassword(password);

    const clearToastParam = useCallback(() => {
        const params = new URLSearchParams(location.search);
        params.delete('toast');
        const nextSearch = params.toString();
        navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
    }, [location.pathname, location.search, navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const nextLang = params.get('lang') || 'ru';
        if (nextLang !== lang) setLang(nextLang);

        const nextToastKey = params.get('toast') || '';
        setToastKey(nextToastKey);

        if (nextToastKey === 'confirm-email') {
            setToastType('success');
            setToastMessage(t('authConfirmEmailToast'));
        } else if (nextToastKey === 'email-confirmed') {
            setToastType('success');
            setToastMessage(t('authEmailConfirmedToast'));
        } else if (nextToastKey === 'password-reset-requested') {
            setToastType('success');
            setToastMessage(t('authPasswordResetRequestToast'));
        } else if (nextToastKey === 'password-reset-success') {
            setToastType('success');
            setToastMessage(t('authPasswordResetSuccessToast'));
        } else if (nextToastKey === 'confirm-email-failed') {
            setToastType('error');
            setToastMessage(t('authConfirmFailedToast'));
        } else if (nextToastKey === 'logout-success') {
            setToastType('success');
            setToastMessage(t('authLogoutSuccessToast'));
        } else if (nextToastKey === 'auth-required') {
            setToastType('error');
            setToastMessage(t('authRequiredToast'));
        } else {
            setToastMessage('');
        }

        return undefined;
    }, [location.search, t, lang]);

    useEffect(() => {
        if (toastKey !== 'auth-required' || !toastMessage) return undefined;
        const timer = setTimeout(() => {
            setToastMessage('');
            clearToastParam();
        }, 5000);
        return () => clearTimeout(timer);
    }, [toastKey, toastMessage, clearToastParam]);

    const handleCloseToast = () => {
        setToastMessage('');
        clearToastParam();
    };

    const handleToggleLang = () => {
        const nextLang = lang === 'ru' ? 'en' : 'ru';
        setLang(nextLang);
        const params = new URLSearchParams(location.search);
        params.set('lang', nextLang);
        const nextSearch = params.toString();
        navigate(`${location.pathname}?${nextSearch}`, { replace: true });
    };

    const resolveLoginError = (message) => {
        const normalized = String(message || '').toLowerCase();
        if (normalized.includes('email not confirmed')) {
            return t('authLoginEmailNotConfirmed');
        }
        if (normalized.includes('invalid credentials')) {
            return t('authLoginInvalidCredentials');
        }
        if (normalized.includes('rate limit')) {
            return t('authTooManyRequests');
        }
        return t('authLoginFailed');
    };

    const handleLogin = async () => {
        setTouched(true);
        setErrorMessage('');
        if (!validateEmail(email) || !validatePassword(password) || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            await loginUser({
                email: email.trim(),
                password,
            });
            localStorage.setItem('userEmail', email.trim());
            try {
                const me = await getCurrentUser();
                if (me?.email) {
                    localStorage.setItem('userEmail', me.email);
                }
            } catch {
                // Ignore /me failures, login already succeeded.
            }

            if (onLoginSuccess) {
                onLoginSuccess({ email: localStorage.getItem('userEmail') || email.trim() });
            }
            navigate(`/?tab=description&toast=login-success&lang=${lang}`);
        } catch (error) {
            setErrorMessage(resolveLoginError(error?.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page-root w-full h-screen bg-[#0A0F18] flex items-center justify-center p-4 overflow-hidden">
            {toastMessage && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-[12px] text-white text-[12px] font-medium leading-[15px] tracking-[-0.01em] shadow-[0_0_32px_rgba(10,15,24,0.8)] ${toastType === 'error' ? 'bg-[#D23D3D]' : 'gg-gradient-btn'}`}>
                    <CheckCircle size={20} className="text-white" />
                    <span className="whitespace-nowrap">{toastMessage}</span>
                    <button
                        onClick={handleCloseToast}
                        className="ml-1 text-white/90 hover:text-white transition-colors"
                        aria-label={t('close')}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
            <div className="auth-page-frame w-full max-w-[1440px] h-full bg-[#0A0F18] rounded-[24px] relative overflow-hidden">
                <div className="auth-page-layout flex flex-col lg:flex-row w-full h-full">
                    <div className="auth-page-left relative w-full lg:w-[600px] flex flex-col justify-between items-start p-8 gap-12">
                        <div className="auth-page-top w-full flex items-center justify-between">
                            <Link to={`/?lang=${lang}`} className="w-[129px] h-[32px] bg-white/0">
                                <img
                                    src={logoExpanded}
                                    alt="GameGlory"
                                    className="w-[129px] h-[32px]"
                                />
                            </Link>
                            <button
                                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                                onClick={handleToggleLang}
                                aria-label="Toggle language"
                            >
                                <InlineIcon svg={iconLanguage} color="#FFFFFF" size={20} />
                                <span className="text-[14px] font-medium leading-[18px] tracking-[-0.01em]">{t('authLangLabel')}</span>
                            </button>
                        </div>

                        <div className="auth-page-main w-full max-w-[536px] flex flex-col gap-10">
                            <h1 className="text-white text-[32px] font-medium leading-[120%] tracking-[-0.02em]">
                                {t('authTitle')}
                            </h1>

                            <form
                                className="flex flex-col gap-6"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleLogin();
                                }}
                            >
                                <AuthInput
                                    label={t('authEmailLabel')}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('authEmailPlaceholder')}
                                    autoComplete="username"
                                    inputMode="email"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    errorText={emailError ? t('authErrorInvalid') : ''}
                                    onBlur={undefined}
                                />

                                <AuthInput
                                    label={t('authPasswordLabel')}
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('authPasswordPlaceholder')}
                                    autoComplete="current-password"
                                    spellCheck={false}
                                    rightSlot={(
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => !prev)}
                                            className="text-[#A7A8AC] hover:text-white transition-colors"
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    )}
                                    errorText={passwordError ? t('authErrorInvalid') : ''}
                                    onBlur={undefined}
                                />

                                 {/* Запомнить меня и забыл пароль */}

                                <div className="flex flex-row justify-end items-center gap-1 w-full h-[18px] text-[14px] leading-[18px] tracking-[-0.01em]">
                                    <span className="font-medium text-white">{t('authForgotLabel')}</span>
                                    <Link className="font-medium text-[#FF5620] no-underline hover:opacity-90 transition-opacity" to={`/forgot?lang=${lang}`}>{t('authForgotActionLink')}</Link>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-[44px] rounded-[12px] text-white text-[16px] font-medium leading-[20px] tracking-[-0.01em] gg-gradient-btn disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t('authLoading') : t('authSignIn')}
                                </button>
                                {errorMessage && (
                                    <p className="text-[#D23D3D] text-[14px] font-medium leading-[18px] tracking-[-0.01em]">
                                        {errorMessage}
                                    </p>
                                )}

                                {/* Регистрация */}
                                <div className="flex items-center justify-center gap-1 text-[14px] leading-[18px] tracking-[-0.01em]">
                                    <span className="text-white">{t('authNoAccount')}</span>
                                    <Link className="text-[#FF5620]" to={`/register?lang=${lang}`}>{t('authRegister')}</Link>
                                </div>
                            </form>
                        </div>

                        <div className="auth-page-spacer w-full" />
                    </div>

                    <div className="relative w-full lg:flex-1 min-h-[320px] lg:min-h-[751px] p-2 lg:p-2">
                        <div
                            className="w-full h-full rounded-[20px] bg-[#0A0F18] flex items-center justify-center"
                        >
                            <img
                                src="/auth/auth-image.png"
                                alt="Auth Visual"
                                className="w-full h-full max-h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .gg-gradient-btn {
                    background: radial-gradient(100% 7302.48% at 0% 1.14%, #FF7549 0%, #FF5620 100%);
                }
                .gg-gradient-btn:hover {
                    background: linear-gradient(0deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12)),
                                radial-gradient(100% 7302.48% at 0% 1.14%, #FF7549 0%, #FF5620 100%);
                }

                @media (min-width: 1600px), (min-width: 1280px) and (min-height: 980px) {
                    .auth-page-root {
                        align-items: flex-start;
                        overflow-y: auto;
                        padding-top: 24px;
                        padding-bottom: 24px;
                    }

                    .auth-page-frame {
                        height: auto;
                        min-height: 820px;
                        max-height: calc(100vh - 48px);
                    }

                    .auth-page-layout {
                        min-height: 820px;
                    }

                    .auth-page-left {
                        justify-content: flex-start;
                        gap: 28px;
                    }

                    .auth-page-main {
                        margin-top: auto;
                        margin-bottom: auto;
                    }

                    .auth-page-spacer {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};
