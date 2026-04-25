import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmEmail } from '../../lib/authClient';

const REQUESTS_KEY = '__email_confirm_requests__';

const getRequestsStore = () => {
    const scope = globalThis;
    if (!scope[REQUESTS_KEY]) {
        scope[REQUESTS_KEY] = {};
    }
    return scope[REQUESTS_KEY];
};

export const ConfirmEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let isCancelled = false;
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const lang = params.get('lang') || 'ru';

        const redirectToAuth = (toastKey) => {
            if (isCancelled) return;
            navigate(`/auth?lang=${lang}&toast=${toastKey}`, { replace: true });
        };

        if (!token) {
            redirectToAuth('confirm-email-failed');
            return () => {
                isCancelled = true;
            };
        }

        const requests = getRequestsStore();
        if (!requests[token]) {
            requests[token] = confirmEmail(token);
        }

        requests[token]
            .then(() => redirectToAuth('email-confirmed'))
            .catch(() => redirectToAuth('confirm-email-failed'))
            .finally(() => {
                delete requests[token];
            });

        return () => {
            isCancelled = true;
        };
    }, [location.search, navigate]);

    return (
        <div className="w-full h-screen bg-[#0A0F18] flex items-center justify-center text-white text-[16px]">
            Confirming email...
        </div>
    );
};
