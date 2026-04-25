import React, { useMemo, useState, useEffect } from 'react';
import iconLanguage from '../../assets/sidebar/language.svg?raw';
import logoExpanded from '../../assets/sidebar/logo-expanded.svg';
import { AuthInput } from './AuthInput';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { i18n } from '../../constants/i18n';
import { requestPasswordReset } from '../../lib/authClient';
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

export const ForgotPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [lang, setLang] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('lang') || 'ru';
    });
    const [email, setEmail] = useState('');
    const [touched, setTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const t = (key) => i18n[lang][key] || i18n.en[key] || key;
    const emailError = touched && !validateEmail(email);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const nextLang = params.get('lang') || 'ru';
        if (nextLang !== lang) {
            setLang(nextLang);
        }
    }, [location.search, lang]);

    const handleToggleLang = () => {
        const nextLang = lang === 'ru' ? 'en' : 'ru';
        setLang(nextLang);
        const params = new URLSearchParams(location.search);
        params.set('lang', nextLang);
        const nextSearch = params.toString();
        navigate(`${location.pathname}?${nextSearch}`, { replace: true });
    };

    const handleResetRequest = async () => {
        setTouched(true);
        setErrorMessage('');
        if (!validateEmail(email) || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            await requestPasswordReset(email.trim());
            navigate(`/auth?lang=${lang}&toast=password-reset-requested`);
        } catch (error) {
            setErrorMessage(error?.message || t('authPasswordResetRequestFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page-root w-full h-screen bg-[#0A0F18] flex items-center justify-center p-4 overflow-hidden">
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
                                {t('authForgotTitle')}
                            </h1>

                            <form
                                className="flex flex-col gap-6"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleResetRequest();
                                }}
                            >
                                <AuthInput
                                    label={t('authEmailLabel')}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('authEmailPlaceholder')}
                                    autoComplete="email"
                                    inputMode="email"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    errorText={emailError ? t('authErrorInvalid') : ''}
                                    onBlur={undefined}
                                />

                                <button
                                    type="submit"
                                    className="w-full h-[44px] rounded-[12px] text-white text-[16px] font-medium leading-[20px] tracking-[-0.01em] gg-gradient-btn disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t('authLoading') : t('authForgotAction')}
                                </button>
                                {errorMessage && (
                                    <p className="text-[#D23D3D] text-[14px] font-medium leading-[18px] tracking-[-0.01em]">
                                        {errorMessage}
                                    </p>
                                )}
                            </form>
                        </div>

                        <div className="auth-page-spacer w-full" />
                    </div>

                    <div className="relative w-full lg:flex-1 min-h-[320px] lg:min-h-[751px] p-2 lg:p-2">
                        <div className="w-full h-full rounded-[20px] bg-[#0A0F18] flex items-center justify-center">
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

