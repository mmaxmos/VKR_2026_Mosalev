import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, FileText, FileType2, Globe, MoonStar, Search, Sun, X } from 'lucide-react';
import { exportPitchPackClient } from '../model/exportPitchPackClient';
import { sortCompetitors } from '../model/buildExportViewModel';
import './PitchPackSection.css';

const formatExtensions = { pdf: 'pdf', docx: 'docx', html: 'html' };

const copyByLang = {

    ru: {
        namesTitle: 'Параметры названия',
        gameLabel: 'Название игры для отчета',
        fileLabel: 'Итоговое название файла',
        exportTitle: 'Параметры экспорта',
        formatLabel: 'Формат документа',
        themeLabel: 'Тема документа',
        modulesTitle: 'Модули документа',
        sectionMarket: 'Анализ рынка',
        sectionMarketHint: 'Включает 12 основных метрик и 6 графиков по рынку',
        sectionIdea: 'Анализ идеи',
        sectionIdeaHint: 'Включает основные советы по улучшению игры от ИИ',
        sectionCompetitors: 'Конкуренты',
        sectionCompetitorsHint: 'Включает подробную информацию по выбранным играм конкурентов',
        pages: 'Страниц в отчете',
        download: 'Скачать документ',
        reset: 'Сбросить',
        exporting: 'Экспорт...',
        formatPdf: 'PDF',
        formatPdfHint: 'Топ вариант',
        formatDocx: 'DOCX',
        formatDocxHint: 'Редактирование',
        formatHtml: 'HTML',
        formatHtmlHint: 'Для веба',
        themeLight: 'Светлая тема',
        themeLightHint: 'Лучше для печати',
        themeDark: 'Темная тема',
        themeDarkHint: 'Лучше для экранов',
        defaultGameName: 'Cool Game Name',
        defaultFileName: 'CoolGameName_PitchPack',
        fallbackCompetitor: 'Название игры',
        pickGames: 'Выбрать игры',
        gamesModalTitle: 'Выбор игр',
        gamesSearchPlaceholder: 'Поиск по названию игры',
        chooseAll: 'Выбрать всё',
        clearSelection: 'Снять выбор',
        noGamesFound: 'Игры не найдены',
        noSectionData: 'Нет данных в этом разделе',
        selectSectionWarning: 'Выберите минимум один модуль',
        exportError: 'Ошибка экспорта',
    },    en: {
        namesTitle: 'Naming Parameters',
        gameLabel: 'Game title for report',
        fileLabel: 'Final filename',
        exportTitle: 'Export Parameters',
        formatLabel: 'Document format',
        themeLabel: 'Document theme',
        modulesTitle: 'Document modules',
        sectionMarket: 'Market analysis',
        sectionMarketHint: 'Includes 12 core metrics and 6 market charts',
        sectionIdea: 'Idea analysis',
        sectionIdeaHint: 'Includes key AI recommendations to improve your game',
        sectionCompetitors: 'Competitors',
        sectionCompetitorsHint: 'Includes detailed information about selected competitors',
        pages: 'Pages in report',
        download: 'Download document',
        reset: 'Reset',
        exporting: 'Exporting...',
        formatPdf: 'PDF',
        formatPdfHint: 'Best option',
        formatDocx: 'DOCX',
        formatDocxHint: 'Editable format',
        formatHtml: 'HTML',
        formatHtmlHint: 'Web preview',
        themeLight: 'Light theme',
        themeLightHint: 'Best for print',
        themeDark: 'Dark theme',
        themeDarkHint: 'Best for screens',
        defaultGameName: 'Cool Game Name',
        defaultFileName: 'CoolGameName_PitchPack',
        fallbackCompetitor: 'Game title',
        pickGames: 'Pick games',
        gamesModalTitle: 'Select games',
        gamesSearchPlaceholder: 'Search by game title',
        chooseAll: 'Select all',
        clearSelection: 'Clear selection',
        noGamesFound: 'No games found',
        noSectionData: 'No data in this section',
        selectSectionWarning: 'Select at least one module',
        exportError: 'Export failed',
    },
};

const hasData = (data) => {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') return Object.keys(data).length > 0;
    return Boolean(data);
};

const DEFAULT_SELECTED_GAMES_LIMIT = 10;

const buildDefaultSelectedCompetitorIds = (competitors) => (
    new Set(competitors.slice(0, DEFAULT_SELECTED_GAMES_LIMIT).map((item) => item.id))
);

const SelectCard = ({ icon, title, subtitle, selected, onClick, disabled = false }) => (
    <button
        type="button"
        onClick={() => {
            if (!disabled && onClick) onClick();
        }}
        disabled={disabled}
        className={`pp-option ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
        <span className="pp-option-icon">{icon}</span>
        <span className="pp-option-text">
            <span className="pp-option-title">{title}</span>
            <span className="pp-option-subtitle">{subtitle}</span>
        </span>
    </button>
);

const ModuleRow = ({ title, subtitle, checked, onChange, wide = false, rightAction = null, disabled = false, onDisabledClick, className = '' }) => (
    <label
        className={`pp-module-row ${wide ? 'is-wide' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
        onClick={(event) => {
            if (event.target.closest('button')) return;
            if (!disabled) {
                event.preventDefault();
                if (onChange) onChange();
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (onDisabledClick) onDisabledClick();
        }}
    >
        <span className={`pp-module-text ${wide ? 'is-wide' : ''}`}>
            <span className={`pp-module-title ${wide ? 'is-wide' : ''}`}>{title}</span>
            <span className={`pp-module-subtitle ${wide ? 'is-wide' : ''}`}>{subtitle}</span>
        </span>
        <span className="pp-module-controls">
            {rightAction}
            <span className={`pp-checkbox ${checked ? 'is-checked' : ''}`}>
                <input type="checkbox" checked={checked} onChange={() => {}} disabled={disabled} />
                {checked && <Check size={15} strokeWidth={2.8} />}
            </span>
        </span>
    </label>
);

const CompetitorChip = ({ title, checked, onChange }) => (
    <label className={`pp-competitor-chip ${checked ? 'is-checked' : ''}`}>
        <span className={`pp-checkbox ${checked ? 'is-checked' : ''}`}>
            <input type="checkbox" checked={checked} onChange={onChange} />
            {checked && <Check size={15} strokeWidth={2.8} />}
        </span>
        <span className="pp-competitor-label">{title}</span>
    </label>
);

export const PitchPackSection = ({
    marketData,
    competitorsData,
    ideaData,
    formState,
    uiLanguage,
    competitorsSortOption = 'reviewsDesc',
}) => {
    const lang = uiLanguage === 'ru' ? 'ru' : 'en';
    const copy = copyByLang[lang];
    const toastTimerRef = useRef(null);
    const modalListRef = useRef(null);

    const [format, setFormat] = useState('pdf');
    const [theme, setTheme] = useState('light');
    const [isExporting, setIsExporting] = useState(false);
    const [isGamesModalOpen, setIsGamesModalOpen] = useState(false);
    const [gamesSearch, setGamesSearch] = useState('');
    const [gameName, setGameName] = useState(copy.defaultGameName);
    const [fileName, setFileName] = useState(copy.defaultFileName);
    const [sectionToast, setSectionToast] = useState('');
    const isThemeDisabled = format === 'docx';

    useEffect(() => {
        if (format === 'docx') {
            setTheme(null);
            return;
        }
        setTheme((prev) => prev || 'light');
    }, [format]);

    const sortedCompetitors = useMemo(
        () => sortCompetitors(competitorsData?.list || [], competitorsSortOption),
        [competitorsData?.list, competitorsSortOption]
    );

    const availability = useMemo(
        () => ({
            market: hasData(marketData),
            idea: hasData(ideaData),
            competitors: sortedCompetitors.length > 0,
        }),
        [ideaData, marketData, sortedCompetitors.length]
    );

    const [sections, setSections] = useState({
        market: availability.market,
        idea: availability.idea,
        competitors: availability.competitors,
    });

    const [selectedCompetitorIds, setSelectedCompetitorIds] = useState(() => buildDefaultSelectedCompetitorIds(sortedCompetitors));

    useEffect(() => {
        setSelectedCompetitorIds(buildDefaultSelectedCompetitorIds(sortedCompetitors));
    }, [sortedCompetitors]);

    useEffect(() => {
        setGameName(copy.defaultGameName);
        setFileName(copy.defaultFileName);
    }, [copy.defaultFileName, copy.defaultGameName]);

    useEffect(() => {
        setSections((prev) => ({
            market: availability.market ? prev.market : false,
            idea: availability.idea ? prev.idea : false,
            competitors: availability.competitors ? prev.competitors : false,
        }));
    }, [availability]);

    useEffect(() => () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    }, []);

    useEffect(() => {
        if (modalListRef.current) modalListRef.current.scrollTop = 0;
    }, [gamesSearch]);

    const effectiveCompetitors = useMemo(
        () => ({
            ...(competitorsData || {}),
            list: sortedCompetitors.filter((item) => selectedCompetitorIds.has(item.id)),
        }),
        [competitorsData, sortedCompetitors, selectedCompetitorIds]
    );

    const filteredCompetitors = useMemo(() => {
        const query = gamesSearch.trim().toLowerCase();
        if (!query) return sortedCompetitors;
        return sortedCompetitors.filter((item) => (item.title || '').toLowerCase().includes(query));
    }, [gamesSearch, sortedCompetitors]);

    const areAllFilteredSelected = useMemo(() => {
        if (!filteredCompetitors.length) return false;
        return filteredCompetitors.every((item) => selectedCompetitorIds.has(item.id));
    }, [filteredCompetitors, selectedCompetitorIds]);

    const showNoDataToast = () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setSectionToast(copy.noSectionData);
        toastTimerRef.current = setTimeout(() => setSectionToast(''), 2200);
    };

    const showWarningToast = (message) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setSectionToast(message);
        toastTimerRef.current = setTimeout(() => setSectionToast(''), 2200);
    };

    const toggleSection = (key) => setSections((prev) => ({ ...prev, [key]: !prev[key] }));

    const toggleCompetitor = (id) => {
        setSelectedCompetitorIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAllFilteredCompetitors = () => {
        setSelectedCompetitorIds((prev) => {
            const next = new Set(prev);
            if (areAllFilteredSelected) {
                filteredCompetitors.forEach((item) => next.delete(item.id));
            } else {
                filteredCompetitors.forEach((item) => next.add(item.id));
            }
            return next;
        });
    };

    const handleReset = () => {
        setFormat('pdf');
        setTheme('light');
        setIsGamesModalOpen(false);
        setGamesSearch('');
        setSections({
            market: availability.market,
            idea: availability.idea,
            competitors: availability.competitors,
        });
        setGameName(copy.defaultGameName);
        setFileName(copy.defaultFileName);
        setSelectedCompetitorIds(buildDefaultSelectedCompetitorIds(sortedCompetitors));
        setSectionToast('');
    };

    const estimatedPages = useMemo(() => {
        let pages = 1;
        if (sections.market) pages += 1;
        if (sections.competitors) pages += Math.max(1, Math.ceil((effectiveCompetitors?.list?.length || 0) / 6));
        if (sections.idea) pages += 1;
        return pages;
    }, [effectiveCompetitors?.list?.length, sections]);

    const handleExport = async () => {
        const moduleSections = Object.entries(sections)
            .filter(([, checked]) => checked)
            .map(([key]) => key);

        if (!moduleSections.length) {
            showWarningToast(copy.selectSectionWarning);
            return;
        }

        setIsExporting(true);
        try {
            await exportPitchPackClient({
                selectedSections: ['description', ...moduleSections],
                format,
                theme,
                fileName,
                gameName,
                appLanguage: lang,
                formState,
                marketData,
                ideaData,
                competitorsData: effectiveCompetitors,
                competitorsSortOption,
            });
        } catch (error) {
            console.error('Pitch pack export failed', error);
            alert(copy.exportError);
        } finally {
            setIsExporting(false);
        }
    };

    const activeExtension = formatExtensions[format] || 'pdf';

    return (
        <>
            <section className="pp-wrap">
                <article className="pp-card pp-card-names">
                    <div className="pp-card-body names-block">
                        <h3>{copy.namesTitle}</h3>
                        <div className="pp-two-columns">
                            <label className="pp-field-col">
                                <span>{copy.gameLabel}</span>
                                <div className="pp-input-shell">
                                    <input value={gameName} onChange={(e) => setGameName(e.target.value)} />
                                    <button type="button" className="pp-clear" onClick={() => setGameName('')} aria-label={copy.reset}>
                                        <X size={18} color="#FFFFFF" />
                                    </button>
                                </div>
                            </label>
                            <label className="pp-field-col">
                                <span>{copy.fileLabel}</span>
                                <div className="pp-input-shell">
                                    <input
                                        value={`${fileName}.${activeExtension}`}
                                        onChange={(e) => setFileName(e.target.value.replace(/\.(pdf|docx|html)$/i, ''))}
                                    />
                                    <button type="button" className="pp-clear" onClick={() => setFileName('')} aria-label={copy.reset}>
                                        <X size={18} color="#FFFFFF" />
                                    </button>
                                </div>
                            </label>
                        </div>
                    </div>
                </article>

                <article className="pp-card pp-card-export">
                    <div className="pp-card-body export-block">
                        <h3>{copy.exportTitle}</h3>
                        <div className="pp-two-columns">
                            <div className="pp-field-col pp-format-col">
                                <span>{copy.formatLabel}</span>
                                <div className="pp-options-format-grid">
                                    <SelectCard
                                        icon={<FileText size={20} />}
                                        title={copy.formatPdf}
                                        subtitle={copy.formatPdfHint}
                                        selected={format === 'pdf'}
                                        onClick={() => setFormat('pdf')}
                                    />
                                    <SelectCard
                                        icon={<FileType2 size={20} />}
                                        title={copy.formatDocx}
                                        subtitle={copy.formatDocxHint}
                                        selected={format === 'docx'}
                                        onClick={() => setFormat('docx')}
                                    />
                                    <SelectCard
                                        icon={<Globe size={20} />}
                                        title={copy.formatHtml}
                                        subtitle={copy.formatHtmlHint}
                                        selected={format === 'html'}
                                        onClick={() => setFormat('html')}
                                    />
                                </div>
                            </div>

                            <div className="pp-field-col">
                                <span>{copy.themeLabel}</span>
                                <div className="pp-options-row">
                                    <SelectCard
                                        icon={<Sun size={20} />}
                                        title={copy.themeLight}
                                        subtitle={copy.themeLightHint}
                                        selected={theme === 'light'}
                                        onClick={() => setTheme('light')}
                                        disabled={isThemeDisabled}
                                    />
                                    <SelectCard
                                        icon={<MoonStar size={20} />}
                                        title={copy.themeDark}
                                        subtitle={copy.themeDarkHint}
                                        selected={theme === 'dark'}
                                        onClick={() => setTheme('dark')}
                                        disabled={isThemeDisabled}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="pp-card pp-card-modules">
                    <div className="pp-card-body modules-block">
                        <h3>{copy.modulesTitle}</h3>

                        <div className="pp-modules-grid">
                            <ModuleRow
                                title={copy.sectionMarket}
                                subtitle={copy.sectionMarketHint}
                                checked={sections.market}
                                onChange={() => toggleSection('market')}
                                className={!availability.market ? 'is-disabled' : sections.market ? 'is-selected' : 'is-unselected'}
                                disabled={!availability.market}
                                onDisabledClick={showNoDataToast}
                            />
                            <ModuleRow
                                title={copy.sectionIdea}
                                subtitle={copy.sectionIdeaHint}
                                checked={sections.idea}
                                onChange={() => toggleSection('idea')}
                                className={!availability.idea ? 'is-disabled' : sections.idea ? 'is-selected' : 'is-unselected'}
                                disabled={!availability.idea}
                                onDisabledClick={showNoDataToast}
                            />
                        </div>

                        <div className="pp-module-single">
                            <ModuleRow
                                title={copy.sectionCompetitors}
                                subtitle={copy.sectionCompetitorsHint}
                                checked={sections.competitors}
                                onChange={() => toggleSection('competitors')}
                                wide
                                className={!availability.competitors ? 'is-disabled' : sections.competitors ? 'is-selected' : 'is-unselected'}
                                disabled={!availability.competitors}
                                onDisabledClick={showNoDataToast}
                                rightAction={(
                                    <button
                                        type="button"
                                        className={`pp-select-games-link ${sections.competitors ? '' : 'is-hidden'}`}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            if (!sections.competitors) return;
                                            setIsGamesModalOpen(true);
                                        }}
                                        disabled={!sections.competitors}
                                    >
                                        {`${copy.pickGames} (${selectedCompetitorIds.size})`}
                                    </button>
                                )}
                            />
                        </div>
                    </div>
                </article>

                <footer className="pp-footer-row">
                    <span className="pp-pages-count">{copy.pages}: {estimatedPages}</span>
                    <div className="pp-actions">
                        <button type="button" className="pp-reset-btn" onClick={handleReset}>
                            <X size={18} />
                            <span>{copy.reset}</span>
                        </button>
                        <button type="button" className="pp-download-btn" onClick={handleExport} disabled={isExporting}>
                            {isExporting ? copy.exporting : copy.download}
                        </button>
                    </div>
                </footer>
            </section>

            {sectionToast && (
                <div className="pp-inline-toast">
                    <span>{sectionToast}</span>
                    <button type="button" onClick={() => setSectionToast('')} aria-label={copy.reset}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {isGamesModalOpen && (
                <div className="pp-modal-overlay" onClick={() => setIsGamesModalOpen(false)}>
                    <div className="pp-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="pp-modal-header">
                            <h4>{copy.gamesModalTitle}</h4>
                            <button type="button" className="pp-modal-close" onClick={() => setIsGamesModalOpen(false)} aria-label={copy.reset}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="pp-input-shell pp-modal-search">
                            <Search size={18} color="#A7A8AC" />
                            <input
                                value={gamesSearch}
                                onChange={(event) => setGamesSearch(event.target.value)}
                                placeholder={copy.gamesSearchPlaceholder}
                            />
                            {gamesSearch && (
                                <button
                                    type="button"
                                    className="pp-clear pp-modal-search-clear"
                                    onClick={() => setGamesSearch('')}
                                    aria-label={copy.reset}
                                >
                                    <X size={16} color="#A7A8AC" />
                                </button>
                            )}
                        </div>

                        <div className="pp-modal-actions">
                            <button type="button" className="pp-select-all-link" onClick={toggleAllFilteredCompetitors}>
                                {areAllFilteredSelected ? copy.clearSelection : copy.chooseAll}
                            </button>
                        </div>

                        <div className="pp-modal-list" ref={modalListRef}>
                            {filteredCompetitors.length ? (
                                filteredCompetitors.map((game) => (
                                    <CompetitorChip
                                        key={game.id}
                                        title={game.title || copy.fallbackCompetitor}
                                        checked={selectedCompetitorIds.has(game.id)}
                                        onChange={() => toggleCompetitor(game.id)}
                                    />
                                ))
                            ) : (
                                <div className="pp-modal-empty">{copy.noGamesFound}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
