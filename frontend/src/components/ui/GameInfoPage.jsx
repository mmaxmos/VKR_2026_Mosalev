import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../lib/apiClient';

const resolveSteamUrl = (game, fallbackId) => {
    if (!game && !fallbackId) return '';
    const explicitUrl = game?.steamUrl || game?.steam_url || game?.steamLink || game?.steam_link || game?.url;
    if (explicitUrl) return explicitUrl;
    const appId = game?.id || fallbackId;
    if (!appId) return '';
    return `https://store.steampowered.com/app/${encodeURIComponent(String(appId))}`;
};

const MetaRow = ({ leftLabel, leftValue, rightLabel, rightValue }) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
        <div className="flex items-center justify-between border-b border-[#353842] pb-2">
            <span className="text-[14px] leading-[18px] tracking-[-0.01em] text-[#A7A8AC]">{leftLabel}</span>
            <span className="text-[14px] leading-[18px] tracking-[-0.01em] text-white text-right">{leftValue || '-'}</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#353842] pb-2">
            <span className="text-[14px] leading-[18px] tracking-[-0.01em] text-[#A7A8AC]">{rightLabel}</span>
            <span className="text-[14px] leading-[18px] tracking-[-0.01em] text-white text-right">{rightValue || '-'}</span>
        </div>
    </div>
);

const ValueCard = ({ title, value }) => (
    <div className="rounded-[20px] bg-[#191D28] p-4">
        <p className="text-[16px] leading-5 tracking-[-0.01em] text-white">{title}</p>
        <p className="mt-6 text-[20px] leading-[26px] tracking-[-0.01em] text-white">{value || '-'}</p>
    </div>
);

const ChipGroupCard = ({ title, items, tone = 'neutral', emptyText = '-' }) => {
    const chipClasses =
        tone === 'green'
            ? 'bg-[#1D332F] text-[#3AD867]'
            : tone === 'red'
                ? 'bg-[#2F202A] text-[#D23D3D]'
                : 'bg-[#353842] text-white';

    return (
        <div className="rounded-[20px] bg-[#191D28] p-4">
            <p className="text-[16px] leading-5 tracking-[-0.01em] text-white">{title}</p>
            <div className="mt-6 flex flex-wrap gap-1">
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <span
                            key={`${title}-${item}-${idx}`}
                            className={`inline-flex h-[22px] items-center justify-center rounded px-[6px] py-[2px] text-[14px] font-medium leading-[18px] tracking-[-0.01em] ${chipClasses}`}
                        >
                            {item}
                        </span>
                    ))
                ) : (
                    <span className="text-[14px] leading-[18px] text-[#A7A8AC]">{emptyText}</span>
                )}
            </div>
        </div>
    );
};

export const GameInfoPage = ({ gameId, t = (key) => key }) => {
    const [game, setGame] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorKey, setErrorKey] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadGame = async () => {
            setIsLoading(true);
            setErrorKey('');

            try {
                const response = await apiRequest(`/games/${gameId}`);
                if (!response.ok) {
                    throw new Error(`Request failed: ${response.status}`);
                }
                const data = await response.json();
                if (isMounted) {
                    setGame(data);
                }
            } catch (_err) {
                if (isMounted) {
                    setErrorKey('gameInfoLoadError');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (gameId) {
            loadGame();
        } else {
            setErrorKey('gameInfoInvalidId');
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [gameId]);

    const pros = useMemo(() => (Array.isArray(game?.pros) ? game.pros : []), [game]);
    const cons = useMemo(() => (Array.isArray(game?.cons) ? game.cons : []), [game]);
    const hasProsCons = pros.length > 0 || cons.length > 0;
    const description = (game?.description || '').trim();
    const steamUrl = useMemo(() => resolveSteamUrl(game, gameId), [game, gameId]);
    const gameTitle = game?.title || `${t('gameInfoUntitled')} #${gameId}`;

    if (isLoading) {
        return (
            <div className="min-h-full bg-[#0A0F18] px-4 py-8 font-['Onest'] text-white sm:px-6">
                <div className="mx-auto w-full max-w-[1144px] animate-pulse space-y-4 rounded-[20px] bg-[#191D28] p-6">
                    <div className="h-8 w-64 rounded bg-[#353842]" />
                    <div className="h-52 rounded bg-[#353842]" />
                    <div className="h-24 rounded bg-[#353842]" />
                </div>
            </div>
        );
    }

    if (errorKey) {
        return (
            <div className="min-h-full bg-[#0A0F18] px-4 py-8 font-['Onest'] text-white sm:px-6">
                <div className="mx-auto w-full max-w-[1144px] rounded-[20px] bg-[#191D28] p-6 text-[16px] text-[#D23D3D]">
                    {t(errorKey)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#0A0F18] font-['Onest'] text-white">
            <div className="w-full px-4 py-4 sm:px-6 lg:pr-6">
                <div className="mx-auto w-full max-w-[1144px]">
                    <div className="flex flex-col gap-4">
                        <section className="grid overflow-hidden rounded-[20px] bg-[#191D28] lg:grid-cols-2">
                            <div className="h-[240px] w-full">
                                {game?.image ? (
                                    <img src={game.image} alt={game.title || 'game'} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-[#353842]" />
                                )}
                            </div>
                            <div className="flex h-full flex-col justify-between gap-3 p-4">
                                {steamUrl ? (
                                    <a
                                        href={steamUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-fit text-[24px] font-medium leading-[120%] tracking-[-0.02em] text-white transition-colors hover:text-[#FF7549]"
                                    >
                                        {gameTitle}
                                    </a>
                                ) : (
                                    <h1 className="text-[24px] font-medium leading-[120%] tracking-[-0.02em]">
                                        {gameTitle}
                                    </h1>
                                )}
                                <div className="flex flex-col gap-5">
                                    <MetaRow leftLabel={t('gameInfoPrice')} leftValue={game?.price} rightLabel={t('gameInfoDownloads')} rightValue={game?.downloads} />
                                    <MetaRow leftLabel={t('gameInfoReleaseDate')} leftValue={game?.releaseDate} rightLabel={t('gameInfoRevenue')} rightValue={game?.revenue} />
                                    <MetaRow leftLabel={t('gameInfoDeveloper')} leftValue={game?.developer} rightLabel={t('gameInfoPublisher')} rightValue={game?.publisher} />
                                    <MetaRow leftLabel={t('gameInfoPublisherClass')} leftValue={game?.publisherClass} rightLabel={' '} rightValue={' '} />
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-4 md:grid-cols-3">
                            <ValueCard title={t('gameInfoTotalReviews')} value={game?.reviewCount} />
                            <ValueCard title={t('gameInfoPositiveReviews')} value={game?.positiveReviewPercent} />
                            <ValueCard title={t('gameInfoPeakCCU')} value={game?.peakCCU} />
                        </section>

                        <section className="rounded-[20px] bg-[#191D28] p-4">
                            <p className="text-[16px] leading-5 tracking-[-0.01em] text-white">{t('gameInfoDescription')}</p>
                            <div className="mt-4 max-h-[220px] overflow-y-auto rounded-[12px] p-3 custom-scrollbar">
                                <p className="text-[14px] leading-[20px] tracking-[-0.01em] text-white">
                                    {description || t('gameInfoNoData')}
                                </p>
                            </div>
                        </section>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <ChipGroupCard title={t('gameInfoTags')} items={game?.tags || []} emptyText={t('gameInfoNoData')} />
                            <ChipGroupCard title={t('gameInfoGenres')} items={game?.genres || []} emptyText={t('gameInfoNoData')} />
                            <ChipGroupCard title={t('gameInfoCategories')} items={game?.categories || []} emptyText={t('gameInfoNoData')} />
                            {/* <ChipGroupCard title={t('gameInfoPublisher')} items={game?.publisher ? [game.publisher] : []} emptyText={t('gameInfoNoData')} /> */}
                        </section>

                        {hasProsCons && (
                            <section className="grid gap-4 lg:grid-cols-2">
                                <ChipGroupCard title={t('gameInfoStrengths')} items={pros} tone="green" emptyText={t('gameInfoNoData')} />
                                <ChipGroupCard title={t('gameInfoWeaknesses')} items={cons} tone="red" emptyText={t('gameInfoNoData')} />
                            </section>
                        )}
                        {/* Hidden until backend returns pros/cons arrays */}
                    </div>
                </div>
            </div>
        </div>
    );
};
