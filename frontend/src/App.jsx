import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    ChevronDown, Sparkles, X, Download, 
    MessageSquareText, Trash2, Loader2, Link as LinkIcon, 
    Info, Filter, Square, CheckSquare, Eye, Check, AlertCircle, Undo2, Redo2, Frown, Plus, ChevronRight, MoreVertical, Pencil, Maximize2
} from 'lucide-react';

import logoExpanded from './assets/sidebar/logo-expanded.svg';
import logoCollapsed from './assets/sidebar/logo-collapsed.svg';
import iconSearch from './assets/sidebar/search.svg?raw';
import iconLanguage from './assets/sidebar/language.svg?raw';
import iconChevron from './assets/sidebar/chevron.svg?raw';
import iconChevronCollapsed from './assets/sidebar/chevron-collapsed.svg?raw';
import iconNavDescription from './assets/sidebar/nav-description.svg?raw';
import iconNavMarket from './assets/sidebar/nav-market.svg?raw';
import iconNavCompetitors from './assets/sidebar/nav-competitors.svg?raw';
import iconNavIdea from './assets/sidebar/nav-idea.svg?raw';
import iconNavPitch from './assets/sidebar/nav-pitch.svg?raw';
import iconNavAbout from './assets/sidebar/nav-about.svg?raw';
import iconIdeaBadgeBolt from './assets/idea/badge-bolt-placeholder.svg';
import iconIdeaAsIs from './assets/idea/improvement-question-placeholder.svg';
import iconIdeaRecommendation from './assets/idea/improvement-bolt-placeholder.svg';
import iconIdeaExpected from './assets/idea/improvement-chart-placeholder.svg';
import Plot from 'react-plotly.js'; 

import { i18n } from './constants/i18n';
import { MultiSelect } from './components/ui/MultiSelect';
import { GENRES, TAGS, CATEGORIES, LANGUAGES, PUBLISHER_CLASS_OPTIONS, DEVELOPER_OPTIONS, PUBLISHER_OPTIONS } from './constants/options';
import { LandingPage } from './components/ui/LandingPage';
import { AboutModal } from './components/ui/Modals';
import { GameInfoPage } from './components/ui/GameInfoPage';
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from './lib/apiClient';
import {
    fetchUserProjects,
    createUserProject,
    renameUserProject,
    deleteUserProject,
    fetchProjectAnalyses,
    renameUserAnalysis,
    deleteUserAnalysis,
    createProjectAnalysis,
    saveProjectAnalysis,
    fetchAnalysisById,
} from './lib/projectsClient';
import { PitchPackSection as PitchPackExportSection } from './features/pitch-export';

// --- Р В РЎв„ўР В РЎвЂєР В РЎС™Р В РЎСџР В РЎвЂєР В РЎСљР В РІР‚СћР В РЎСљР В РЎС› Р В РІР‚СњР В РІР‚С”Р В Р вЂЎ Р В РІР‚в„ўР В РЎСљР В РІР‚СћР В РІР‚СњР В Р’В Р В РІР‚СћР В РЎСљР В Р’ВР В Р вЂЎ Р В Р Р‹Р В РЎС›Р В Р’ВР В РІР‚С”Р В РІР‚СћР В РІвЂћСћ ---
const StyleInjector = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `            
            body {
                font-family: 'Onest', sans-serif;
                background-color: #F4F6FB;
                color: #1D2433;
            }

            .gamefuse-gradient {
                background: linear-gradient(106.35deg, #E52862 -11.99%, #FFC132 104.13%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
                font-weight: 900;
            }
            
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #E7EDF7;
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #BCC8DB;
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #A7B6CE;
            }
            .gg-gradient-btn {
                background: radial-gradient(100% 7302.48% at 0% 1.14%, #FF7549 0%, #FF5620 100%);
            }
            .gg-gradient-btn:hover {
                background: linear-gradient(0deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12)),
                            radial-gradient(100% 7302.48% at 0% 1.14%, #FF7549 0%, #FF5620 100%);
            }

            body.studio-light [class*="bg-[#0A0F18]"] { background-color: #F4F6FB !important; }
            body.studio-light [class*="bg-[#191D28]"] { background-color: #FFFFFF !important; }
            body.studio-light [class*="bg-[#1E2333]"],
            body.studio-light [class*="bg-[#1B2030]"],
            body.studio-light [class*="bg-[#2B2C37]"] { background-color: #F3F6FB !important; }
            body.studio-light [class*="bg-[#353842]"] { background-color: #EEF2F8 !important; }
            body.studio-light [class*="bg-[#555A6C]"] { background-color: #CCD6E6 !important; }

            body.studio-light [class*="hover:bg-[#2A2F3A]"]:hover,
            body.studio-light [class*="hover:bg-[#1f2634]"]:hover { background-color: #E9EEF7 !important; }
            body.studio-light [class*="hover:bg-[#353842]"]:hover,
            body.studio-light [class*="hover:bg-[#555A6C]"]:hover { background-color: #E2E9F5 !important; }

            body.studio-light [class*="border-[#323640]"],
            body.studio-light [class*="border-[#2B2C37]"],
            body.studio-light [class*="border-[#353842]"],
            body.studio-light [class*="border-white/10"] { border-color: #D4DDEA !important; }

            body.studio-light [class*="text-white"] { color: #1D2433 !important; }
            body.studio-light [class*="text-[#FFFFFF]"] { color: #1D2433 !important; }
            body.studio-light [class*="text-white/90"] { color: rgba(29, 36, 51, 0.9) !important; }
            body.studio-light [class*="text-white/80"],
            body.studio-light [class*="text-white/70"] { color: #5E6A80 !important; }
            body.studio-light [class*="text-white/60"],
            body.studio-light [class*="text-white/50"],
            body.studio-light [class*="text-white/40"] { color: #79849A !important; }
            body.studio-light [class*="text-[#A7A8AC]"],
            body.studio-light [class*="text-[#BABBBF]"] { color: #6B7488 !important; }

            body.studio-light [class*="placeholder-white/40"]::placeholder,
            body.studio-light [class*="placeholder:text-[#A7A8AC]"]::placeholder,
            body.studio-light [class*="placeholder:text-white/60"]::placeholder {
                color: #8D98AE !important;
            }

            body.studio-light .gg-gradient-btn,
            body.studio-light .gg-gradient-btn * {
                color: #FFFFFF !important;
            }
            
            /* Tooltip styling */
            .tooltip-container {
                position: relative;
            }
            .tooltip-text {
                visibility: hidden;
                background-color: #FFFFFF;
                color: #1D2433;
                text-align: left;
                border-radius: 6px;
                padding: 5px 10px;
                position: absolute;
                z-index: 40;
                top: 50%;
                right: 120%;
                transform: translateY(-50%);
                width: 200px;
                opacity: 0;
                transition: opacity 0.3s;
                border: 1px solid #D4DDEA;
                box-shadow: 0 8px 18px rgba(17, 24, 39, 0.12);
                font-size: 12px;
                font-weight: 400;
                pointer-events: none;
            }
            .description-tooltip {
                width: 300px; /* Р В Р РѓР В РЎвЂР РЋР вЂљР В Р’Вµ, Р РЋРІР‚РЋР В Р’ВµР В РЎВ Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РўвЂР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ */
                max-height: 200px; /* Р В РЎС™Р В Р’В°Р В РЎвЂќР РЋР С“Р В РЎвЂР В РЎВР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В Р вЂ Р РЋРІР‚в„–Р РЋР С“Р В РЎвЂўР РЋРІР‚С™Р В Р’В° Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋР С“Р В РЎвЂќР РЋР вЂљР В РЎвЂўР В Р’В»Р В Р’В»Р В Р’В° */
                overflow-y: auto; /* Р В РІР‚в„ўР В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р вЂ Р В Р’ВµР РЋР вЂљР РЋРІР‚С™Р В РЎвЂР В РЎвЂќР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР С“Р В РЎвЂќР РЋР вЂљР В РЎвЂўР В Р’В»Р В Р’В» Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В Р вЂ¦Р В Р’ВµР В РЎвЂўР В Р’В±Р РЋРІР‚В¦Р В РЎвЂўР В РўвЂР В РЎвЂР В РЎВР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂ */
                text-align: left; /* Р В РІР‚в„ўР РЋРІР‚в„–Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р вЂ¦Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™Р В Р’В° Р РЋР С“Р В Р’В»Р В Р’ВµР В Р вЂ Р В Р’В° Р В РўвЂР В Р’В»Р РЋР РЏ Р В РЎвЂўР В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ */
                white-space: normal; /* Р В РЎСљР В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂўР РЋР С“ Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В РЎвЂќ Р В РўвЂР В Р’В»Р РЋР РЏ Р В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР РЋРІвЂљВ¬Р В Р’ВµР В РІвЂћвЂ“ Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р’ВµР В РЎВР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂ */
                padding: 10px; /* Р В РІР‚ВР В РЎвЂўР В Р’В»Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р РЋР С“Р РЋРІР‚С™Р РЋРЎвЂњР В РЎвЂ”Р В РЎвЂўР В Р вЂ  Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р’ВµР В РЎВР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂ */
                bottom: 120%; /* Р В РЎСџР В РЎвЂўР В Р’В·Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋР С“Р В Р вЂ Р В Р’ВµР РЋР вЂљР РЋРІР‚В¦Р РЋРЎвЂњ Р В РЎвЂўР РЋРІР‚С™ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С™Р В Р’ВµР В РІвЂћвЂ“Р В Р вЂ¦Р В Р’ВµР РЋР вЂљР В Р’В° */
                left: 50%; /* Р В Р’В¦Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВ Р В РЎвЂ”Р В РЎвЂў Р В РЎвЂ“Р В РЎвЂўР РЋР вЂљР В РЎвЂР В Р’В·Р В РЎвЂўР В Р вЂ¦Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р В РЎвЂ */
                transform: translateX(-50%); /* Р В Р Р‹Р В РЎВР В Р’ВµР РЋРІР‚В°Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ */
                right: auto; /* Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ right Р В РўвЂР В Р’В»Р РЋР РЏ description-tooltip */
                top: auto; /* Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ top Р В РўвЂР В Р’В»Р РЋР РЏ description-tooltip */
            }
            .tooltip-text.description-tooltip {
                visibility: hidden;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none; /* Р В РЎСџР В РЎвЂў Р РЋРЎвЂњР В РЎВР В РЎвЂўР В Р’В»Р РЋРІР‚РЋР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№ none, Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р В Р вЂ¦Р В Р’Вµ Р В РЎВР В Р’ВµР РЋРІвЂљВ¬Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ */
            }
            .tooltip-text.description-tooltip.show {
                visibility: visible;
                opacity: 1;
                pointer-events: auto; /* Р В РІР‚в„ўР В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’В°Р В Р’ВµР В РЎВ Р В Р вЂ Р В Р’В·Р В Р’В°Р В РЎвЂР В РЎВР В РЎвЂўР В РўвЂР В Р’ВµР В РІвЂћвЂ“Р РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋР С“Р В РЎвЂќР РЋР вЂљР В РЎвЂўР В Р’В»Р В Р’В»Р В Р’В° */
            }
            .tooltip-container:hover .tooltip-text {
                visibility: visible;
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
        document.body.classList.add('studio-light');
        document.body.style.backgroundColor = '#F4F6FB';
        document.body.style.fontFamily = "'Onest', sans-serif";
        return () => {
            document.head.removeChild(style);
            document.body.classList.remove('studio-light');
        };
    }, []);
    return null;
};

const RangeInput = ({ label, fromValue, toValue, onFromChange, onToChange, t }) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70 block">{label}</label>
            <div className="flex gap-2">
                <div className="flex-1"><input type="number" placeholder={t('from')} value={fromValue} onChange={(e) => onFromChange(e.target.value)} className="w-full bg-[#191D28] rounded-lg p-2 text-white/80 text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FFC132]" /></div>
                <div className="flex-1"><input type="number" placeholder={t('to')} value={toValue} onChange={(e) => onToChange(e.target.value)} className="w-full bg-[#191D28] rounded-lg p-2 text-white/80 text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FFC132]" /></div>
            </div>
        </div>
    );
};


// --- 4. ResultsSection & Charts ---
const MetricsCard = ({ title, rows }) => (
    <div className="flex flex-col items-center p-4 gap-4 bg-[#191D28] rounded-[20px] flex-1 min-w-[240px]">
        <h3 className="text-base font-semibold leading-[120%] text-white text-opacity-90 w-full">{title}</h3>
        <div className="flex flex-col items-start gap-2 w-full">
            {rows.map((row, idx) => (
                <div key={idx} className="flex flex-row items-center gap-2 w-full">
                    <span className="text-sm font-medium leading-[120%] text-[#BABBBF] flex-none">{row.label}</span>
                    <span className="text-sm font-medium leading-[120%] text-white text-opacity-90 text-right flex-grow">{row.value}</span>
                </div>
            ))}
        </div>
    </div>
);

const IntroCard = ({ title, subtitle, t }) => (
    <div className="flex flex-col items-start p-0 w-full">
         <p className="text-white text-xl md:text-1xl font-light leading-snug max-w-6xl">{subtitle}</p>
    </div>
);

// --- ChartItem (Handles individual chart logic & legends) ---
const FORECAST_HORIZONS = [3, 6, 9, 12, 24];

const ChartItem = ({ plotData, index, t, activeFilters }) => {
    const plotId = `plot-${index}`;
    const chartId = plotData?.id || null;
    const title = plotData?.layout?.title?.text || plotData?.layout?.title || `Graph ${index + 1}`;
    const rawDescription =
        plotData?.layout?.meta?.description?.text
        || plotData?.layout?.meta?.description
        || plotData?.layout?.description?.text
        || plotData?.layout?.description
        || '';
    const description = String(rawDescription || t('chartDefaultDescription'));
    const isRevenueByTags = (title === 'Выручка по тегам' || title === 'Revenue by tags');
    const isWide = 
        (title === 'Совместная встречаемость тегов' || title === 'Tag co-occurrence') ||
        (title === 'Динамика релизов' || title === 'Release dynamics') ||
        isRevenueByTags;
    const isTagChart = (title === 'Совместная встречаемость тегов' || title === 'Tag co-occurrence'); // Logic alias for clarity
    const isReleaseDynamics = (title === 'Динамика релизов' || title === 'Release dynamics');
    const isReleaseSeasonality = (title === 'Сезонность релизов' || title === 'Release seasonality');
    const isDeveloperTier = (title === 'Класс разработчика' || title === 'Developer tier');
    const isInterfaceLocalization = (title === 'Локализация интерфейсов' || title === 'Interface localization');
    const shouldShowPieCategoryLabels = isDeveloperTier || isInterfaceLocalization;
    const isLocalizationVoiceAndInterface =
        (title === 'Локализация: языки озвучек и интерфейсов' || title === 'Localization: voice and interface languages');
    const hasPieChart = Array.isArray(plotData?.data) && plotData.data.some((trace) => String(trace?.type || '').toLowerCase() === 'pie');
    const canForecast = isReleaseDynamics;
    const normalizedForecastFilters = useMemo(() => ({
        genres: Array.isArray(activeFilters?.genres) ? activeFilters.genres : [],
        tags: Array.isArray(activeFilters?.tags) ? activeFilters.tags : [],
        categories: Array.isArray(activeFilters?.categories) ? activeFilters.categories : [],
        languages: Array.isArray(activeFilters?.languages) ? activeFilters.languages : (
            Array.isArray(activeFilters?.language) ? activeFilters.language : []
        ),
    }), [activeFilters]);

    // Local state for hiding tags in Heatmap
    const [hiddenTags, setHiddenTags] = useState([]);
    const [forecastEnabled, setForecastEnabled] = useState(false);
    const [forecastWindow, setForecastWindow] = useState(12);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [forecastError, setForecastError] = useState('');
    const [forecastPoints, setForecastPoints] = useState([]);
    const [selectedHeatmapMetric, setSelectedHeatmapMetric] = useState('');
    const [isHeatmapMetricOpen, setIsHeatmapMetricOpen] = useState(false);
    const [isChartFullscreenOpen, setIsChartFullscreenOpen] = useState(false);
    const heatmapMetricDropdownRef = useRef(null);

    const heatmapMetricOptions = useMemo(() => {
        if (!isTagChart) {
            return [];
        }
        const raw = Array.isArray(plotData?.layout?.heatmapMetrics) ? plotData.layout.heatmapMetrics : [];
        return raw
            .map((item) => ({
                key: String(item?.key || '').trim(),
                label: String(item?.label || item?.key || '').trim(),
            }))
            .filter((item) => item.key.length > 0 && item.label.length > 0);
    }, [isTagChart, plotData]);

    const heatmapMetricMatrices = useMemo(() => {
        if (!isTagChart) {
            return {};
        }
        const raw = plotData?.layout?.metricMatrices;
        return raw && typeof raw === 'object' ? raw : {};
    }, [isTagChart, plotData]);

    const heatmapDefaultMetric = useMemo(() => {
        const fromLayout = String(plotData?.layout?.defaultMetric || '').trim();
        if (fromLayout.length > 0) {
            return fromLayout;
        }
        return heatmapMetricOptions[0]?.key || '';
    }, [plotData, heatmapMetricOptions]);

    const heatmapMetricSignature = useMemo(
        () => `${chartId || 'no-id'}|${heatmapDefaultMetric}|${heatmapMetricOptions.map((opt) => opt.key).join('|')}`,
        [chartId, heatmapDefaultMetric, heatmapMetricOptions],
    );
    const selectedHeatmapMetricLabel = useMemo(
        () => (
            heatmapMetricOptions.find((opt) => opt.key === selectedHeatmapMetric)?.label
            || heatmapMetricOptions[0]?.label
            || t('heatmapMetricSelect')
        ),
        [heatmapMetricOptions, selectedHeatmapMetric, t],
    );

    const forecastSourceSignature = useMemo(() => {
        const xValues = Array.isArray(plotData?.data?.[0]?.x) ? plotData.data[0].x : [];
        const yValues = Array.isArray(plotData?.data?.[0]?.y) ? plotData.data[0].y : [];
        const firstX = xValues.length ? String(xValues[0]) : '';
        const lastX = xValues.length ? String(xValues[xValues.length - 1]) : '';
        const filtersSignature = JSON.stringify(normalizedForecastFilters);
        return `${chartId || 'no-id'}|${xValues.length}|${yValues.length}|${firstX}|${lastX}|${filtersSignature}`;
    }, [chartId, plotData, normalizedForecastFilters]);

    useEffect(() => {
        setForecastEnabled(false);
        setForecastWindow(12);
        setForecastLoading(false);
        setForecastError('');
        setForecastPoints([]);
    }, [forecastSourceSignature]);

    useEffect(() => {
        if (!isTagChart) {
            setSelectedHeatmapMetric('');
            setIsHeatmapMetricOpen(false);
            return;
        }
        const keys = new Set(heatmapMetricOptions.map((opt) => opt.key));
        const nextMetric = keys.has(heatmapDefaultMetric)
            ? heatmapDefaultMetric
            : (heatmapMetricOptions[0]?.key || '');
        setSelectedHeatmapMetric(nextMetric);
        setIsHeatmapMetricOpen(false);
    }, [isTagChart, heatmapMetricSignature, heatmapMetricOptions, heatmapDefaultMetric]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (heatmapMetricDropdownRef.current && !heatmapMetricDropdownRef.current.contains(event.target)) {
                setIsHeatmapMetricOpen(false);
            }
        };

        if (isHeatmapMetricOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isHeatmapMetricOpen]);

    useEffect(() => {
        if (!isChartFullscreenOpen) {
            return undefined;
        }
        const handleEscClose = (event) => {
            if (event.key === 'Escape') {
                setIsChartFullscreenOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscClose);
        return () => {
            document.removeEventListener('keydown', handleEscClose);
        };
    }, [isChartFullscreenOpen]);

    const visibleForecastPoints = useMemo(() => (
        forecastPoints
            .filter((p) => Number(p?.horizon) <= forecastWindow)
            .sort((a, b) => Number(a.horizon) - Number(b.horizon))
    ), [forecastPoints, forecastWindow]);

    const requestForecast = useCallback(async () => {
        if (!canForecast) {
            return;
        }
        const baseTrace = Array.isArray(plotData?.data) ? plotData.data.find((trace) => (
            Array.isArray(trace?.x) && Array.isArray(trace?.y)
        )) : null;

        if (!baseTrace || !Array.isArray(baseTrace.x) || !Array.isArray(baseTrace.y)) {
            throw new Error(t('forecastNoHistory'));
        }

        if (baseTrace.x.length !== baseTrace.y.length || baseTrace.x.length === 0) {
            throw new Error(t('forecastNoHistory'));
        }

        const payload = {
            chartId: 'release_dynamics',
            horizons: FORECAST_HORIZONS,
            ...normalizedForecastFilters,
            history: {
                x: baseTrace.x,
                y: baseTrace.y,
            },
        };

        const response = await apiRequest('/analyze_charts/release_forecast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let detail = '';
            try {
                const errorPayload = await response.json();
                detail = errorPayload?.detail || '';
            } catch {
                detail = '';
            }
            throw new Error(detail || t('forecastRequestFailed'));
        }

        const json = await response.json();
        const points = Array.isArray(json?.predictions) ? json.predictions : [];
        if (!points.length) {
            throw new Error(t('forecastEmptyResponse'));
        }
        const lastActualMonth = String(baseTrace.x[baseTrace.x.length - 1]);
        const lastActualValue = Number(baseTrace.y[baseTrace.y.length - 1]) || 0;
        const normalizedPoints = points
            .map((point) => ({
                horizon: Number(point?.horizon),
                month: String(point?.month || ''),
                value: Number(point?.value) || 0,
            }))
            .filter((point) => Number.isFinite(point.horizon) && point.month.length > 0);
        const forecastOnlyPoints = normalizedPoints.filter((point) => point.horizon > 0);
        const anchorPoint = {
            horizon: 0,
            month: lastActualMonth,
            value: lastActualValue,
        };
        setForecastPoints([anchorPoint, ...forecastOnlyPoints]);
    }, [canForecast, normalizedForecastFilters, plotData, t]);

    const toggleForecast = useCallback(async () => {
        if (!canForecast) {
            return;
        }
        if (forecastEnabled) {
            setForecastEnabled(false);
            setForecastError('');
            return;
        }

        setForecastEnabled(true);
        setForecastError('');
        if (forecastPoints.length > 0) {
            return;
        }

        try {
            setForecastLoading(true);
            await requestForecast();
        } catch (err) {
            setForecastEnabled(false);
            setForecastError(err?.message || t('forecastRequestFailed'));
        } finally {
            setForecastLoading(false);
        }
    }, [canForecast, forecastEnabled, forecastPoints.length, requestForecast, t]);

    const toggleTag = (tag) => {
        setHiddenTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    const isolateTag = (tagToKeep) => {
        const allTags = tagsForLegend; // Р В Р’ВР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р РЋРЎвЂњР В Р’ВµР В РЎВ Р В РЎВР В Р’В°Р РЋР С“Р РЋР С“Р В РЎвЂР В Р вЂ  Р В Р вЂ Р РЋР С“Р В Р’ВµР РЋРІР‚В¦ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂўР В Р вЂ 
        
        // Р В РЎвЂєР В РЎвЂ”Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’ВµР В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ, Р В РЎвЂР В Р’В·Р В РЎвЂўР В Р’В»Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦ Р В Р’В»Р В РЎвЂ Р РЋРЎвЂњР В Р’В¶Р В Р’Вµ Р РЋР РЉР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚С™ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“ (Р РЋРІР‚С™.Р В Р’Вµ. Р РЋР С“Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋРІР‚в„– Р В Р вЂ Р РЋР С“Р В Р’Вµ, Р В РЎвЂќР РЋР вЂљР В РЎвЂўР В РЎВР В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В РЎвЂ“Р В РЎвЂў)
        const isIsolated = allTags.length - hiddenTags.length === 1 && !hiddenTags.includes(tagToKeep);

        if (isIsolated) {
            // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р РЋРЎвЂњР В Р’В¶Р В Р’Вµ Р В РЎвЂР В Р’В·Р В РЎвЂўР В Р’В»Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦ -> Р В РІР‚в„ўР В РЎвЂўР РЋР С“Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р вЂ Р РЋР С“Р В Р’Вµ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂ (Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ hiddenTags)
            setHiddenTags([]);
        } else {
            // Р В Р’ВР В Р’В·Р В РЎвЂўР В Р’В»Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ -> Р В Р Р‹Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р В Р вЂ Р РЋР С“Р В Р’Вµ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂ, Р В РЎвЂќР РЋР вЂљР В РЎвЂўР В РЎВР В Р’Вµ tagToKeep
            const tagsToHide = allTags.filter(tag => tag !== tagToKeep);
            setHiddenTags(tagsToHide);
        }
    };

    // Process data for rendering
    const processedData = useMemo(() => {
        const normalizePieTrace = (trace) => {
            if (String(trace?.type || '').toLowerCase() !== 'pie') return trace;
            const defaultPieTextInfo = shouldShowPieCategoryLabels ? 'label+percent' : 'percent';
            return {
                ...trace,
                textinfo: trace.textinfo || defaultPieTextInfo,
                textposition: 'inside',
                insidetextorientation: trace.insidetextorientation || 'auto',
                texttemplate: shouldShowPieCategoryLabels
                    ? (trace.texttemplate || '%{label}<br>%{percent}')
                    : trace.texttemplate,
            };
        };

        // A. If Tag/Heatmap chart - Filter Matrix based on hiddenTags
        if (isTagChart && plotData.data[0]?.type === 'heatmap') {
            const originalTrace = plotData.data[0];
            const originalX = originalTrace.x || [];
            const originalY = originalTrace.y || [];
            const selectedMetricKey = (
                selectedHeatmapMetric
                && Array.isArray(heatmapMetricMatrices?.[selectedHeatmapMetric])
            )
                ? selectedHeatmapMetric
                : heatmapDefaultMetric;
            const originalZ = Array.isArray(heatmapMetricMatrices?.[selectedMetricKey])
                ? heatmapMetricMatrices[selectedMetricKey]
                : (originalTrace.z || []);
            const originalCustomData = Array.isArray(originalTrace.customdata) ? originalTrace.customdata : [];

            // Find indices of visible tags
            const visibleIndices = originalX
                .map((tag, idx) => hiddenTags.includes(tag) ? -1 : idx)
                .filter(idx => idx !== -1);

            const newX = visibleIndices.map(idx => originalX[idx]);
            const newY = visibleIndices.map(idx => originalY[idx]);

            // Filter Z matrix (rows and columns)
            const newZ = visibleIndices.map(rowIdx =>
                visibleIndices.map(colIdx => Number(originalZ?.[rowIdx]?.[colIdx] ?? 0))
            );
            const newCustomData = visibleIndices.map(rowIdx =>
                visibleIndices.map(colIdx => originalCustomData?.[rowIdx]?.[colIdx] ?? [0, 0, 0, 0, 0])
            );

            return [{
                ...originalTrace,
                x: newX,
                y: newY,
                z: newZ,
                customdata: newCustomData,
            }].map(normalizePieTrace);
        }

        // B. If Bar chart - Split traces for legend (Improvement 1 from prev request)
        const localizationLegendShown = new Set();
        const baseData = plotData.data.flatMap((trace, traceIdx) => {
            if (isLocalizationVoiceAndInterface && trace.type === 'bar' && Array.isArray(trace.x) && Array.isArray(trace.y)) {
                const categoryLabel = String(trace.name ?? '').trim() || (traceIdx === 0 ? 'Interface' : 'Audio');
                return trace.x.map((xValue, idx) => {
                    const legendKey = String(xValue ?? '').trim() || String(idx + 1);
                    const shouldShowLegend = !localizationLegendShown.has(legendKey);
                    if (shouldShowLegend) {
                        localizationLegendShown.add(legendKey);
                    }
                    return {
                        type: 'bar',
                        x: [xValue],
                        y: [trace.y[idx]],
                        name: legendKey,
                        marker: trace.marker,
                        showlegend: shouldShowLegend,
                        legendgroup: legendKey,
                        offsetgroup: `loc-series-${traceIdx}`,
                        alignmentgroup: 'loc-voice-interface',
                        hovertemplate: `%{x}<br>${categoryLabel}: %{y}<extra></extra>`,
                    };
                });
            }
            if (trace.type !== 'bar' || !trace.x || !trace.y) return [trace];
            return trace.x.map((xValue, idx) => ({
                type: 'bar',
                x: [xValue],
                y: [trace.y[idx]],
                name: xValue,
                marker: trace.marker,
                showlegend: true
            }));
        }).map(normalizePieTrace);

        if (!canForecast || !forecastEnabled || visibleForecastPoints.length === 0) {
            return baseData;
        }

        const firstTrace = baseData[0];
        if (!firstTrace || !Array.isArray(firstTrace.x) || !Array.isArray(firstTrace.y) || firstTrace.x.length === 0) {
            return baseData;
        }

        const lastActualX = firstTrace.x[firstTrace.x.length - 1];
        const lastActualY = Number(firstTrace.y[firstTrace.y.length - 1]);
        if (!Number.isFinite(lastActualY)) {
            return baseData;
        }

        const forecastX = visibleForecastPoints.map((point) => point.month);
        const forecastY = visibleForecastPoints.map((point) => Number(point.value) || 0);
        const horizonLabel = t('forecastHorizonLabel').replace('{h}', String(forecastWindow));

        if (!forecastX.length || !forecastY.length) {
            return baseData;
        }

        const hasAnchorPoint = Number(visibleForecastPoints[0]?.horizon) === 0;
        const traceX = hasAnchorPoint ? forecastX : [lastActualX, ...forecastX];
        const traceY = hasAnchorPoint ? forecastY : [lastActualY, ...forecastY];
        const markerSymbols = traceY.map((_, idx) => (idx === 0 ? 'circle' : 'diamond'));
        const hoverTemplates = traceY.map((_, idx) => (
            idx === 0
                ? '<extra></extra>'
                : `%{x}<br>${t('forecastValue')}: %{y:.0f}<extra></extra>`
        ));

        const connectorTrace = {
            type: 'scatter',
            x: traceX,
            y: traceY,
            mode: 'lines+markers',
            name: `${t('forecastTitle')} (${horizonLabel})`,
            line: { color: '#66D9EF', width: 3, dash: 'dash', shape: 'linear' },
            marker: {
                color: '#66D9EF',
                size: traceY.map(() => 8),
                symbol: markerSymbols,
            },
            connectgaps: true,
            hovertemplate: hoverTemplates,
        };

        return [...baseData, connectorTrace];
    }, [
        canForecast,
        forecastEnabled,
        forecastWindow,
        hiddenTags,
        isLocalizationVoiceAndInterface,
        isTagChart,
        heatmapMetricMatrices,
        heatmapDefaultMetric,
        selectedHeatmapMetric,
        plotData,
        shouldShowPieCategoryLabels,
        t,
        visibleForecastPoints,
    ]);

    const layout = useMemo(() => {
        const sourceLayout = plotData?.layout || {};
        const normalizedAxesLayout = Object.entries(sourceLayout).reduce((acc, [key, value]) => {
            if (/^[xy]axis\d*$/.test(key) && value && typeof value === 'object' && !Array.isArray(value)) {
                const axisTitle = value.title;
                acc[key] = {
                    ...value,
                    automargin: true,
                    ticklabeloverflow: value.ticklabeloverflow || 'allow',
                    title: typeof axisTitle === 'object'
                        ? { ...axisTitle, standoff: axisTitle.standoff ?? 12 }
                        : axisTitle,
                };
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});

        const baseMargin = sourceLayout.margin || {};
        const minMargin = hasPieChart
            ? { l: 36, r: 20, t: 24, b: 28 }
            : {
                l: isTagChart ? 120 : 72,
                r: isTagChart ? 120 : 28,
                t: isTagChart ? 0 : 36,
                b: isTagChart ? 50 : 72,
            };

        return {
            ...normalizedAxesLayout,
            title: undefined,
            autosize: true,
            paper_bgcolor: '#FFFFFF',
            plot_bgcolor: '#FFFFFF',
            font: { color: '#1D2433', family: 'Onest' },
            uniformtext: hasPieChart
                ? { minsize: 8, mode: 'hide', ...(sourceLayout.uniformtext || {}) }
                : sourceLayout.uniformtext,
            margin: {
                ...baseMargin,
                l: Math.max(baseMargin.l ?? 0, minMargin.l),
                r: Math.max(baseMargin.r ?? 0, minMargin.r),
                t: Math.max(baseMargin.t ?? 0, minMargin.t),
                b: Math.max(baseMargin.b ?? 0, minMargin.b),
                pad: Math.max(baseMargin.pad ?? 0, 8),
            },
            ...(isLocalizationVoiceAndInterface
                ? {
                    barmode: 'group',
                    bargap: sourceLayout.bargap ?? 0.2,
                    bargroupgap: sourceLayout.bargroupgap ?? 0.12,
                    legend: {
                        ...(sourceLayout.legend || {}),
                        groupclick: 'togglegroup',
                    },
                }
                : {}),
            showlegend: (isReleaseDynamics || isReleaseSeasonality) ? false : (sourceLayout.showlegend ?? true),
        };
    }, [plotData, isTagChart, isReleaseDynamics, isReleaseSeasonality, isLocalizationVoiceAndInterface, hasPieChart]);

    const plotConfig = useMemo(() => ({
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['sendDataToCloud', 'editInChartStudio', 'lasso2d', 'autoScale2d'],
    }), []);

    // Extract Tags for Custom Legend
    const tagsForLegend = isTagChart && plotData.data[0]?.x ? plotData.data[0].x : [];

    return (
        <>
            <section
                id={plotId}
                className={`bg-[#191D28] rounded-[20px] p-6 flex flex-col items-start gap-4 w-full h-full min-h-[400px] scroll-mt-24 ${isWide ? 'xl:col-span-2' : ''}`}
                data-title={title}
            >
                <div className="flex flex-row items-center gap-2 w-full border-b border-[#323640] pb-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate flex-grow">{title}</h3>
                    <div className="tooltip-container relative group cursor-pointer">
                        <button
                            type="button"
                            onClick={() => {
                                setIsHeatmapMetricOpen(false);
                                setIsChartFullscreenOpen(true);
                            }}
                            className="p-1 rounded-md transition-colors text-[#BABBBF] hover:text-white hover:bg-white/5"
                            aria-label={t('chartFullscreen')}
                            title={t('chartFullscreen')}
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <span className="tooltip-text">{t('chartFullscreen')}</span>
                    </div>
                    {canForecast && (
                        <div className="tooltip-container relative group cursor-pointer">
                            <button
                                type="button"
                                onClick={toggleForecast}
                                disabled={forecastLoading}
                                className={`p-1 rounded-md transition-colors ${
                                    forecastEnabled
                                        ? 'text-[#FF5620] bg-[#FF5620]/10'
                                        : 'text-[#BABBBF] hover:text-white hover:bg-white/5'
                                }`}
                                aria-label={t('forecastToggle')}
                                title={t('forecastToggle')}
                            >
                                {forecastLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                            </button>
                            <span className="tooltip-text">{t('forecastToggle')}</span>
                        </div>
                    )}
                    {isTagChart && heatmapMetricOptions.length > 0 && (
                        <div ref={heatmapMetricDropdownRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsHeatmapMetricOpen((prev) => !prev)}
                                className="flex items-center px-3 py-2 gap-1.5 w-[220px] max-w-[45vw] h-9 bg-[#191D28] border border-[#323640] rounded-[12px] hover:bg-[#1f2634] transition-colors"
                                aria-label={t('heatmapMetricSelect')}
                                title={t('heatmapMetricSelect')}
                            >
                                <span className="text-white font-['Onest'] font-medium text-sm leading-[18px] flex-1 text-left truncate">
                                    {selectedHeatmapMetricLabel}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isHeatmapMetricOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isHeatmapMetricOpen && !isChartFullscreenOpen && (
                                <div className="absolute right-0 top-[calc(100%+8px)] w-[260px] bg-[#191D28] border border-[#323640] rounded-[12px] shadow-[0px_0px_32px_rgba(10,15,24,0.8)] z-10">
                                    {heatmapMetricOptions.map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => {
                                                setSelectedHeatmapMetric(option.key);
                                                setIsHeatmapMetricOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 h-9 hover:bg-[#353842] transition-colors text-sm font-medium ${
                                                selectedHeatmapMetric === option.key ? 'text-[#FFC132]' : 'text-white'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="tooltip-container relative group cursor-pointer">
                        <Info className="w-5 h-5 text-[#BABBBF] hover:text-white transition-colors" />
                        <span className="tooltip-text">{description}</span>
                    </div>
                </div>

                {canForecast && forecastEnabled && (
                    <div className="w-full flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs uppercase tracking-wide text-white/50">{t('forecastWindowTitle')}</span>
                        {FORECAST_HORIZONS.map((windowHorizon) => (
                            <button
                                key={windowHorizon}
                                type="button"
                                onClick={() => setForecastWindow(windowHorizon)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                                    forecastWindow === windowHorizon
                                        ? 'text-white bg-[#FF5620]/10 border-[#FF5620]/60'
                                        : 'text-white/70 border-white/20 hover:text-white hover:border-white/40'
                                }`}
                            >
                                {windowHorizon}m
                            </button>
                        ))}
                    </div>
                )}

                {canForecast && forecastError && (
                    <div className="w-full mb-2 text-xs text-[#FF7A7A]">{forecastError}</div>
                )}

                {/* Custom Legend for Tag Compatibility */}
                {isTagChart && (
                    <div className="w-full mb-2">
                        <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar p-1">
                            {tagsForLegend.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    // Р В Р’ВР В РІР‚вЂќР В РЎС™Р В РІР‚СћР В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ 2: Р В РІР‚СњР В Р вЂ Р В РЎвЂўР В РІвЂћвЂ“Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќ
                                    onDoubleClick={() => isolateTag(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                                        hiddenTags.includes(tag)
                                            ? 'bg-transparent border-white/20 text-white/40 line-through'
                                            : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="w-full flex-grow flex justify-center items-center">
                    <Plot
                        data={processedData}
                        layout={layout}
                        useResizeHandler={true}
                        className={isTagChart ? "max-w-[80%] w-full h-full" : "w-full h-full"}
                        style={{ width: '100%', height: '100%', minHeight: hasPieChart ? '340px' : '300px' }}
                        config={plotConfig}
                    />
                </div>
            </section>

            {isChartFullscreenOpen && createPortal(
                <div className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-sm p-3 md:p-5">
                    <div className="w-full h-full bg-[#191D28] border border-[#323640] rounded-[16px] flex flex-col">
                        <div className="flex items-center gap-3 border-b border-[#323640] px-4 py-3">
                            <h3 className="text-base md:text-lg font-semibold text-white truncate flex-grow">{title}</h3>
                            {canForecast && (
                                <button
                                    type="button"
                                    onClick={toggleForecast}
                                    disabled={forecastLoading}
                                    className={`p-1 rounded-md transition-colors ${
                                        forecastEnabled
                                            ? 'text-[#FF5620] bg-[#FF5620]/10'
                                            : 'text-[#BABBBF] hover:text-white hover:bg-white/5'
                                    }`}
                                    aria-label={t('forecastToggle')}
                                    title={t('forecastToggle')}
                                >
                                    {forecastLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                            {isTagChart && heatmapMetricOptions.length > 0 && (
                                <div ref={heatmapMetricDropdownRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsHeatmapMetricOpen((prev) => !prev)}
                                        className="flex items-center px-3 py-2 gap-1.5 w-[220px] max-w-[45vw] h-9 bg-[#191D28] border border-[#323640] rounded-[12px] hover:bg-[#1f2634] transition-colors"
                                        aria-label={t('heatmapMetricSelect')}
                                        title={t('heatmapMetricSelect')}
                                    >
                                        <span className="text-white font-['Onest'] font-medium text-sm leading-[18px] flex-1 text-left truncate">
                                            {selectedHeatmapMetricLabel}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isHeatmapMetricOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isHeatmapMetricOpen && isChartFullscreenOpen && (
                                        <div className="absolute right-0 top-[calc(100%+8px)] w-[260px] bg-[#191D28] border border-[#323640] rounded-[12px] shadow-[0px_0px_32px_rgba(10,15,24,0.8)] z-10">
                                            {heatmapMetricOptions.map((option) => (
                                                <button
                                                    key={option.key}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedHeatmapMetric(option.key);
                                                        setIsHeatmapMetricOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 h-9 hover:bg-[#353842] transition-colors text-sm font-medium ${
                                                        selectedHeatmapMetric === option.key ? 'text-[#FFC132]' : 'text-white'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsChartFullscreenOpen(false)}
                                className="p-2 rounded-md text-[#BABBBF] hover:text-white hover:bg-white/5 transition-colors"
                                aria-label={t('close')}
                                title={t('close')}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {canForecast && forecastEnabled && (
                            <div className="px-4 pt-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs uppercase tracking-wide text-white/50">{t('forecastWindowTitle')}</span>
                                {FORECAST_HORIZONS.map((windowHorizon) => (
                                    <button
                                        key={windowHorizon}
                                        type="button"
                                        onClick={() => setForecastWindow(windowHorizon)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                                            forecastWindow === windowHorizon
                                                ? 'text-white bg-[#FF5620]/10 border-[#FF5620]/60'
                                                : 'text-white/70 border-white/20 hover:text-white hover:border-white/40'
                                        }`}
                                    >
                                        {windowHorizon}m
                                    </button>
                                ))}
                            </div>
                        )}
                        {canForecast && forecastError && (
                            <div className="px-4 pt-2 text-xs text-[#FF7A7A]">{forecastError}</div>
                        )}
                        {isTagChart && (
                            <div className="px-4 pt-2">
                                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
                                    {tagsForLegend.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            onDoubleClick={() => isolateTag(tag)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                                                hiddenTags.includes(tag)
                                                    ? 'bg-transparent border-white/20 text-white/40 line-through'
                                                    : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="w-full flex-1 min-h-0 p-2 md:p-4">
                            <Plot
                                data={processedData}
                                layout={layout}
                                useResizeHandler={true}
                                className="w-full h-full"
                                style={{ width: '100%', height: '100%' }}
                                config={plotConfig}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

const ResultsSection = ({ data, t, onDataUpdate, activeFilters }) => {
    useEffect(() => {
        if (data) onDataUpdate(data);
    }, [data, onDataUpdate]);

    const fullData = Array.isArray(data) ? { plots: data, metrics: null, intro: null } : data;
    const { plots, metrics, intro } = fullData;

    return (
        <div className="flex flex-col items-start px-4 md:px-8 pb-12 gap-10 w-full max-w-[1400px] mx-auto overflow-x-hidden">
            {metrics && (
                <div className="flex flex-row flex-wrap items-start gap-4 w-full">
                    <MetricsCard title={t('metricsOverview')} rows={[{ label: t('foundGames'), value: metrics.foundGames }, { label: t('avMedCCU'), value: metrics.avMedCCU }, { label: t('ccuToday'), value: metrics.totalCCU }]} />
                    <MetricsCard title={t('metricsRevenue')} rows={[{ label: t('totalRevenue'), value: metrics.totalRevenue }, { label: t('avgRevenue'), value: metrics.avgRevenue }, { label: t('medianRevenue'), value: metrics.medianRevenue }]} />
                    <MetricsCard title={t('metricsPrice')} rows={[{ label: t('avgRevenue'), value: metrics.avgPrice }, { label: t('medianRevenue'), value: metrics.medianPrice }, { label: t('minMax'), value: metrics.minMaxPrice }]} />
                    <MetricsCard title={t('metricsReviews')} rows={[{ label: t('avgReviews'), value: metrics.avgReviewScore }, { label: t('positiveReviews'), value: metrics.avgPositiveReviews }, { label: t('negativeReviews'), value: metrics.avgNegativeReviews}]} />
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                {Array.isArray(plots) && plots.length > 0 ? plots.map((plotData, index) => (
                    <ChartItem key={index} plotData={plotData} index={index} t={t} activeFilters={activeFilters} />
                )) : (
                    <div className="col-span-2 text-white/50 text-center py-12">No data to display</div>
                )}
            </div>
        </div>
    );
};

// --- IDEA ANALYSIS SECTION ---

const MOCK_IDEA_ANALYSIS_DATA = {
    ru: {
        suggested_name: "Р В РІР‚в„ўР В РЎвЂўР В РІвЂћвЂ“Р В Р вЂ¦Р В Р’В° Р В Р’В·Р В Р’В° Р РЋРЎвЂњР В РўвЂР В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ",
        summary: "Р В РЎвЂ™Р В Р вЂ¦Р В Р’В°Р В Р’В»Р В РЎвЂР В Р’В· Р В РЎвЂ”Р В РЎвЂўР В РўвЂР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋР вЂљР В Р’В¶Р В РўвЂР В Р’В°Р В Р’ВµР РЋРІР‚С™: Р В РЎвЂќР В РЎвЂўР В РЎВР В Р’В±Р В РЎвЂР В Р вЂ¦Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ \"Plant-based RTS\" Р В РЎвЂ \"Political Survival\" Р В РЎвЂўР В Р’В±Р В Р’В»Р В Р’В°Р В РўвЂР В Р’В°Р В Р’ВµР РЋРІР‚С™ Р В Р вЂ Р РЋРІР‚в„–Р РЋР С“Р В РЎвЂўР В РЎвЂќР В РЎвЂР В РЎВ Р В РЎвЂ”Р В РЎвЂўР РЋРІР‚С™Р В Р’ВµР В Р вЂ¦Р РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂўР В РЎВ Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ Р РЋРЎвЂњР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР В РІвЂћвЂ“Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂќР В РЎвЂўР В РЎВР РЋР Р‰Р РЋР вЂ№Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р В РЎвЂ. Р В РЎвЂєР РЋР С“Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р РЋР вЂљР В РЎвЂР РЋР С“Р В РЎвЂќ Р РЋР С“Р В РЎВР В Р’ВµР РЋРІР‚В°Р В Р’ВµР В Р вЂ¦ Р В РЎвЂР В Р’В· Р В РЎвЂўР В Р’В±Р В Р’В»Р В Р’В°Р РЋР С“Р РЋРІР‚С™Р В РЎвЂ Р РЋР С“Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚С™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ“Р В Р’В° Р В Р вЂ  Р В РЎвЂўР В Р’В±Р В Р’В»Р В Р’В°Р РЋР С“Р РЋРІР‚С™Р РЋР Р‰ Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В Р’В° \"Р РЋР С“Р В Р вЂ¦Р В Р’ВµР В Р’В¶Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂќР В РЎвЂўР В РЎВР В Р’В°\".",
        scores: {
            gameplay: { score: 4, reasoning: "Р В Р’В Р В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РўвЂР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ Р РЋР С“Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р В Р’ВµР РЋРІР‚С™ Р В РЎвЂР В Р вЂ¦Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В Р’ВµР РЋР С“Р В Р вЂ¦Р РЋРЎвЂњР РЋР вЂ№ Р В РЎвЂ“Р В Р’ВµР В РІвЂћвЂ“Р В РЎВР В РЎвЂ”Р В Р’В»Р В Р’ВµР В РІвЂћвЂ“-Р В РўвЂР В РЎвЂР В Р вЂ¦Р В Р’В°Р В РЎВР В РЎвЂР В РЎвЂќР РЋРЎвЂњ", lack_of_info: null },
            story: { score: 3, reasoning: "Р В Р Р‹Р РЋР вЂ№Р В Р’В¶Р В Р’ВµР РЋРІР‚С™ Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р’ВµР В Р вЂ¦ Р В Р вЂ Р В РЎвЂўР В РЎвЂќР РЋР вЂљР РЋРЎвЂњР В РЎвЂ“ Р РЋР РЉР В РЎвЂќР В РЎвЂўР В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С›Р В Р’В»Р В РЎвЂР В РЎвЂќР РЋРІР‚С™Р В Р’В°", lack_of_info: null },
            visual: { score: 3, reasoning: "Р В РІР‚в„ўР В РЎвЂР В Р’В·Р РЋРЎвЂњР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р В РЎвЂ”Р РЋР вЂљР В Р’ВµР В РўвЂР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РІвЂћвЂ“ Р В РЎвЂ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В РЎвЂўР В Р вЂ  Р В РЎвЂўР РЋР вЂљР В РЎвЂР В РЎвЂ“Р В РЎвЂР В Р вЂ¦Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂў", lack_of_info: null },
            monetization: { score: 2, reasoning: "Р В РЎСџР В РЎвЂўР РЋРІР‚С™Р В Р’ВµР В Р вЂ¦Р РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В» Р В РЎВР В РЎвЂўР В Р вЂ¦Р В Р’ВµР РЋРІР‚С™Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ Р РЋРІР‚С™Р РЋР вЂљР В Р’ВµР В Р’В±Р РЋРЎвЂњР В Р’ВµР РЋРІР‚С™ Р В РўвЂР В РЎвЂўР В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР В РЎвЂ Р В РЎВР В Р’ВµР РЋРІР‚В¦Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎвЂќ", lack_of_info: "Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р В РЎвЂР В Р вЂ¦Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ Р В РЎвЂў Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦Р В Р’В°Р РЋРІР‚В¦ Р В РЎВР В РЎвЂўР В Р вЂ¦Р В Р’ВµР РЋРІР‚С™Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ" },
            niche: { score: 5, reasoning: "Р В РІР‚в„ўР РЋРІР‚в„–Р РЋР С“Р В РЎвЂўР В РЎвЂќР В Р’В°Р РЋР РЏ Р В Р вЂ¦Р В РЎвЂР РЋРІвЂљВ¬Р В Р’ВµР В Р вЂ Р В Р’В°Р РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р В Р’В»Р В Р’ВµР В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰ Р В Р’В±Р В Р’В»Р В Р’В°Р В РЎвЂ“Р В РЎвЂўР В РўвЂР В Р’В°Р РЋР вЂљР РЋР РЏ Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РЎВР РЋРЎвЂњ Р РЋР С“Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚С™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ“Р РЋРЎвЂњ", lack_of_info: null },
            innovation: { score: 4, reasoning: "Р В РЎв„ўР В РЎвЂўР В РЎВР В Р’В±Р В РЎвЂР В Р вЂ¦Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р РЋР РЉР В Р’В»Р В Р’ВµР В РЎВР В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р В РЎвЂўР В Р вЂ  Р В Р вЂ  Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂўР В РЎВ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™Р В Р’Вµ Р РЋР С“Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р В Р’ВµР РЋРІР‚С™ Р В РЎвЂР В Р вЂ¦Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰", lack_of_info: null }
        },
        growth_points: [
            {
                aspect: "Р В Р’В Р В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В РўвЂР В РЎвЂР В Р’В»Р В Р’ВµР В РЎВР В РЎВР В Р’В° (Economy)",
                current_state: "Р В РІР‚СћР В РўвЂР В РЎвЂР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“ (Р РЋРЎвЂњР В РўвЂР В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ) Р В РЎвЂР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р РЋРЎвЂњР В Р’ВµР РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р В РЎвЂ Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В РЎвЂР РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В Р’В°, Р В РЎвЂ Р В РўвЂР В Р’В»Р РЋР РЏ Р В Р’В°Р РЋР вЂљР В РЎВР В РЎвЂР В РЎвЂ.",
                recommendation: "Р В РІР‚в„ўР В РЎвЂР В Р’В·Р РЋРЎвЂњР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РўвЂР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ Р РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В Р’ВµР В Р’В· 'Р В Р в‚¬Р В Р вЂ Р РЋР РЏР В РўвЂР В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР РЋРІР‚РЋР В Р вЂ Р РЋРІР‚в„–'. Р В Р’В§Р В Р’ВµР В РЎВ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р В Р’ВµР В Р’Вµ Р В РўвЂР В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р’В°, Р РЋРІР‚С™Р В Р’ВµР В РЎВ Р В Р’В±Р В Р’ВµР В РўвЂР В Р вЂ¦Р В Р’ВµР В Р’Вµ Р В Р’В·Р В Р’ВµР В РЎВР В Р’В»Р РЋР РЏ (Р В Р вЂ¦Р В Р’В°Р В Р вЂ Р РЋР С“Р В Р’ВµР В РЎвЂ“Р В РўвЂР В Р’В°).",
                expected_outcome: "Р В Р Р‹Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В Р’В·Р В РЎвЂўР В Р вЂ¦ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С›Р В Р’В»Р В РЎвЂР В РЎвЂќР РЋРІР‚С™Р В Р’В° Р В РЎвЂ Р В Р’В°Р В Р вЂ¦Р РЋРІР‚С™Р В РЎвЂ-Р РЋР С“Р В Р вЂ¦Р В РЎвЂўР РЋРЎвЂњР В Р’В±Р В РЎвЂўР В Р’В»Р В Р’В» Р В РЎВР В Р’ВµР РЋРІР‚В¦Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В° (Р В Р’В»Р В РЎвЂР В РўвЂР В Р’ВµР РЋР вЂљР РЋРЎвЂњ Р РЋР С“Р В Р’В»Р В РЎвЂўР В Р’В¶Р В Р вЂ¦Р В Р’ВµР В Р’Вµ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В РЎвЂ)."
            },
            {
                aspect: "Р В РЎСџР В РЎвЂўР В Р’В»Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В РЎвЂР В РІвЂћвЂ“ Р В РЎВР В Р’ВµР РЋРІР‚С™Р В Р’В°-Р В РЎвЂ“Р В Р’ВµР В РІвЂћвЂ“Р В РЎВ",
                current_state: "Р В РЎСџР В РЎвЂўР В Р’В»Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР В РЎвЂќР В Р’В° Р В РЎВР В Р’ВµР В Р’В¶Р В РўвЂР РЋРЎвЂњ 4 Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР В РЎвЂўР В РЎвЂќР В Р’В°Р В РЎВР В РЎвЂ Р В Р’В·Р В Р’В°Р РЋР РЏР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В Р’В°, Р В Р вЂ¦Р В РЎвЂў Р В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂР РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р вЂ¦Р В Р’В° Р РЋРІР‚РЋР В Р’В°Р РЋРІР‚С™Р В Р’Вµ.",
                recommendation: "Р В РІР‚в„ўР В Р вЂ¦Р В Р’ВµР В РўвЂР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎВР В Р’ВµР РЋРІР‚В¦Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎвЂќР В РЎвЂ 'Р В Р Р‹Р В РЎвЂР В РЎВР В Р’В±Р В РЎвЂР В РЎвЂўР В Р’В·Р В Р’В°' (Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В РЎвЂ”Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р РЋРІР‚в„– Р РЋР С“ Р В Р’В±Р В Р’В°Р РЋРІР‚С›Р РЋРІР‚С›Р В Р’В°Р В РЎВР В РЎвЂ) Р В РЎвЂ 'Р В РЎСџР В Р’В°Р РЋР вЂљР В Р’В°Р В Р’В·Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ' (Р РЋР С“Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р В Р’В°Р РЋР РЏ Р В РЎвЂќР РЋР вЂљР В Р’В°Р В Р’В¶Р В Р’В° Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В РЎвЂўР В Р вЂ ).",
                expected_outcome: "Р В РЎСџР РЋР вЂљР В Р’ВµР В Р вЂ Р РЋР вЂљР В Р’В°Р РЋРІР‚В°Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР РЋРІР‚в„– Р В РЎвЂР В Р’В· 'Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂў Р В Р’В±Р РЋРІР‚в„–Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’ВµР В Р’Вµ Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќР В Р’В°Р В Р’ВµР РЋРІР‚С™' Р В Р вЂ  'Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂў Р В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР РЋРІвЂљВ¬Р В Р’Вµ Р В РўвЂР В РЎвЂўР В РЎвЂ“Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋР вЂљР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™Р РЋР С“Р РЋР РЏ'."
            },
            {
                aspect: "Р В РЎСџР В РЎвЂўР РЋР вЂљР В РЎвЂўР В РЎвЂ“ Р В Р вЂ Р РЋРІР‚В¦Р В РЎвЂўР В РўвЂР В Р’В° (Onboarding)",
                current_state: "Р В Р Р‹Р В РЎвЂўР РЋРІР‚РЋР В Р’ВµР РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ RTS, 4X Р В РЎвЂ Р В РЎСџР В РЎвЂўР В Р’В»Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР В РЎвЂќР В РЎвЂ Р РЋР С“Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р В Р’ВµР РЋРІР‚С™ Р В РЎвЂќР В РЎвЂўР В Р’В»Р В РЎвЂўР РЋР С“Р РЋР С“Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРЎвЂњР РЋР вЂ№ Р В РЎвЂќР В РЎвЂўР В РЎвЂ“Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р РЋРЎвЂњР РЋР вЂ№ Р В Р вЂ¦Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР РЋРЎвЂњ.",
                recommendation: "Р В Р’В Р В Р’В°Р В Р’В·Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р РЋР вЂљР В Р’ВµР В Р’В¶Р В РЎвЂР В РЎВ 'Seedling' (Р В Р’В Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР В РЎвЂќ) Р Р†Р вЂљРІР‚Сњ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р вЂ Р РЋРІР‚в„–Р В Р’Вµ 3 Р В РЎВР В Р’В°Р РЋРІР‚С™Р РЋРІР‚РЋР В Р’В° Р РЋРІР‚РЋР В Р’В°Р РЋР С“Р РЋРІР‚С™Р РЋР Р‰ Р В РЎВР В РЎвЂР В РЎвЂќР РЋР вЂљР В РЎвЂў-Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’ВµР В РўвЂР В Р’В¶Р В РЎВР В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р В Р’В° Р В Р’В°Р В Р вЂ Р РЋРІР‚С™Р В РЎвЂўР В РЎВР В Р’В°Р РЋРІР‚С™Р В РЎвЂР В Р’В·Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В Р’В° AI.",
                expected_outcome: "Р В Р Р‹Р В Р вЂ¦Р В РЎвЂР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В Р вЂ Р В Р’В°Р В Р’В»Р В Р’В° Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂР РЋРІР‚РЋР В РЎвЂќР В РЎвЂўР В Р вЂ  (Churn Rate) Р В Р вЂ  Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋРІР‚РЋР В Р’В°Р РЋР С“ Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР РЋРІР‚в„– Р В Р вЂ¦Р В Р’В° 25%."
            },
            {
                aspect: "Р В Р’В­Р В РЎвЂќР В РЎвЂўР В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В РЎвЂР В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р В Р’В»Р В Р’ВµР В РўвЂР РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В РЎвЂР РЋР РЏ",
                current_state: "Р В РІР‚СњР В Р’ВµР В РІвЂћвЂ“Р РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В РЎвЂР РЋР РЏ Р В Р вЂ Р В Р’В»Р В РЎвЂР РЋР РЏР РЋР вЂ№Р РЋРІР‚С™ Р В Р вЂ¦Р В Р’В° Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР В Р’Вµ, Р В Р вЂ¦Р В РЎвЂў Р В РЎВР В РЎвЂР РЋР вЂљ Р В РЎвЂќР В Р’В°Р В Р’В¶Р В Р’ВµР РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р В РЎВ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р’ВµР В РЎВ Р В Р’В±Р В РЎвЂўР РЋР РЏ.",
                recommendation: "Р В Р Р‹Р В РўвЂР В Р’ВµР В Р’В»Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р РЋРЎвЂњ Р В Р’В¶Р В РЎвЂР В Р вЂ Р РЋРІР‚в„–Р В РЎВ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂўР В РЎВ: Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋР РЏР В Р’В·Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР РЋРІР‚С™ Р В Р вЂ Р В РЎвЂўР В РІвЂћвЂ“Р В Р вЂ¦Р РЋРІР‚в„– Р В Р вЂ Р РЋРІР‚в„–Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р В РЎВР РЋРЎвЂњР РЋРІР‚С™Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ Р В Р вЂ¦Р В Р’ВµР В РІвЂћвЂ“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р РЋРІР‚С›Р В Р’В°Р РЋРЎвЂњР В Р вЂ¦Р РЋРІР‚в„–, Р В Р’В°Р РЋРІР‚С™Р В Р’В°Р В РЎвЂќР РЋРЎвЂњР РЋР вЂ№Р РЋРІР‚В°Р В Р’ВµР В РІвЂћвЂ“ Р В Р вЂ Р РЋР С“Р В Р’ВµР РЋРІР‚В¦.",
                expected_outcome: "Р В РЎСџР В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р РЋРІвЂљВ¬Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р РЋР вЂљР В Р’ВµР В РЎвЂР В РЎвЂ“Р РЋР вЂљР В Р’В°Р В Р’В±Р В Р’ВµР В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂ Р В Р’В·Р В Р’В° Р РЋР С“Р РЋРІР‚РЋР В Р’ВµР РЋРІР‚С™ Р В Р вЂ¦Р В Р’ВµР В РЎвЂ”Р РЋР вЂљР В Р’ВµР В РўвЂР РЋР С“Р В РЎвЂќР В Р’В°Р В Р’В·Р РЋРЎвЂњР В Р’ВµР В РЎВР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂ Р РЋР С“Р РЋР вЂљР В Р’ВµР В РўвЂР РЋРІР‚в„– (Emergent Gameplay)."
            }
        ]
    },
    en: {
        suggested_name: "Fertil War",
        summary: "Analysis confirms: the combination of \"Plant-based RTS\" and \"Political Survival\" has high potential for building a sustainable community. The main risk has shifted from setting to \"snowball\" balance.",
        scores: {
            gameplay: { score: 4, reasoning: "Resource scarcity creates interesting gameplay dynamics", lack_of_info: null },
            story: { score: 3, reasoning: "Story is built around ecological conflict", lack_of_info: null },
            visual: { score: 3, reasoning: "Visual representation of plants and resources is original", lack_of_info: null },
            monetization: { score: 2, reasoning: "Monetization potential requires additional mechanics work", lack_of_info: "No information about monetization plans" },
            niche: { score: 5, reasoning: "High niche appeal due to unique setting", lack_of_info: null },
            innovation: { score: 4, reasoning: "Combination of familiar elements in new context creates innovation", lack_of_info: null }
        },
        growth_points: [
            {
                aspect: "Resource dilemma (Economy)",
                current_state: "A single resource (fertilizer) is used for both construction and army.",
                recommendation: "Visualize scarcity through 'Soil Withering'. The more active the extraction, the poorer the land (forever).",
                expected_outcome: "Creating natural conflict zones and anti-snowball mechanics (harder for the leader to grow)."
            },
            {
                aspect: "Political meta-game",
                current_state: "Politics between 4 players is declared, but only exists in chat.",
                recommendation: "Implement 'Symbiosis' mechanics (formal pacts with buffs) and 'Parasitism' (hidden resource theft).",
                expected_outcome: "Transforming the game from 'who clicks faster' to 'who negotiates better'."
            },
            {
                aspect: "Entry threshold (Onboarding)",
                current_state: "The combination of RTS, 4X and Politics creates a colossal cognitive load.",
                recommendation: "Develop 'Seedling' mode Р Р†Р вЂљРІР‚Сњ in the first 3 matches, part of micro-management is automated by AI.",
                expected_outcome: "Reducing newbie churn rate in the first hour by 25%."
            },
            {
                aspect: "Environmental consequences",
                current_state: "Actions affect development, but the world seems like a static battlefield.",
                recommendation: "Make the map a living actor: pollution from war causes mutations in neutral fauna that attacks everyone.",
                expected_outcome: "Increasing replayability through environmental unpredictability (Emergent Gameplay)."
            }
        ]
    }
};

const isIdeaAnalysisPayloadUsable = (payload) => {
    if (!payload || typeof payload !== 'object') return false;
    return Boolean(payload.suggested_name || payload.summary || payload.scores || payload.growth_points);
};

const buildMockIdeaAnalysisPayload = (lang) => {
    const locale = lang === 'ru' ? 'ru' : 'en';
    const source = MOCK_IDEA_ANALYSIS_DATA[locale] || MOCK_IDEA_ANALYSIS_DATA.en;
    return {
        ...source,
        _mock: true,
        _mock_reason: 'second_service_unavailable',
    };
};

// --- TOAST COMPONENT ---
const Toast = ({ message, type = 'error', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'error' ? 'bg-[#D23D3D]/20 border-[#D23D3D]/50' : 'bg-[#3AD867]/20 border-[#3AD867]/50';
    const textColor = type === 'error' ? 'text-[#FF6B6B]' : 'text-[#3AD867]';
    const iconColor = type === 'error' ? 'text-[#D23D3D]' : 'text-[#3AD867]';

    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor} animate-in fade-in slide-in-from-top-4 duration-300`}>
            <AlertCircle className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
            <span className={`${textColor} text-sm font-medium`}>{message}</span>
            <button onClick={onClose} className="ml-2 text-white/40 hover:text-white transition">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// --- SIMPLE LOADER COMPONENT ---
const SimpleLoader = ({ t }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-[#2B2C37] rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-[#FFC132] border-r-[#E8A91B] rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white">{t('loading')}</h3>
                <p className="text-white/60 text-sm">{t('pleaseWait')}</p>
            </div>
        </div>
    </div>
);

const RadarChart = ({ data, labels, reasonings = {} }) => {
    const canvasRef = useRef(null);
    const [hoveredLabel, setHoveredLabel] = useState(null);
    const [tooltipPos, setTooltipPos] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Р В РЎСџР В РЎвЂўР В РўвЂР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂќР В Р’В° Retina/HiDPI
        const dpr = window.devicePixelRatio || 1;
        
        // Р В Р’В Р В Р’В°Р В Р’В·Р В РЎВР В Р’ВµР РЋР вЂљР РЋРІР‚в„– Р В Р вЂ  CSS-Р В РЎвЂ”Р В РЎвЂР В РЎвЂќР РЋР С“Р В Р’ВµР В Р’В»Р РЋР РЏР РЋРІР‚В¦ (Р В Р вЂ Р В РЎвЂР В РўвЂР В РЎвЂР В РЎВР РЋРІР‚в„–Р В Р’Вµ)
        const width = 308;
        const height = 196;

        // Р В Р в‚¬Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В Р’В°Р В Р вЂ Р В Р’В»Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР вЂљР В Р’ВµР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р РЋР вЂљР В Р’В°Р В Р’В·Р В РЎВР В Р’ВµР РЋР вЂљР РЋРІР‚в„– canvas Р В Р вЂ  device pixels
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Р В РЎС™Р В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р РЋРІР‚С™Р В Р’В°Р В Р’В±Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™, Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р РЋР вЂљР В РЎвЂР РЋР С“Р В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р’В±Р РЋРІР‚в„–Р В Р’В»Р В РЎвЂў Р В Р вЂ  CSS-Р В РЎвЂ”Р В РЎвЂР В РЎвЂќР РЋР С“Р В Р’ВµР В Р’В»Р РЋР РЏР РЋРІР‚В¦
        ctx.scale(dpr, dpr);

        // Р В РЎС›Р В Р’ВµР В РЎвЂ”Р В Р’ВµР РЋР вЂљР РЋР Р‰ Р РЋР вЂљР В РЎвЂР РЋР С“Р РЋРЎвЂњР В Р’ВµР В РЎВ Р В РЎвЂќР В Р’В°Р В РЎвЂќ Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р Р†Р вЂљРІР‚Сњ Р В Р вЂ  Р В РЎвЂќР В РЎвЂўР В РЎвЂўР РЋР вЂљР В РўвЂР В РЎвЂР В Р вЂ¦Р В Р’В°Р РЋРІР‚С™Р В Р’В°Р РЋРІР‚В¦ CSS-Р В РЎвЂ”Р В РЎвЂР В РЎвЂќР РЋР С“Р В Р’ВµР В Р’В»Р В Р’ВµР В РІвЂћвЂ“
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        const levels = 5;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = '#D4DDEA';
        ctx.lineWidth = 1;

        for (let i = 1; i <= levels; i++) {
            ctx.beginPath();
            const r = (radius / levels) * i;
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI / 3) * j - Math.PI / 2;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Axes
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
            ctx.stroke();
        }

        // Data polygon
        const polygon = new Path2D();
        data.forEach((value, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const r = (radius / 5) * value;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            i === 0 ? polygon.moveTo(x, y) : polygon.lineTo(x, y);
        });
        polygon.closePath();

        // Fill 1: radial orange gradient (rgba 0.32)
        const radialFill = ctx.createRadialGradient(centerX, centerY - radius * 0.65, 8, centerX, centerY, radius);
        radialFill.addColorStop(0, 'rgba(255, 117, 73, 0.32)');
        radialFill.addColorStop(1, 'rgba(255, 86, 32, 0.32)');
        ctx.fillStyle = radialFill;
        ctx.fill(polygon);

        // Fill 2: diagonal pink-yellow gradient (rgba 0.32)
        const linearFill = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
        linearFill.addColorStop(0, 'rgba(229, 40, 98, 0.32)');
        linearFill.addColorStop(1, 'rgba(255, 193, 50, 0.32)');
        ctx.fillStyle = linearFill;
        ctx.fill(polygon);

        ctx.strokeStyle = 'rgba(255, 117, 73, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke(polygon);

        // Labels Р Р†Р вЂљРІР‚Сњ Р РЋРЎвЂњР В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР РЋРІвЂљВ¬Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋР вЂљР В Р’ВµР В Р’В·Р В РЎвЂќР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™Р В Р’В°
        ctx.fillStyle = hoveredLabel !== null ? '#FFC132' : '#6B7488';
        ctx.font = '12px Onest';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // Р В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР РЋРІвЂљВ¬Р В Р’Вµ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР РЋРІР‚С™ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™

        labels.forEach((label, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const labelRadius = radius + 25;
            let x = centerX + labelRadius * Math.cos(angle);
            let y = centerY + labelRadius * Math.sin(angle);

            // Р В РЎС›Р В РЎвЂўР В Р вЂ¦Р В РЎвЂќР В Р’В°Р РЋР РЏ Р В РЎвЂ”Р В РЎвЂўР В РўвЂР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В РІвЂћвЂ“Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р В РЎвЂўР В Р’В·Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В РІвЂћвЂ“
            if (i === 0) y -= 8;
            else if (i === 3) y += 8;
            // Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р Р†Р вЂљРІР‚Сњ Р В РЎвЂ”Р В РЎвЂў Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР РЋРЎвЂњ

            ctx.fillText(label, x, y);
        });

    }, [data, labels, hoveredLabel]);

    const handleMouseMove = (e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Check if hovering over label areas
        for (let i = 0; i < labels.length; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const labelRadius = (Math.min(centerX, centerY) - 40) + 25;
            let labelX = centerX + labelRadius * Math.cos(angle);
            let labelY = centerY + labelRadius * Math.sin(angle);
            
            if (i === 0) labelY -= 8;
            else if (i === 3) labelY += 8;
            
            const distance = Math.sqrt((x - labelX) ** 2 + (y - labelY) ** 2);
            if (distance < 30) {
                setHoveredLabel(i);
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                return;
            }
        }
        setHoveredLabel(null);
        setTooltipPos(null);
    };

    const handleMouseLeave = () => {
        setHoveredLabel(null);
        setTooltipPos(null);
    };

    // Р В РІР‚в„ўР В РЎвЂР В Р’В·Р РЋРЎвЂњР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р РЋР вЂљР В Р’В°Р В Р’В·Р В РЎВР В Р’ВµР РЋР вЂљР РЋРІР‚в„– Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋР вЂ№Р РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎВР В РЎвЂ Р В Р’В¶Р В Р’Вµ
    return (
        <div className="relative">
            <canvas 
                ref={canvasRef} 
                width={308} 
                height={196} 
                style={{ width: '308px', height: '196px', cursor: hoveredLabel !== null ? 'help' : 'default' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
            {hoveredLabel !== null && tooltipPos && reasonings[labels[hoveredLabel]] && (
                <div 
                    className="absolute bg-[#2B2C37] border border-[#FFC132]/30 rounded-lg p-3 text-xs text-white max-w-xs shadow-lg pointer-events-none"
                    style={{
                        left: `${tooltipPos.x + 10}px`,
                        top: `${tooltipPos.y + 10}px`,
                        zIndex: 50
                    }}
                >
                    {reasonings[labels[hoveredLabel]]}
                </div>
            )}
        </div>
    );
};

const IdeaAnalysisSection = ({ t, ideaDescription, tags = [], uiLanguage, onDataUpdate, ideaAnalysisData = null, isLoading = false }) => {
    const [data, setData] = useState(ideaAnalysisData);
    const prevIdeaRef = useRef(null);

    useEffect(() => {
        if (ideaAnalysisData) {
            setData(ideaAnalysisData);
            prevIdeaRef.current = ideaDescription;
        }
    }, [ideaAnalysisData, ideaDescription]);

    if (!ideaDescription || ideaDescription.trim().length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                <div className="w-24 h-24 bg-[#FF5620]/10 rounded-full flex items-center justify-center mb-4">
                    <InlineIcon svg={iconNavIdea} color="#FF5620" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{t('noIdeaDescription')}</h2>
                <p className="text-white/70 text-lg max-w-2xl mb-4">{t('noIdeaDescriptionAnalyzeHint')}</p>
            </div>
        );
    }

    if (isLoading) {
        return <SimpleLoader t={t} />;
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                <div className="w-24 h-24 bg-[#FF5620]/10 rounded-full flex items-center justify-center mb-6">
                    <InlineIcon svg={iconNavIdea} color="#FF5620" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{t('noIdeaDescription')}</h2>
                <p className="text-white/70 text-lg max-w-2xl mb-4">{t('noIdeaDescriptionHint')}</p>
            </div>
        );
    }

    // Extract scores data and create reasonings map for radar chart
    const aspectKeyMap = {
        gameplay: 'aspectGameplay',
        story: 'aspectStory',
        visual: 'aspectVisual',
        monetization: 'aspectMonetization',
        niche: 'aspectNiche',
        innovation: 'aspectInnovation'
    };
    
    const scoreLabels = Object.keys(data.scores || {}).map(key => t(aspectKeyMap[key] || key));
    const scoreValues = Object.keys(data.scores || {}).map(key => {
        const scoreObj = data.scores[key];
        return scoreObj?.score !== null ? scoreObj.score : 0;
    });
    
    const reasoningsMap = {};
    Object.entries(data.scores || {}).forEach(([key, scoreObj]) => {
        const translatedLabel = t(aspectKeyMap[key] || key);
        reasoningsMap[translatedLabel] = scoreObj?.reasoning || '';
    });

    return (
        <div className="flex flex-col items-start px-4 md:px-8 pb-12 gap-10 w-full max-w-[1400px] mx-auto">
            <div className="flex flex-col items-start p-4 gap-5 w-full bg-[#191D28] rounded-[20px]">
                <div className="flex flex-col lg:flex-row items-start gap-3 w-full">
                    {/* Left Column: AI Badge, Title, Description */}
                    <div className="flex flex-col gap-5 flex-1">
                        {/* AI Badge */}
                        <div
                            className="flex items-center justify-center gap-1 w-[130px] h-[26px] rounded-[1000px] px-3 pl-2"
                            style={{
                                background: 'radial-gradient(99.96% 99.96% at 50% 0.04%, rgba(255, 117, 73, 0.12) 0%, rgba(255, 86, 32, 0.12) 100%)',
                            }}
                        >
                            <img src={iconIdeaBadgeBolt} alt="" className="w-[18px] h-[18px] shrink-0" />
                            <span
                                className="text-[14px] leading-[18px] font-medium"
                                style={{
                                    background: 'radial-gradient(99.96% 99.96% at 50% 0.04%, #FF7549 0%, #FF5620 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                {t('aiPowered')}
                            </span>
                        </div>

                        {/* Title & Description */}
                        <div className="flex flex-col gap-1 w-full">
                            <h3 className="text-base font-semibold text-white">{data?.suggested_name || 'Game Idea'}</h3>
                            <p className="text-sm font-medium text-[#BABBBF]">{data?.summary || ''}</p>
                        </div>
                    </div>

                    {/* Right Column: Radar Chart */}
                    <div className="flex items-center justify-center lg:w-[320px] lg:h-[200px] shrink-0 lg:self-center">
                        <RadarChart 
                            data={scoreValues} 
                            labels={scoreLabels}
                            reasonings={reasoningsMap}
                        />
                    </div>
                </div>
            </div>

            {/* Growth Points / Improvements */}
            {data?.growth_points && data.growth_points.length > 0 && (
                <div className="flex flex-col gap-3 w-full">
                    <h3 className="text-xl font-semibold text-white">{t('improvementsTitle')}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                        {data.growth_points.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-start p-4 gap-4 bg-[#191D28] rounded-[20px]">
                                <h4 className="w-full text-[16px] leading-[20px] tracking-[-0.01em] font-medium text-white">{item.aspect}</h4>
                                <div className="flex items-start gap-3 w-full">
                                    <div className="flex items-center justify-center w-10 h-10 p-2 bg-[rgba(217,50,50,0.12)] rounded-[8px] shrink-0">
                                        <img src={iconIdeaAsIs} alt="" className="w-[22px] h-[22px]" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <span className="text-[14px] leading-[18px] tracking-[-0.01em] font-medium text-[#BABBBF]">{t('asIsLabel')}</span>
                                        <span className="text-[14px] leading-[18px] tracking-[-0.01em] font-medium text-white">{item.current_state}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 w-full">
                                    <div className="flex items-center justify-center w-10 h-10 p-2 bg-[rgba(255,86,32,0.12)] rounded-[8px] shrink-0">
                                        <img src={iconIdeaRecommendation} alt="" className="w-[22px] h-[22px]" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <span className="text-[14px] leading-[18px] tracking-[-0.01em] font-medium text-[#BABBBF]">{t('aiRecommendation')}</span>
                                        <span className="text-[14px] leading-[18px] tracking-[-0.01em] font-medium text-white">{item.recommendation}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 w-full">
                                    <div className="flex items-center justify-center w-10 h-10 p-2 bg-[#1D332F] rounded-[8px] shrink-0">
                                        <img src={iconIdeaExpected} alt="" className="w-[22px] h-[22px]" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <span className="text-[14px] leading-[18px] tracking-[-0.01em] font-medium text-[#BABBBF]">{t('expectedResult')}</span>
                                        <span className="text-[14px] leading-[18px] tracking-[-0.01em] font-medium text-white">{item.expected_outcome}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPETITORS SECTION ---

const MOCK_COMPETITORS_DATA = {
    ru: {
        metrics: { found: 186, revenue: '$3.2m', medianRevenue: '$85K', avgRevenue: '$92K', avgPrice: '$14' },
        list: [
            { "id": 1170980, "title": "A Planet of Mine", "image": "https://cdn.akamai.steamstatic.com/steam/apps/1170980/header.jpg?t=1627286770", "positiveReviewPercent": "78%", "reviewCount": "1K", "revenue": "$9.9K", "downloads": "1", "releaseDate": "07.03.2020", "price": "$8.99", "description": "Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р В Р’В»Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚В Р В Р’ВµР В РўвЂР РЋРЎвЂњР РЋР вЂљР В Р вЂ¦Р В Р’В°Р РЋР РЏ 4X-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂР РЋР РЏ, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР В РЎвЂўР В РЎвЂќ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ¦Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋР С“ Р В РЎвЂўР В РўвЂР В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚в„–, Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РЎВР В РЎвЂ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р’В°Р В РЎВР В РЎвЂ, Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋРІР‚С™Р В Р’ВµР РЋРІР‚В¦Р В Р вЂ¦Р В РЎвЂўР В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂР В РЎвЂ Р В РЎвЂ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В Р вЂ Р В Р’В»Р В РЎвЂР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ  Р РЋР С“Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’Вµ, Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР РЋР РЏ Р В РЎВР В Р’ВµР В Р’В¶Р В РўвЂР РЋРЎвЂњ Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР В РЎВ, Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂ“Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В РІвЂћвЂ“ Р В РЎвЂ Р В Р вЂ Р В РЎвЂўР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РЎВ Р В РўвЂР В РЎвЂўР В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’ВµР В РЎВ. Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р В Р’В»Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚В Р В Р’ВµР В РўвЂР РЋРЎвЂњР РЋР вЂљР В Р вЂ¦Р В Р’В°Р РЋР РЏ 4X-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂР РЋР РЏ, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР В РЎвЂўР В РЎвЂќ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ¦Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋР С“ Р В РЎвЂўР В РўвЂР В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚в„–, Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РЎВР В РЎвЂ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р’В°Р В РЎВР В РЎвЂ, Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋРІР‚С™Р В Р’ВµР РЋРІР‚В¦Р В Р вЂ¦Р В РЎвЂўР В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂР В РЎвЂ Р В РЎвЂ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В Р вЂ Р В Р’В»Р В РЎвЂР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ  Р РЋР С“Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’Вµ, Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР РЋР РЏ Р В РЎВР В Р’ВµР В Р’В¶Р В РўвЂР РЋРЎвЂњ Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР В РЎВ, Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂ“ Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р В Р’В»Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚В Р В Р’ВµР В РўвЂР РЋРЎвЂњР РЋР вЂљР В Р вЂ¦Р В Р’В°Р РЋР РЏ 4X-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂР РЋР РЏ, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР В РЎвЂўР В РЎвЂќ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ¦Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋР С“ Р В РЎвЂўР В РўвЂР В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚в„–, Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РЎВР В РЎвЂ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р’В°Р В РЎВР В РЎвЂ, Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋРІР‚С™Р В Р’ВµР РЋРІР‚В¦Р В Р вЂ¦Р В РЎвЂўР В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂР В РЎвЂ Р В РЎвЂ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В Р вЂ Р В Р’В»Р В РЎвЂР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ  Р РЋР С“Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’Вµ, Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР РЋР РЏ Р В РЎВР В Р’ВµР В Р’В¶Р В РўвЂР РЋРЎвЂњ Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР В РЎВ, Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂ“ Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р В Р’В»Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚В Р В Р’ВµР В РўвЂР РЋРЎвЂњР РЋР вЂљР В Р вЂ¦Р В Р’В°Р РЋР РЏ 4X-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂР РЋР РЏ, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР В РЎвЂўР В РЎвЂќ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ¦Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋР С“ Р В РЎвЂўР В РўвЂР В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚в„–, Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РЎВР В РЎвЂ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р’В°Р В РЎВР В РЎвЂ, Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋРІР‚С™Р В Р’ВµР РЋРІР‚В¦Р В Р вЂ¦Р В РЎвЂўР В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂР В РЎвЂ Р В РЎвЂ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В Р вЂ Р В Р’В»Р В РЎвЂР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ  Р РЋР С“Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’Вµ, Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР РЋР РЏ Р В РЎВР В Р’ВµР В Р’В¶Р В РўвЂР РЋРЎвЂњ Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР В РЎВ, Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂ“ Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р В Р’В»Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚В Р В Р’ВµР В РўвЂР РЋРЎвЂњР РЋР вЂљР В Р вЂ¦Р В Р’В°Р РЋР РЏ 4X-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂР РЋР РЏ, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР В РЎвЂўР В РЎвЂќ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ¦Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋР С“ Р В РЎвЂўР В РўвЂР В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚в„–, Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РЎВР В РЎвЂ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р’В°Р В РЎВР В РЎвЂ, Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋРІР‚С™Р В Р’ВµР РЋРІР‚В¦Р В Р вЂ¦Р В РЎвЂўР В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂР В РЎвЂ Р В РЎвЂ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В Р вЂ Р В Р’В»Р В РЎвЂР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ  Р РЋР С“Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’Вµ, Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР РЋР РЏ Р В РЎВР В Р’ВµР В Р’В¶Р В РўвЂР РЋРЎвЂњ Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР В РЎВ, Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂ“", "tags": ["Building","Base-Building","Colony Sim","Minimalist","4X","Simulation","Resource Management","Mining","Strategy","Space","Sandbox","God Game","Trading","Science","Procedural Generation","Indie","Automation","2D","Retro","Singleplayer"], "similarity": "85%", "peakCCU": "10K", "developer": "Tuesday Quest", "publisherClass": "Indie", "estimatedRevenue": "$3.0K", "publisher": "Tuesday Quest", "genres": ["Indie","Simulation","Strategy"], "categories": ["Single-player","Steam Achievements","Captions available","Steam Cloud"], "mechanics": [], "pros": [], "cons": [] },
            { id: 2, title: 'Northgard', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/466560/header.jpg', positiveReviewPercent: '89%', reviewCount: '45K', revenue: '$6.5M', downloads: '1M', releaseDate: 'Feb 18, 2021', price: '$29.99', description: 'RTS Р В РЎвЂ”Р РЋР вЂљР В РЎвЂў Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР В Р’Вµ Р В РЎвЂќР В Р’В»Р В Р’В°Р В Р вЂ¦Р В РЎвЂўР В Р вЂ , Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р В РЎвЂўР В РўвЂР В Р вЂ¦Р В РЎвЂ Р В РЎвЂ Р РЋРІР‚С™Р В Р’Вµ Р В Р’В¶Р В Р’Вµ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р РЋРІР‚в„– Р В РЎвЂР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р РЋРЎвЂњР РЋР вЂ№Р РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋР РЉР В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂўР В РЎВР В РЎвЂР В РЎвЂќР В РЎвЂ, Р В Р’В°Р РЋР вЂљР В РЎВР В РЎвЂР В РЎвЂ Р В РЎвЂ Р РЋР РЉР В РЎвЂќР РЋР С“Р В РЎвЂ”Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В РЎвЂР В РЎвЂ, Р РЋР С“Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р В Р вЂ Р В Р’В°Р РЋР РЏ Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР РЏР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РўвЂР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™.', tags: ['RTS', '4X', 'Strategy'], similarity: '94%', peakCCU: '18 000', developer: 'Shiro Games', publisherClass: 'AA', estimatedRevenue: '450$', publisher: 'Shiro Games', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Singleplayer'], mechanics: ['Shared Resources', 'Territory Expansion', 'Economy Management'], pros: ['Atmosphere', 'Strategic Depth'], cons: ['Slow Early Game'] },
            { id: 3, title: 'Offworld Trading Company', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271240/header.jpg', positiveReviewPercent: '84%', reviewCount: '9K', revenue: '$900K', downloads: '180K', releaseDate: '28.04.2016', price: '$29.99', description: 'Р В Р’В­Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂўР В РЎВР В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В Р’В°Р РЋР РЏ RTS, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р В Р’В±Р В РЎвЂўР РЋР вЂљР РЋР Р‰Р В Р’В±Р В Р’В° Р В Р’В·Р В Р’В° Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р РЋРІР‚в„– Р В РЎвЂ Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР вЂ№ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РЎвЂР РЋР С“Р РЋРІР‚В¦Р В РЎвЂўР В РўвЂР В РЎвЂР РЋРІР‚С™ Р РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В Р’ВµР В Р’В· Р РЋР вЂљР РЋРІР‚в„–Р В Р вЂ¦Р В РЎвЂўР В РЎвЂќ, Р В РўвЂР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ Р В РЎвЂ Р РЋР РЉР В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂўР В РЎВР В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В РЎвЂўР В Р’Вµ Р В РўвЂР В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ.', tags: ['RTS', 'Economy', 'Strategy'], similarity: '91%', peakCCU: '3 100', developer: 'Mohawk Games', publisherClass: 'Indie', estimatedRevenue: '120$-200$', publisher: 'Stardock', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Competitive'], mechanics: ['Resource Scarcity', 'Market Control', 'Economic Warfare'], pros: ['Unique Focus', 'High Replayability'], cons: ['Steep Learning Curve'] },
            { id: 4, title: 'Grey Goo', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/290790/header.jpg', positiveReviewPercent: '76%', reviewCount: '7K', revenue: '$1.4M', downloads: '260K', releaseDate: '23.01.2015', price: '-', description: 'Р В РЎв„ўР В Р’В»Р В Р’В°Р РЋР С“Р РЋР С“Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В Р’В°Р РЋР РЏ RTS Р РЋР С“ Р В Р’В°Р РЋР С“Р В РЎвЂР В РЎВР В РЎВР В Р’ВµР РЋРІР‚С™Р РЋР вЂљР В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р В РЎВР В РЎвЂ Р РЋРІР‚С›Р РЋР вЂљР В Р’В°Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏР В РЎВР В РЎвЂ, Р В РЎвЂўР В РўвЂР В Р вЂ¦Р В Р’В° Р В РЎвЂР В Р’В· Р В РЎвЂќР В РЎвЂўР РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚В¦ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰Р РЋР вЂ№ Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р’ВµР В Р вЂ¦Р В Р’В° Р В Р вЂ Р В РЎвЂўР В РЎвЂќР РЋР вЂљР РЋРЎвЂњР В РЎвЂ“ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР РЋР вЂљР В Р’В°Р РЋР С“Р В РЎвЂ”Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’ВµР В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В РЎвЂўР В Р вЂ .', tags: ['RTS', 'Sci-Fi', 'Strategy'], similarity: '88%', peakCCU: '5000', developer: 'Petroglyph', publisherClass: 'AA', estimatedRevenue: '200$-300$', publisher: 'Grey Box', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Singleplayer'], mechanics: ['Asymmetric Factions', 'Resource Conversion'], pros: ['Faction Design'], cons: ['Weak Multiplayer Meta'] },
            { id: 5, title: 'Warparty', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/777770/header.jpg', positiveReviewPercent: '73%', reviewCount: '3K', revenue: '$420K', downloads: '90K', releaseDate: '28.03.2019', price: '$19.99', description: 'RTS Р В Р вЂ  Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р вЂ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В РЎВ Р РЋР С“Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚С™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ“Р В Р’Вµ Р РЋР С“ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р’В»Р В Р’ВµР В РЎВ Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР В РІвЂћвЂ“ Р В РЎвЂ Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР РЏР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РЎВ Р В РўвЂР В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’ВµР В РЎВ Р В Р вЂ¦Р В Р’ВµР РЋРІР‚В¦Р В Р вЂ Р В Р’В°Р РЋРІР‚С™Р В РЎвЂќР В РЎвЂ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В РЎвЂўР В Р вЂ .', tags: ['RTS', 'Strategy', 'Indie'], similarity: '86%', peakCCU: '1800', developer: 'Crazy Monkey Studios', publisherClass: 'Indie', estimatedRevenue: '80$-120$', publisher: 'Warpzone Studios', genres: ['RTS', 'Strategy'], categories: ['Multiplayer'], mechanics: ['Territory Control', 'Unit Production'], pros: ['Classic RTS Feel'], cons: ['Low Innovation'] },
            { id: 6, title: 'SpellForce 3', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/311290/header.jpg', positiveReviewPercent: '79%', reviewCount: '14K', revenue: '$3.8M', downloads: '600K', releaseDate: '07.12.2017', price: '$39.99', description: 'RTS Р РЋР С“ Р РЋР РЉР В Р’В»Р В Р’ВµР В РЎВР В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р В Р’В°Р В РЎВР В РЎвЂ RPG, Р РЋРІР‚С›Р РЋР вЂљР В Р’В°Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР В РЎвЂќР В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂќР РЋРЎвЂњР РЋР вЂљР В Р’ВµР В Р вЂ¦Р РЋРІР‚В Р В РЎвЂР В Р’ВµР В РІвЂћвЂ“ Р В Р’В·Р В Р’В° Р В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р РЋРІР‚в„–.', tags: ['RTS', 'RPG', 'Strategy'], similarity: '85%', peakCCU: '9500', developer: 'Grimlore Games', publisherClass: 'AA', estimatedRevenue: '250$-400$', publisher: 'THQ Nordic', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Singleplayer'], mechanics: ['Base Building', 'Faction Politics'], pros: ['Lore', 'Scale'], cons: ['Complex Systems'] },
            { id: 7, title: 'AI War 2', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/573410/header.jpg', positiveReviewPercent: '93%', reviewCount: '6K', revenue: '$1.6M', downloads: '140K', releaseDate: 'Feb 18, 2025', price: '$19.99', description: 'Р В РІР‚СљР В Р’В»Р РЋРЎвЂњР В Р’В±Р В РЎвЂўР В РЎвЂќР В Р’В°Р РЋР РЏ Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂР РЋР РЏ, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РўвЂР РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™ Р РЋР РЉР В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂўР В РЎВР В РЎвЂР В РЎвЂќР В РЎвЂ Р РЋРЎвЂњР РЋР С“Р В РЎвЂР В Р’В»Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р В РЎвЂ“Р В Р’В»Р В РЎвЂўР В Р’В±Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРЎвЂњР РЋР вЂ№ Р РЋРЎвЂњР В РЎвЂ“Р РЋР вЂљР В РЎвЂўР В Р’В·Р РЋРЎвЂњ, Р В Р’В·Р В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР РЋР РЏ Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎВР В Р’ВµР В Р’В¶Р В РўвЂР РЋРЎвЂњ Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР В Р’ВµР В РЎВ Р В РЎвЂ Р В Р вЂ Р РЋРІР‚в„–Р В Р’В¶Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’ВµР В РЎВ.', tags: ['RTS', 'Grand Strategy', 'Indie'], similarity: '84%', peakCCU: '2 400', developer: 'Arcen Games', publisherClass: 'Indie', estimatedRevenue: '120$-200$', publisher: 'Arcen Games', genres: ['RTS', 'Strategy'], categories: ['Singleplayer', 'Co-op'], mechanics: ['Risk-Reward Systems', 'Shared Threat'], pros: ['Depth'], cons: ['Visual Simplicity'] },
            { id: 8, title: 'The Fertile Crescent', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1674820/header.jpg', positiveReviewPercent: '81%', reviewCount: '1.2K', revenue: '$210K', downloads: '40K', releaseDate: '20.01.2023', price: '$14.99', description: 'RTS Р В РЎвЂ”Р РЋР вЂљР В РЎвЂў Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™ Р В РЎвЂ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р’В·Р В Р’ВµР В РЎВР В Р’В»Р РЋРІР‚ВР В РІвЂћвЂ“ Р В РЎвЂ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р’В°Р В РЎВР В РЎвЂ Р В Р вЂ¦Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР РЋР РЏР В РЎВР РЋРЎвЂњР РЋР вЂ№ Р В Р вЂ Р В Р’В»Р В РЎвЂР РЋР РЏР В Р’ВµР РЋРІР‚С™ Р В Р вЂ¦Р В Р’В° Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР В Р’Вµ Р РЋРІР‚В Р В РЎвЂР В Р вЂ Р В РЎвЂР В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ.', tags: ['RTS', 'Strategy', 'Simulation'], similarity: '83%', peakCCU: '900', developer: 'Jonas Tyroller', publisherClass: 'Indie', estimatedRevenue: '60$-90$', publisher: 'Indie', genres: ['RTS', 'Simulation'], categories: ['Singleplayer'], mechanics: ['Growth Systems', 'Land Optimization'], pros: ['Original Theme'], cons: ['Low Action'] },
            { id: 9, title: 'Age of Darkness: Final Stand', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1426450/header.jpg', positiveReviewPercent: '82%', reviewCount: '11K', revenue: '$2.2M', downloads: '300K', releaseDate: '07.10.2021', price: '$24.99', description: 'RTS Р В Р вЂ¦Р В Р’В° Р В Р вЂ Р РЋРІР‚в„–Р В Р’В¶Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ, Р В РЎвЂ“Р В РўвЂР В Р’Вµ Р РЋР РЉР В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂўР В РЎВР В РЎвЂР В РЎвЂќР В Р’В° Р В РЎвЂ Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™ Р В Р’В°Р РЋР вЂљР В РЎВР В РЎвЂР В РЎвЂ Р В Р’В¶Р РЋРІР‚ВР РЋР С“Р РЋРІР‚С™Р В РЎвЂќР В РЎвЂў Р В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р РЋРІР‚в„– Р В РўвЂР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™Р В РЎвЂўР В РЎВ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В РЎвЂўР В Р вЂ .', tags: ['RTS', 'Survival', 'Strategy'], similarity: '82%', peakCCU: '6 500', developer: 'PlaySide', publisherClass: 'AA', estimatedRevenue: '200$-300$', publisher: 'Team17', genres: ['RTS', 'Strategy'], categories: ['Singleplayer'], mechanics: ['Scarcity Pressure', 'Base Defense'], pros: ['Visual Style'], cons: ['Limited Diplomacy'] },
            { id: 10, title: 'Dune: Spice Wars', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1605220/header.jpg', positiveReviewPercent: '88%', reviewCount: '18K', revenue: '$4.1M', downloads: '550K', releaseDate: '26.04.2022', price: '$29.99', description: '4X-RTS Р РЋР С“ Р РЋР С“Р В РЎвЂР В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В РЎВ Р В Р’В°Р В РЎвЂќР РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р В РЎвЂўР В РЎВ Р В Р вЂ¦Р В Р’В° Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В РЎвЂР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В РЎвЂР В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР РЋРІвЂљВ¬Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ, Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р’В»Р РЋР Р‰ Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР В РЎвЂ Р В РЎвЂ Р В РўвЂР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ Р В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’ВµР В Р вЂ Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“Р В Р’В°.', tags: ['RTS', '4X', 'Strategy'], similarity: '90%', peakCCU: '14 000', developer: 'Shiro Games', publisherClass: 'AA', estimatedRevenue: '300$-450$', publisher: 'Funcom', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Singleplayer'], mechanics: ['Political Systems', 'Shared Resources', 'Faction Asymmetry'], pros: ['Politics', 'Strategic Variety'], cons: ['Long Matches'] }
        ]
    },
    en: {
        metrics: { found: 186, revenue: '$3.2m', medianRevenue: '$85K', avgRevenue: '$92K', avgPrice: '$14' },
        list: [
            { "id": 1170980, "title": "A Planet of Mine", "image": "https://cdn.akamai.steamstatic.com/steam/apps/1170980/header.jpg?t=1627286770", "positiveReviewPercent": "78%", "reviewCount": "1K", "revenue": "$9.9K", "downloads": "1", "releaseDate": "07.03.2020", "price": "$8.99", "description": "A minimalist procedural 4X strategy where the player starts from a single unique planet, manages scarce resources, develops technologies, and expands influence across a system by balancing growth, trade, and military dominance. A minimalist procedural 4X strategy where the player starts from a single unique planet, manages scarce resources, develops technologies, and expands influence across a system by balancing growth, trade, and military dominance. A minimalist procedural 4X strategy where the player starts from a single unique planet, manages scarce resources, develops technologies, and expands influence across a system A minimalist procedural 4X strategy where the player starts from a single unique planet, manages scarce resources, develops technologies, and expands influence across a system by balancing growth, trade, and military dominance. A minimalist procedural 4X strategy where the player starts from a single unique planet, manages scarce resources, develops technologies, and expands influence across a system by balancing growth, trade, and military dominance. A minimalist procedural 4X strategy where the player starts from a single unique planet, manages scarce resources, develops technologies, and expands influence across a system by balancing growth, trade, and military dominance. by balancing growth, trade, and military dominance.", "tags": ["Building","Base-Building","Colony Sim","Minimalist","4X","Simulation","Resource Management","Mining","Strategy","Space","Sandbox","God Game","Trading","Science","Procedural Generation","Indie","Automation","2D","Retro","Singleplayer"], "similarity": "85%", "peakCCU": "10K", "developer": "Tuesday Quest", "publisherClass": "Indie", "estimatedRevenue": "$3.0K", "publisher": "Tuesday Quest", "genres": ["Indie","Simulation","Strategy"], "categories": ["Single-player","Steam Achievements","Captions available","Steam Cloud"], "mechanics": [], "pros": [], "cons": [] },
            { id: 2, title: 'Northgard', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/466560/header.jpg', positiveReviewPercent: '89%', reviewCount: '45K', revenue: '$6.5M', downloads: '1M', releaseDate: '07.03.2018', price: '$29.99', description: 'An RTS about clan expansion where the same resources are shared between economy, military, and territorial growth, creating constant scarcity.', tags: ['RTS', '4X', 'Strategy'], similarity: '94%', peakCCU: '18 000', developer: 'Shiro Games', publisherClass: 'AA', estimatedRevenue: '300$-450$', publisher: 'Shiro Games', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Singleplayer'], mechanics: ['Shared Resources', 'Territory Expansion', 'Economy Management'], pros: ['Atmosphere', 'Strategic Depth'], cons: ['Slow Early Game'] },
            { id: 3, title: 'Offworld Trading Company', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271240/header.jpg', positiveReviewPercent: '84%', reviewCount: '9K', revenue: '$900K', downloads: '180K', releaseDate: '28.04.2016', price: '$29.99', description: 'An economic RTS where players fight for territory and resources through markets, shortages, and aggressive economic warfare.', tags: ['RTS', 'Economy', 'Strategy'], similarity: '91%', peakCCU: '3 100', developer: 'Mohawk Games', publisherClass: 'Indie', estimatedRevenue: '120$-200$', publisher: 'Stardock', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Competitive'], mechanics: ['Resource Scarcity', 'Market Control', 'Economic Warfare'], pros: ['Unique Focus', 'High Replayability'], cons: ['Steep Learning Curve'] },
            { id: 4, title: 'Grey Goo', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/290790/header.jpg', positiveReviewPercent: '76%', reviewCount: '7K', revenue: '$1.4M', downloads: '260K', releaseDate: '23.01.2015', price: '$29.99', description: 'A classic RTS with highly asymmetric factions, one of which is fully built around resource redistribution mechanics.', tags: ['RTS', 'Sci-Fi', 'Strategy'], similarity: '88%', peakCCU: '5 000', developer: 'Petroglyph', publisherClass: 'AA', estimatedRevenue: '200$-300$', publisher: 'Grey Box', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Singleplayer'], mechanics: ['Asymmetric Factions', 'Resource Conversion'], pros: ['Faction Design'], cons: ['Weak Multiplayer Meta'] },
            { id: 5, title: 'Warparty', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/777770/header.jpg', positiveReviewPercent: '73%', reviewCount: '3K', revenue: '$420K', downloads: '90K', releaseDate: '28.03.2019', price: '$19.99', description: 'A primal-themed RTS focused on territory control and constant pressure from limited resources.', tags: ['RTS', 'Strategy', 'Indie'], similarity: '86%', peakCCU: '1 800', developer: 'Crazy Monkey Studios', publisherClass: 'Indie', estimatedRevenue: '80$-120$', publisher: 'Warpzone Studios', genres: ['RTS', 'Strategy'], categories: ['Multiplayer'], mechanics: ['Territory Control', 'Unit Production'], pros: ['Classic RTS Feel'], cons: ['Low Innovation'] },
            { id: 6, title: 'SpellForce 3', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/311290/header.jpg', positiveReviewPercent: '79%', reviewCount: '14K', revenue: '$3.8M', downloads: '600K', releaseDate: '07.12.2017', price: '$39.99', description: 'An RTS with RPG elements featuring faction politics and competition over limited resources.', tags: ['RTS', 'RPG', 'Strategy'], similarity: '85%', peakCCU: '9 500', developer: 'Grimlore Games', publisherClass: 'AA', estimatedRevenue: '250$-400$', publisher: 'THQ Nordic', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Singleplayer'], mechanics: ['Base Building', 'Faction Politics'], pros: ['Lore', 'Scale'], cons: ['Complex Systems'] },
            { id: 7, title: 'AI War 2', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/573410/header.jpg', positiveReviewPercent: '93%', reviewCount: '6K', revenue: '$1.6M', downloads: '140K', releaseDate: '07.10.2019', price: '$19.99', description: 'A deep RTS where every economic expansion increases a global threat, forcing constant trade-offs between growth and survival.', tags: ['RTS', 'Grand Strategy', 'Indie'], similarity: '84%', peakCCU: '2 400', developer: 'Arcen Games', publisherClass: 'Indie', estimatedRevenue: '120$-200$', publisher: 'Arcen Games', genres: ['RTS', 'Strategy'], categories: ['Singleplayer', 'Co-op'], mechanics: ['Risk-Reward Systems', 'Shared Threat'], pros: ['Depth'], cons: ['Visual Simplicity'] },
            { id: 8, title: 'The Fertile Crescent', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1674820/header.jpg', positiveReviewPercent: '81%', reviewCount: '1.2K', revenue: '$210K', downloads: '40K', releaseDate: '20.01.2023', price: '$14.99', description: 'A growth-focused RTS where land management and resource optimization directly affect civilization development.', tags: ['RTS', 'Strategy', 'Simulation'], similarity: '83%', peakCCU: '900', developer: 'Jonas Tyroller', publisherClass: 'Indie', estimatedRevenue: '60$-90$', publisher: 'Indie', genres: ['RTS', 'Simulation'], categories: ['Singleplayer'], mechanics: ['Growth Systems', 'Land Optimization'], pros: ['Original Theme'], cons: ['Low Action'] },
            { id: 9, title: 'Age of Darkness: Final Stand', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1426450/header.jpg', positiveReviewPercent: '82%', reviewCount: '11K', revenue: '$2.2M', downloads: '300K', releaseDate: '07.10.2021', price: '$24.99', description: 'A survival RTS where economy and army growth are tightly constrained by resource scarcity.', tags: ['RTS', 'Survival', 'Strategy'], similarity: '82%', peakCCU: '6 500', developer: 'PlaySide', publisherClass: 'AA', estimatedRevenue: '200$-300$', publisher: 'Team17', genres: ['RTS', 'Strategy'], categories: ['Singleplayer'], mechanics: ['Scarcity Pressure', 'Base Defense'], pros: ['Visual Style'], cons: ['Limited Diplomacy'] },
            { id: 10, title: 'Dune: Spice Wars', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1605220/header.jpg', positiveReviewPercent: '88%', reviewCount: '18K', revenue: '$4.1M', downloads: '550K', releaseDate: '26.04.2022', price: '$29.99', description: 'A 4X-RTS with a strong focus on political relationships, territory control, and extreme scarcity of a key shared resource.', tags: ['RTS', '4X', 'Strategy'], similarity: '90%', peakCCU: '14 000', developer: 'Shiro Games', publisherClass: 'AA', estimatedRevenue: '300$-450$', publisher: 'Funcom', genres: ['RTS', 'Strategy'], categories: ['Multiplayer', 'Singleplayer'], mechanics: ['Political Systems', 'Shared Resources', 'Faction Asymmetry'], pros: ['Politics', 'Strategic Variety'], cons: ['Long Matches'] }
        ]
    }
};



const CompetitorMetricCard = ({ label, value }) => (
    <div 
        className="flex flex-col p-4 gap-2 rounded-[20px] flex-grow min-w-[180px] bg-[#191D28]"
        // flex-1 Р В Р вЂ¦Р В Р’В°Р В РўвЂР В РЎвЂў Р РЋР С“Р В РўвЂР В Р’ВµР В Р’В»Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р В РЎвЂўР В РўвЂР В РЎвЂР В Р вЂ¦Р В Р’В°Р В РЎвЂќР В РЎвЂўР В Р вЂ Р В РЎвЂў Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІР‚С™Р РЋР РЏР В РЎвЂ“Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’В»Р В РЎвЂР РЋР С“Р РЋР Р‰
    >
        <span className="text-[#BABBBF] text-base font-normal leading-[150%] font-['Onest']">{label}</span>
        <span className="text-white text-2xl font-semibold leading-[120%] opacity-90 font-['Onest']">{value}</span>
    </div>
);

const Checkbox = ({ checked, onChange, label }) => (
    <div className="flex items-center gap-1 cursor-pointer" onClick={onChange}>
        {checked ? (
            <CheckSquare className="w-5 h-5 text-white" />
        ) : (
            <Square className="w-5 h-5 text-white" />
        )}
        <span className="text-white font-medium text-base">{label}</span>
    </div>
);

const CompetitorCard = ({ game, t, isExpanded, onToggleExpand, selectedCompare, selectedPitchPack, onToggleCompare, onTogglePitchPack }) => {
    const cardRef = useRef(null);

    const handleToggleExpand = () => {
        onToggleExpand(game.id);
        setTimeout(() => {
            if (cardRef.current) {
                cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100); // Increased delay for smooth transition
    };

    return (
        <div ref={cardRef} className={`group bg-[#191D28] rounded-[20px] flex flex-col transition-all duration-500 ease-in-out ${isExpanded ? 'col-span-full' : ''}`} style={{ scrollMarginTop: '94px' }}>
            {isExpanded ? (
                // Expanded Layout - Responsive
                <div className="flex flex-col lg:flex-row gap-5 p-0 w-full min-h-[541px]">
                    {/* Left Image Section */}
                    <div className="relative flex-shrink-0 w-full lg:w-[355px] min-h-[541px] overflow-hidden rounded-l-[20px]">
                        {/* Blurred Background */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center filter blur-[30px] opacity-50"
                            style={{ backgroundImage: `url(${game.image})` }}
                        />
                        {/* Normal Image */}
                        <div 
                            className="absolute bg-cover bg-center w-full h-2/5 lg:h-1/3 top-1/2 transform -translate-y-1/2"
                            style={{ backgroundImage: `url(${game.image})` }}
                        />
                        {/* Action Checkboxes */}
                        {/* <div className="absolute flex gap-3 left-4 bottom-[77px]">
                            <Checkbox checked={selectedCompare.includes(game.id)} onChange={() => onToggleCompare(game.id)} label={t('compCompare')} />
                            <Checkbox checked={selectedPitchPack.includes(game.id)} onChange={() => onTogglePitchPack(game.id)} label={t('compTrack')} />
                        </div> */}
                        {/* Collapse Button */}
                        <div 
                            className="absolute flex justify-center items-center h-11 left-4 right-4 bottom-4 bg-[#353842] hover:bg-[#555A6C] rounded-xl cursor-pointer transition-colors" 
                            onClick={handleToggleExpand}
                            style={{ width: 'calc(100% - 32px)' }}
                        >
                            <span className="text-white font-medium text-base text-center flex-1">{t('compCollapse')}</span>
                        </div>
                    </div>
                    {/* Right Content Section */}
                    <div className="flex flex-col justify-between p-6 gap-4 flex-grow min-h-[400px]">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex items-center gap-2 flex-grow min-w-0">
                                    <a href={`https://store.steampowered.com/app/${game.id}`} target="_blank" rel="noopener noreferrer" className="text-white font-semibold text-lg flex-grow hover:text-[#FFC132] transition-colors truncate">{game.title}</a>
                                    <Link
                                        to={`/info_game/${game.id}`}
                                        title={t('compDetails')}
                                        className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#1D332F] rounded-full px-3 py-1 flex items-center justify-center">
                                        <span className="text-[#3AD867] text-sm font-medium">{game.positiveReviewPercent} {t('positiveReviews').toLowerCase()}</span>
                                    </div>
                                    <div className="bg-[#353842] rounded-full px-3 py-1 flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">{game.reviewCount} {t('metricsReviews').toLowerCase()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {game.tags && game.tags.map(tag => (
                                    <span key={tag} className="text-xs text-white/85 bg-[#353842] px-2 py-1 rounded-md">{tag}</span>
                                ))}
                            </div>
                        </div>
                        {/* Divider */}
                        <div className="w-full h-[1px] bg-[#323640]" />
                        {/* Description - full width with truncation and tooltip */}
                        <div className="flex flex-col gap-1 w-full">
                            <span className="text-[#BABBBF] text-sm font-medium">{t('navDescription')}</span>
                            {(() => {
                                const maxLength = 300; // Р В РЎС™Р В Р’В°Р В РЎвЂќР РЋР С“Р В РЎвЂР В РЎВР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В РўвЂР В Р’В»Р В РЎвЂР В Р вЂ¦Р В Р’В°
                                const isLongDescription = game.description.length > maxLength;
                                return (
                                    <div className={`${isLongDescription ? 'max-h-[200px] overflow-y-auto custom-scrollbar' : ''} bg-[#1E2333]/30 rounded-lg p-3`}>
                                        <p className="text-white text-sm leading-relaxed">
                                            {game.description}
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>
                        {/* Metrics Grid */}
                        <div className="flex flex-col gap-4">
                            {/* First Row - 4 metrics */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compSimilarity')}</span>
                                    <span className="text-white text-sm font-medium">{game.similarity}</span>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compRelease')}</span>
                                    <span className="text-white text-sm font-medium">{game.releaseDate}</span>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compPeakCCU')}</span>
                                    <span className="text-white text-sm font-medium">{game.peakCCU}</span>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compPublisherClass')}</span>
                                    <span className="text-white text-sm font-medium">{game.publisherClass}</span>
                                </div>
                            </div>
                            
                            {/* Second Row - 4 metrics */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compCost')}</span>
                                    <span className="text-white text-sm font-medium">{game.price}</span>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compEstimatedRevenue')}</span>
                                    <span className="text-white text-sm font-medium">{game.estimatedRevenue}</span>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compPublisher')}</span>
                                    <span className="text-white text-sm font-medium">{game.publisher}</span>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compDeveloper')}</span>
                                    <span className="text-white text-sm font-medium">{game.developer}</span>
                                </div>
                            </div>
                        </div>
                        {/* Genres and Categories - two columns */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="text-white text-sm font-medium">{t('genresCom')}</span>
                                <div className="flex flex-wrap gap-1">
                                    {game.genres && game.genres.map(genre => (
                                        <span key={genre} className="text-xs text-white/85 bg-[#353842] px-2 py-1 rounded-md">{genre}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="text-white text-sm font-medium">{t('categoriesCom')}</span>
                                <div className="flex flex-wrap gap-1">
                                    {game.categories && game.categories.map(cat => (
                                        <span key={cat} className="text-xs text-white/85 bg-[#353842] px-2 py-1 rounded-md">{cat}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - closer spacing */}
                        {/* <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="text-white text-sm font-medium">{t('proCom')}</span>
                                <div className="flex flex-wrap gap-1">
                                    {game.pros && game.pros.map(pro => (
                                        <span key={pro} className="text-xs text-[#3AD867] bg-[#1D332F] px-2 py-1 rounded-md">{pro}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="text-white text-sm font-medium">{t('conCom')}</span>
                                <div className="flex flex-wrap gap-1">
                                    {game.cons && game.cons.map(con => (
                                        <span key={con} className="text-xs text-[#D23D3D] bg-[#2F202A] px-2 py-1 rounded-md">{con}</span>
                                    ))}
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            ) : (
                // Collapsed Layout
                <>
                    {/* Image & Overlay Area */}
                    <div className={`relative w-full ${isExpanded ? 'h-[300px]' : 'h-[166px]'} shrink-0 overflow-hidden ${!isExpanded ? 'rounded-t-[20px]' : ''}`}>
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${game.image})` }}
                        />
                        {!isExpanded && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-transparent pointer-events-none" />
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            </>
                        )}

                        {/* Normal Image */}
                        <div 
                            className="absolute w-full h-[166px] left-0 bg-cover bg-center"
                            style={{ 
                                backgroundImage: `url(${game.image})`,
                                top: 'calc(50% - 83px)'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        
                        {/* Actions Overlay */}
                        {/* <div className="absolute bottom-4 left-4 flex gap-3 z-10">
                            <Checkbox checked={selectedCompare.includes(game.id)} onChange={() => onToggleCompare(game.id)} label={t('compCompare')} />
                            <Checkbox checked={selectedPitchPack.includes(game.id)} onChange={() => onTogglePitchPack(game.id)} label={t('compTrack')} />
                        </div> */}
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex flex-col gap-5 flex-1">
                        {/* Header: Title & Badges */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <a href={`https://store.steampowered.com/app/${game.id}`} target="_blank" rel="noopener noreferrer" className="text-white font-semibold text-lg hover:text-[#FF7549] transition-colors inline-block flex-grow min-w-0 truncate">{game.title}</a>
                                <Link
                                    to={`/info_game/${game.id}`}
                                    title={t('compDetails')}
                                    className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Eye className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-[#1D332F] rounded-full px-3 py-1 flex items-center justify-center">
                                    <span className="text-[#3AD867] text-sm font-medium">{game.positiveReviewPercent} {t('positiveReviews').toLowerCase()}</span>
                                </div>
                                <div className="bg-[#353842] rounded-full px-3 py-1 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{game.reviewCount} {t('metricsReviews').toLowerCase()}</span>
                                </div>
                            </div>
                        </div>

                         <div className="h-[1px] bg-[#323640] w-full" />

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* First Column */}
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compSimilarity')}</span>
                                    <span className="text-white text-sm font-medium">{game.similarity}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compRelease')}</span>
                                    <span className="text-white text-sm font-medium">{game.releaseDate}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compPeakCCU')}</span>
                                    <span className="text-white text-sm font-medium">{game.peakCCU}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compDeveloper')}</span>
                                    <span className="text-white text-sm font-medium">{game.developer}</span>
                                </div>
                            </div>
                            {/* Second Column */}
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compPublisherClass')}</span>
                                    <span className="text-white text-sm font-medium">{game.publisherClass}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compCost')}</span>
                                    <span className="text-white text-sm font-medium">{game.price}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compEstimatedRevenue')}</span>
                                    <span className="text-white text-sm font-medium">{game.estimatedRevenue}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#BABBBF] text-sm font-medium">{t('compPublisher')}</span>
                                    <span className="text-white text-sm font-medium">{game.publisher}</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Button - always at bottom */}
                        <button 
                            onClick={handleToggleExpand}
                            className="mt-auto w-full bg-[#353842] hover:bg-[#555A6C] rounded-xl h-11 flex items-center justify-center transition-colors text-white text-base font-medium"
                        >
                            {isExpanded ? t('compCollapse') : t('compDetails')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};



// Р В РЎв„ўР В РЎвЂўР В РЎВР В РЎвЂ”Р В РЎвЂўР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™ Р В РўвЂР В Р’В»Р РЋР РЏ Р В Р вЂ Р РЋРІР‚в„–Р В РЎвЂ”Р В Р’В°Р В РўвЂР В Р’В°Р РЋР вЂ№Р РЋРІР‚В°Р В Р’ВµР В РЎвЂ“Р В РЎвЂў Р В РЎВР В Р’ВµР В Р вЂ¦Р РЋР вЂ№ Р РЋР С“Р В РЎвЂўР РЋР вЂљР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В РЎвЂќР В РЎвЂ
const SortDropdown = ({ isOpen, setIsOpen, sortOption, setSortOption, t }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    const sortOptions = [
        { value: 'reviewsDesc', label: t('compSortMoreReviews') || 'More Reviews' },
        { value: 'reviewsAsc', label: t('compSortLessReviews') || 'Less Reviews' },
        { value: 'priceDesc', label: t('compSortExpensive') || 'More Expensive' },
        { value: 'priceAsc', label: t('compSortCheaper') || 'Cheaper' },
    ];

    return (
        <div ref={dropdownRef} className="relative">
            {/* Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-2 gap-1.5 w-[168px] h-9 bg-[#191D28] rounded-[12px] hover:bg-[#1f2634] transition-colors"
            >
                <span className="text-white font-['Onest'] font-medium text-sm leading-[18px] flex-1 text-left truncate">
                    {sortOptions.find(opt => opt.value === sortOption)?.label}
                </span>
                <ChevronDown size={20} className="text-white flex-shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-[#191D28] border border-[#323640] rounded-[12px] shadow-[0px_0px_32px_rgba(10,15,24,0.8)] z-10">
                    {sortOptions.map((option, index) => (
                        <label
                            key={option.value}
                            className={`flex items-center px-2 py-2 gap-2 h-9 cursor-pointer hover:bg-[#353842] transition-colors`}
                        >
                            <div className="relative w-5 h-5 flex items-center justify-center">
                                {sortOption === option.value ? (
                                    <>
                                        <div className="absolute w-5 h-5 rounded-full border-2 border-[#FFC132]" />
                                        <div className="w-3 h-3 rounded-full bg-[#FFC132]" />
                                    </>
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-[#555d6f]" />
                                )}
                            </div>
                            <span className="text-white font-['Onest'] font-medium text-sm leading-[18px] flex-1">
                                {option.label}
                            </span>
                            <input
                                type="radio"
                                name="sort"
                                value={option.value}
                                checked={sortOption === option.value}
                                onChange={() => {
                                    setSortOption(option.value);
                                    setIsOpen(false);
                                }}
                                className="hidden"
                            />
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const CompetitorsSection = ({ t, ideaDescription, tags = [], uiLanguage, onDataUpdate, competitorData = null, isLoading = false, sortOption = 'reviewsDesc', hasFilter = false }) => {
    const [data, setData] = useState(competitorData);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [selectedCompare, setSelectedCompare] = useState([]);
    const [selectedPitchPack, setSelectedPitchPack] = useState([]);

    // Use competitorData from props when available (data flows from parent)
    useEffect(() => {
        if (competitorData) {
            setData(competitorData);
        }
    }, [competitorData]);

    // Р В Р’В¤Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋР С“Р В РЎвЂўР РЋР вЂљР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В РЎвЂќР В РЎвЂ
    const getSortedList = (list) => {
        if (!list) return [];
        
        const sorted = [...list];

        const parseCompactNumber = (value) => {
            if (!value || value === '-') return 0;
            const raw = value.toString().trim().toUpperCase().replace(',', '.');
            const suffix = raw.match(/[KMB]$/)?.[0] || '';
            const numeric = parseFloat(raw.replace(/[^\d.]/g, ''));
            if (Number.isNaN(numeric)) return 0;
            if (suffix === 'K') return numeric * 1_000;
            if (suffix === 'M') return numeric * 1_000_000;
            if (suffix === 'B') return numeric * 1_000_000_000;
            return numeric;
        };
        
        // Р В Р’ВР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р РЋРЎвЂњР В Р’ВµР В РЎВ sortOption Р В РЎвЂР В Р’В· props, Р В РЎвЂР В Р’В»Р В РЎвЂ Р В РЎвЂ”Р В РЎвЂў Р РЋРЎвЂњР В РЎВР В РЎвЂўР В Р’В»Р РЋРІР‚РЋР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№ 'reviewsDesc' (Р В Р’В±Р В РЎвЂўР В Р’В»Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В РЎвЂўР В Р вЂ )
        const currentSort = sortOption || 'reviewsDesc';
        
        switch (currentSort) {
            case 'reviewsDesc': {
                // Р В РІР‚ВР В РЎвЂўР В Р’В»Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В РЎвЂўР В Р вЂ  (Р В РЎвЂ”Р В РЎвЂў Р РЋРЎвЂњР В Р’В±Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№)
                return sorted.sort((a, b) => {
                    const aCount = parseCompactNumber(a.reviewCount);
                    const bCount = parseCompactNumber(b.reviewCount);
                    return bCount - aCount;
                });
            }
            case 'reviewsAsc': {
                // Р В РЎС™Р В Р’ВµР В Р вЂ¦Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В РЎвЂўР В Р вЂ  (Р В РЎвЂ”Р В РЎвЂў Р В Р вЂ Р В РЎвЂўР В Р’В·Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№)
                return sorted.sort((a, b) => {
                    const aCount = parseCompactNumber(a.reviewCount);
                    const bCount = parseCompactNumber(b.reviewCount);
                    return aCount - bCount;
                });
            }
            case 'priceDesc': {
                // Р В РІР‚СњР В РЎвЂўР РЋР вЂљР В РЎвЂўР В Р’В¶Р В Р’Вµ (Р В РЎвЂ”Р В РЎвЂў Р РЋРЎвЂњР В Р’В±Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№)
                return sorted.sort((a, b) => {
                    const aPrice = parseCompactNumber(a.price);
                    const bPrice = parseCompactNumber(b.price);
                    return bPrice - aPrice;
                });
            }
            case 'priceAsc': {
                // Р В РІР‚СњР В Р’ВµР РЋРІвЂљВ¬Р В Р’ВµР В Р вЂ Р В Р’В»Р В Р’Вµ (Р В РЎвЂ”Р В РЎвЂў Р В Р вЂ Р В РЎвЂўР В Р’В·Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№)
                return sorted.sort((a, b) => {
                    const aPrice = parseCompactNumber(a.price);
                    const bPrice = parseCompactNumber(b.price);
                    return aPrice - bPrice;
                });
            }
            default:
                // Р В РЎСџР В РЎвЂў Р РЋРЎвЂњР В РЎВР В РЎвЂўР В Р’В»Р РЋРІР‚РЋР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№ - Р В Р’В±Р В РЎвЂўР В Р’В»Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В РЎвЂўР В Р вЂ  (reviewsDesc)
                return sorted.sort((a, b) => {
                    const aCount = parseCompactNumber(a.reviewCount);
                    const bCount = parseCompactNumber(b.reviewCount);
                    return bCount - aCount;
                });
        }
    };

    const sortedList = useMemo(() => {
        return getSortedList(data?.list);
    }, [data?.list, sortOption]);

    // Р В РЎвЂєР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚РЋР В РЎвЂР В РЎвЂќР В РЎвЂ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В Р’ВµР В РЎвЂќ Р В РЎвЂ Р В Р вЂ Р РЋРІР‚в„–Р В Р’В±Р В РЎвЂўР РЋР вЂљР В Р’В°
    const handleToggleExpand = (id) => {
        setExpandedCardId(prev => prev === id ? null : id);
    };

    const toggleCompare = (id) => {
        setSelectedCompare(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const togglePitchPack = (id) => {
        setSelectedPitchPack(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    if (isLoading) {
        return <SimpleLoader t={t} />;
    }

    // Р В РЎСџР В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р В РЎвЂўР В РЎвЂўР В Р’В±Р РЋРІР‚В°Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ, Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                <div className="w-24 h-24 bg-[#FF5620]/10 rounded-full flex items-center justify-center mb-4">
                    <InlineIcon svg={iconNavCompetitors} color="#FF5620" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{t('noIdeaDescription')}</h2>
                <p className="text-white/70 text-lg max-w-2xl mb-4">{t('noIdeaDescriptionHint')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start px-4 md:px-8 pb-12 gap-10 w-full max-w-[1400px] mx-auto">
            {/* Top Metrics Row */}
            <div id="metrics" className="flex flex-wrap gap-4 w-full scroll-mt-24">
                {/* <CompetitorMetricCard label={t('compFound')} value={data?.metrics?.found} /> */}
                <CompetitorMetricCard label={t('compRevenue')} value={data?.metrics?.revenue} />
                <CompetitorMetricCard label={t('compMedianRev')} value={data?.metrics?.medianRevenue} />
                <CompetitorMetricCard label={t('compAvgRev')} value={data?.metrics?.avgRevenue} />
                <CompetitorMetricCard label={t('compAvgPrice')} value={data?.metrics?.avgPrice} />
            </div>

            {/* Competitors Grid */}
            <div id="competitors" className="w-full mt-4 scroll-mt-24">
                <h2 className="text-white text-2xl font-semibold mb-6">{t('nearestCompetitors')}</h2>
                
                {/* Empty State - No Results After Filter */}
                {hasFilter && sortedList && sortedList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 bg-[#1E2333]/50 rounded-xl">
                        <div className="w-20 h-20 bg-[#FF5620]/10 rounded-full flex items-center justify-center mb-4">
                            <InlineIcon svg={iconNavCompetitors} color="#FF5620" size={40} />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">{t('noCompetitorsFound')}</h3>
                        <p className="text-white/70 text-center max-w-md mb-4">{t('noCompetitorsFoundDescription')}</p>
                        <p className="text-[#FFC132]/80 text-sm">{t('adjustFilterCriteria')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                         {sortedList?.map(game => (
                             <CompetitorCard 
                                key={game.id} 
                                game={game} 
                                t={t} 
                                isExpanded={expandedCardId === game.id}
                                onToggleExpand={handleToggleExpand}
                                selectedCompare={selectedCompare}
                                selectedPitchPack={selectedPitchPack}
                                onToggleCompare={toggleCompare}
                                onTogglePitchPack={togglePitchPack}
                             />
                         ))}
                     </div>
                )}
            </div>

            {/* Comparison Subsection
            <div id="comparison" className="w-full mt-8 scroll-mt-24">
                <h2 className="text-white text-2xl font-semibold mb-6">{t('compCompareSection')}</h2>
                <button 
                    onClick={() => alert('Р В РІР‚в„ў Р РЋР вЂљР В Р’В°Р В Р’В·Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР В Р’Вµ')} 
                    className="w-auto px-8 py-4 gg-gradient-btn text-white font-bold rounded-xl transition"
                >
                    {t('compCompareButton')}
                </button>
            </div> */}
        </div>
    );
};

// Pitch Pack
const PitchPackSection = ({ t, marketData, competitorsData, ideaData, formState, uiLanguage, onAuthRequired }) => {
    const [selectedSections, setSelectedSections] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const handleSectionChange = (section) => {
        if (selectedSections.includes(section)) {
            setSelectedSections(prev => prev.filter(s => s !== section));
        } else {
            setSelectedSections(prev => [...prev, section]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedSections([]);
            setSelectAll(false);
        } else {
            setSelectedSections(['market', 'competitors', 'idea']);
            setSelectAll(true);
        }
    };

    const handleDownload = async () => {
        if (selectedSections.length === 0 && !selectAll) {
            alert(t('selectAtLeastOneSection'));
            return;
        }
        
        // Р В Р Р‹Р В РЎвЂўР В Р’В±Р В РЎвЂР РЋР вЂљР В Р’В°Р В Р’ВµР В РЎВ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋР РЉР В РЎвЂќР РЋР С“Р В РЎвЂ”Р В РЎвЂўР РЋР вЂљР РЋРІР‚С™Р В Р’В°, Р В РЎвЂР РЋР С“Р В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’В°Р РЋР РЏ Р В Р вЂ¦Р В Р’ВµР В РЎвЂўР РЋРІР‚С™Р В РЎВР В Р’ВµР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р РЋР вЂљР В Р’В°Р В Р’В·Р В РўвЂР В Р’ВµР В Р’В»Р РЋРІР‚в„–
        const exportData = {};
        
        // Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р РЋР РЏР В Р’В·Р РЋРІР‚в„–Р В РЎвЂќР В РЎвЂўР В Р вЂ Р РЋРЎвЂњР РЋР вЂ№ Р В РЎВР В Р’ВµР РЋРІР‚С™Р В РЎвЂќР РЋРЎвЂњ
        exportData.docLanguage = uiLanguage;
        
        // Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р РЋР С“Р В РЎвЂќР В РЎвЂР В Р’Вµ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В РЎвЂР В Р’В· Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР РЋРІР‚в„–
        if (formState) {
            exportData.userDescr = {
                ideaDescription: formState.ideaDescription || '',
                genres: formState.genres || formState.genre || [],
                tags: formState.tags || [],
                categories: formState.categories || [],
                languages: formState.languages || formState.language || []
            };
        }
        
        // Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р РЋР вЂљР РЋРІР‚в„–Р В Р вЂ¦Р В РЎвЂўР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В Р’В°Р В Р вЂ¦Р В Р’В°Р В Р’В»Р В РЎвЂР В Р’В· Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂўР РЋРІР‚С™Р В РЎВР В Р’ВµР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂў
        if (selectAll || selectedSections.includes('market')) {
            if (marketData) {
                exportData.marketAnalysis = marketData;
            }
        }
        
        // Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂќР РЋРЎвЂњР РЋР вЂљР В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р В РЎвЂўР В Р вЂ  Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂўР РЋРІР‚С™Р В РЎВР В Р’ВµР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂў
        if (selectAll || selectedSections.includes('competitors')) {
            if (competitorsData) {
                exportData.competitors = competitorsData;
            }
        }
        
        // Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В Р’В°Р В Р вЂ¦Р В Р’В°Р В Р’В»Р В РЎвЂР В Р’В· Р В РЎвЂР В РўвЂР В Р’ВµР В РЎвЂ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂўР РЋРІР‚С™Р В РЎВР В Р’ВµР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂў
        if (selectAll || selectedSections.includes('idea')) {
            if (ideaData) {
                exportData.idea_analysis = ideaData;
            }
        }
        
        try {
            const response = await apiRequest('/pitch-pack', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exportData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Р В РЎСџР В РЎвЂўР В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР В Р’В°Р В Р’ВµР В РЎВ HTML Р РЋРІР‚С›Р В Р’В°Р В РІвЂћвЂ“Р В Р’В» Р В РЎвЂ Р РЋР С“Р В РЎвЂќР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В Р’ВµР В РЎвЂ“Р В РЎвЂў
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pitch-deck.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading pitch deck:', error);
            if (error?.code === 'UNAUTHORIZED' && onAuthRequired) {
                onAuthRequired();
                return;
            }
            alert(t('errorDownloadingPitchDeck') || 'Error downloading pitch deck');
        }
    };

    return (
        <div className="flex flex-col items-start px-4 md:px-8 pb-12 gap-10 w-full max-w-[1400px] mx-auto">
            <div className="w-full flex justify-center">
                <div className="bg-[#191D28] rounded-2xl p-8 w-full max-w-md space-y-6">
                    <h3 className="text-xl font-semibold text-white">{t('selectSectionsForReport')}</h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer text-white/90">
                            <div className={`w-5 h-5 rounded border border-[#323640] flex items-center justify-center transition ${selectAll ? 'opacity-50 cursor-not-allowed' : ''} ${selectedSections.includes('market') || selectAll ? 'bg-[#FFC132]/20 border-[#FFC132]' : 'bg-transparent'}`}>
                                { (selectedSections.includes('market') || selectAll) && <Check className="w-4 h-4 text-[#FFC132]" /> }
                            </div>
                            <input 
                                type="checkbox" 
                                checked={selectedSections.includes('market') || selectAll} 
                                onChange={() => !selectAll && handleSectionChange('market')} 
                                disabled={selectAll} 
                                className="hidden" 
                            />
                            {t('sectionMarketAnalysis')}
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-white/90">
                            <div className={`w-5 h-5 rounded border border-[#323640] flex items-center justify-center transition ${selectAll ? 'opacity-50 cursor-not-allowed' : ''} ${selectedSections.includes('competitors') || selectAll ? 'bg-[#FFC132]/20 border-[#FFC132]' : 'bg-transparent'}`}>
                                { (selectedSections.includes('competitors') || selectAll) && <Check className="w-4 h-4 text-[#FFC132]" /> }
                            </div>
                            <input 
                                type="checkbox" 
                                checked={selectedSections.includes('competitors') || selectAll} 
                                onChange={() => !selectAll && handleSectionChange('competitors')} 
                                disabled={selectAll} 
                                className="hidden" 
                            />
                            {t('sectionCompetitors')}
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-white/90">
                            <div className={`w-5 h-5 rounded border border-[#323640] flex items-center justify-center transition ${selectAll ? 'opacity-50 cursor-not-allowed' : ''} ${selectedSections.includes('idea') || selectAll ? 'bg-[#FFC132]/20 border-[#FFC132]' : 'bg-transparent'}`}>
                                { (selectedSections.includes('idea') || selectAll) && <Check className="w-4 h-4 text-[#FFC132]" /> }
                            </div>
                            <input 
                                type="checkbox" 
                                checked={selectedSections.includes('idea') || selectAll} 
                                onChange={() => !selectAll && handleSectionChange('idea')} 
                                disabled={selectAll} 
                                className="hidden" 
                            />
                            {t('sectionIdeaAnalysis')}
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-white/90">
                            <div className={`w-5 h-5 rounded border border-[#323640] flex items-center justify-center transition ${selectAll ? 'bg-[#FFC132]/20 border-[#FFC132]' : 'bg-transparent'}`}>
                                { selectAll && <Check className="w-4 h-4 text-[#FFC132]" /> }
                            </div>
                            <input 
                                type="checkbox" 
                                checked={selectAll} 
                                onChange={handleSelectAll} 
                                className="hidden" 
                            />
                            {t('sectionAll')}
                        </label>
                    </div>
                    <button 
                        onClick={handleDownload} 
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl text-lg font-bold transition gg-gradient-btn text-white"
                    >
                        <Download className="w-6 h-6" />
                        <span>{t('downloadPitchDeck')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


// ... (IdeaForm remains unchanged) ...
const IdeaForm = ({
    t,
    formState,
    setFormState,
    onSubmit,
    onSaveAnalysis,
    showSaveAction = false,
    onAutofill,
    onClear,
    isFormValid,
    isLoading,
    isAutofilling,
    autoFillError,
    selectOptions,
    onValidationError,
}) => {
     const { ideaDescription, genre, tags, categories, language } = formState;
    const textareaRef = useRef(null);
    const historyRef = useRef([ideaDescription || '']);
    const historyIndexRef = useRef(0);
    const isApplyingHistoryRef = useRef(false);
    const isHistoryInitializedRef = useRef(false);
    const [historyMeta, setHistoryMeta] = useState({ canUndo: false, canRedo: false });
    const syncHistoryMeta = useCallback(() => {
        setHistoryMeta({
            canUndo: historyIndexRef.current > 0,
            canRedo: historyIndexRef.current < historyRef.current.length - 1,
        });
    }, []);
    const promptTemplates = useMemo(() => ([
        {
            id: 'template-core-loop',
            title: t('ideaTemplateCoreLoopTitle'),
            description: t('ideaTemplateCoreLoopDescription'),
            content: t('ideaTemplateCoreLoopContent'),
        },
        {
            id: 'template-multiplayer',
            title: t('ideaTemplateMultiplayerTitle'),
            description: t('ideaTemplateMultiplayerDescription'),
            content: t('ideaTemplateMultiplayerContent'),
        },
        {
            id: 'template-narrative',
            title: t('ideaTemplateNarrativeTitle'),
            description: t('ideaTemplateNarrativeDescription'),
            content: t('ideaTemplateNarrativeContent'),
        },
    ]), [t]);

    useEffect(() => {
        if (isHistoryInitializedRef.current) return;
        historyRef.current = [ideaDescription || ''];
        historyIndexRef.current = 0;
        isHistoryInitializedRef.current = true;
        syncHistoryMeta();
    }, [ideaDescription, syncHistoryMeta]);

    useEffect(() => {
        if (!isHistoryInitializedRef.current) return;

        if (isApplyingHistoryRef.current) {
            isApplyingHistoryRef.current = false;
            syncHistoryMeta();
            return;
        }

        const nextValue = ideaDescription || '';
        const currentValue = historyRef.current[historyIndexRef.current] || '';
        if (nextValue === currentValue) return;

        historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), nextValue];
        historyIndexRef.current = historyRef.current.length - 1;
        syncHistoryMeta();
    }, [ideaDescription, syncHistoryMeta]);

    const handleUndo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        isApplyingHistoryRef.current = true;
        setFormState('ideaDescription', historyRef.current[historyIndexRef.current] || '');
        syncHistoryMeta();
        textareaRef.current?.focus();
    }, [setFormState, syncHistoryMeta]);

    const handleRedo = useCallback(() => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        isApplyingHistoryRef.current = true;
        setFormState('ideaDescription', historyRef.current[historyIndexRef.current] || '');
        syncHistoryMeta();
        textareaRef.current?.focus();
    }, [setFormState, syncHistoryMeta]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Р В РІР‚в„ўР В Р’В°Р В Р’В»Р В РЎвЂР В РўвЂР В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ: Р В РЎвЂўР В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР РЋРІР‚в„–
        if (!ideaDescription || !ideaDescription.trim()) {
            onValidationError('ideaDescriptionRequired');
            return;
        }
        
        // Р В РІР‚в„ўР В Р’В°Р В Р’В»Р В РЎвЂР В РўвЂР В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ: Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂ
        if (!tags || tags.length === 0) {
            onValidationError('tagsRequired');
            return;
        }
        
        // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р вЂ Р В Р’В°Р В Р’В»Р В РЎвЂР В РўвЂР В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІвЂљВ¬Р В Р’В»Р В Р’В° - Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР РЋРЎвЂњ
        onSubmit(e);
    };

    const applyTemplate = (templateContent) => {
        setFormState('ideaDescription', templateContent);
    };

    const handleIdeaKeyDown = (e) => {
        const isMod = e.ctrlKey || e.metaKey;
        if (!isMod) return;

        const key = e.key.toLowerCase();
        const isUndoKey = key === 'z' || key === 'Р РЋР РЏ';
        const isRedoKey = key === 'y' || key === 'Р В Р вЂ¦';
        if (isUndoKey && !e.shiftKey) {
            e.preventDefault();
            handleUndo();
            return;
        }
        if (isRedoKey || (isUndoKey && e.shiftKey)) {
            e.preventDefault();
            handleRedo();
        }
    };
    
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 h-full flex flex-col pb-3">
            <div className="flex items-center gap-[7px] h-[72px]">
                <h1 className="text-[26px] leading-[120%] tracking-[-0.02em] font-medium text-white">{t('navDescription')}</h1>
                <div className="relative group">
                    <Info className="w-4 h-4 text-white/60 hover:text-white transition-colors cursor-help" />
                    <div className="pointer-events-none absolute left-0 top-[130%] z-50 hidden w-[420px] max-w-[calc(100vw-32px)] rounded-[12px] border border-[#323640] bg-[#2B2C37] p-3 text-[13px] leading-[18px] text-white shadow-[0_0_32px_rgba(10,15,24,0.8)] group-hover:block">
                        <p className="mb-1">{t('ideaPromptTooltipIntro')}</p>
                        <p>{t('ideaPromptTooltipGameplay')}</p>
                        <p>{t('ideaPromptTooltipStory')}</p>
                        <p>{t('ideaPromptTooltipVisual')}</p>
                        <p>{t('ideaPromptTooltipMonetization')}</p>
                        <p>{t('ideaPromptTooltipNiche')}</p>
                        <p>{t('ideaPromptTooltipInnovation')}</p>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="w-full flex-1 min-h-0">
                <div className="flex flex-col xl:flex-row items-stretch gap-4 w-full h-full min-h-0">
                    <section className="relative w-full xl:flex-1 bg-[#191D28] rounded-[20px] p-4 flex flex-col min-h-0">
                        <div className="flex flex-col gap-3 h-full min-h-0">
                            <div className="absolute right-4 top-4 flex flex-col items-center gap-2">
                                <button
                                    type="button"
                                    title={t('clearAllFieldsLabel')}
                                    onClick={(e) => { e.preventDefault(); onClear(); }}
                                    className="text-[#A7A8AC] hover:text-white transition-colors"
                                    aria-label={t('clearAllFieldsLabel')}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUndo}
                                    disabled={!historyMeta.canUndo}
                                    className="text-[#A7A8AC] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Undo"
                                    title="Undo (Ctrl/Cmd+Z)"
                                >
                                    <Undo2 className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRedo}
                                    disabled={!historyMeta.canRedo}
                                    className="text-[#A7A8AC] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Redo"
                                    title="Redo (Ctrl/Cmd+Y)"
                                >
                                    <Redo2 className="w-5 h-5" />
                                </button>
                            </div>
                            <textarea
                                ref={textareaRef}
                                id="idea"
                                onKeyDown={handleIdeaKeyDown}
                                className="w-full flex-1 min-h-[180px] overflow-y-auto custom-scrollbar bg-transparent text-white text-[16px] leading-[22px] resize-none focus:outline-none placeholder-[#A7A8AC] pr-10"
                                placeholder={t('ideaDetailedPlaceholder')}
                                value={ideaDescription}
                                onChange={(e) => setFormState('ideaDescription', e.target.value)}
                            />
                            {autoFillError && <p className="text-red-400 text-sm">{autoFillError}</p>}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {promptTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => applyTemplate(template.content)}
                                        className="h-auto min-h-[56px] md:min-h-[82px] rounded-[12px] bg-[#353842] p-2 md:p-3 text-left transition hover:bg-[#4A4F62]"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[12px] sm:text-[13px] md:text-[14px] leading-[15px] md:leading-[18px] tracking-[-0.01em] font-medium text-white">{template.title}</span>
                                            <span className="hidden md:block text-[14px] leading-[18px] tracking-[-0.01em] font-medium text-[#BABBBF]">{template.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                    <aside className="w-full xl:w-[356px] bg-[#191D28] rounded-[20px] flex flex-col xl:h-full min-h-0">
                        <div className="h-[52px] px-4 flex items-center border-b border-[#555A6C]">
                            <h3 className="text-[16px] leading-[20px] tracking-[-0.02em] font-medium text-white">{t('requiredParams')}</h3>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                            <MultiSelect label={t('genre')} options={selectOptions.genres} selected={genre} onChange={(val) => setFormState('genre', val)} onClear={() => setFormState('genre', [])} placeholder={t('selectGenres')} t={t} />
                            <MultiSelect label={t('language')} options={selectOptions.languages} selected={language} onChange={(val) => setFormState('language', val)} onClear={() => setFormState('language', [])} placeholder={t('selectLanguage')} t={t} />
                            <MultiSelect label={t('tags')} options={selectOptions.tags} selected={tags} onChange={(val) => setFormState('tags', val)} onClear={() => setFormState('tags', [])} placeholder={t('selectTags')} t={t} />
                            <MultiSelect label={t('categories')} options={selectOptions.categories} selected={categories} onChange={(val) => setFormState('categories', val)} onClear={() => setFormState('categories', [])} placeholder={t('selectCategories')} t={t} />
                        </div>
                        <div className="p-4 pt-2 shrink-0">
                            {showSaveAction ? (
                                <div className="flex h-[44px] w-full items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={onSaveAnalysis}
                                        disabled={isLoading}
                                        className="h-[44px] w-[130px] rounded-[12px] bg-[#353842] px-6 text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition hover:bg-[#555A6C] disabled:opacity-60"
                                    >
                                        {t('analysisAttachSave')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        title={!isFormValid ? t('formIsInvalid') : ''}
                                        className="h-[44px] flex-1 rounded-[12px] gg-gradient-btn text-white font-medium transition disabled:opacity-60"
                                    >
                                        {isLoading ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>{t('generatingReport')}</span>
                                            </span>
                                        ) : (
                                            <span className="text-[16px] leading-[20px] tracking-[-0.01em] font-medium">{t('runAnalysis')}</span>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button type="submit" disabled={isLoading} title={!isFormValid ? t('formIsInvalid') : ''} className="w-full h-[44px] rounded-[12px] flex items-center justify-center text-white font-medium transition gg-gradient-btn">
                                    {isLoading ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{t('generatingReport')}</span>
                                        </span>
                                    ) : (
                                        <span className="text-[16px] leading-[20px] tracking-[-0.01em] font-medium">{t('runAnalysis')}</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
            </form>
        </div>
    );
};



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

const mapIconColorToLightTheme = (color) => {
    if (!color) return color;
    const normalized = String(color).toUpperCase();
    if (normalized === '#FFFFFF') return '#1D2433';
    if (normalized === '#A7A8AC') return '#6B7488';
    if (normalized === '#BABBBF') return '#6B7488';
    return color;
};

const InlineIcon = ({ svg, size = 16, color, className = '' }) => {
    const markup = useMemo(() => normalizeSvgMarkup(svg), [svg]);
    const resolvedColor = useMemo(() => mapIconColorToLightTheme(color), [color]);
    return (
        <span
            className={`inline-flex ${className}`}
            style={{ width: `${size}px`, height: `${size}px`, color: resolvedColor }}
            dangerouslySetInnerHTML={{ __html: markup }}
            aria-hidden="true"
        />
    );
};

const useModalTransition = (isOpen, durationMs = 180) => {
    const [isRendered, setIsRendered] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timeoutId;
        let frameId;

        if (isOpen) {
            setIsRendered(true);
            frameId = window.requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            timeoutId = window.setTimeout(() => setIsRendered(false), durationMs);
        }

        return () => {
            if (typeof frameId === 'number') {
                window.cancelAnimationFrame(frameId);
            }
            if (typeof timeoutId === 'number') {
                window.clearTimeout(timeoutId);
            }
        };
    }, [isOpen, durationMs]);

    return { isRendered, isVisible };
};

const CreateProjectModal = ({
    isOpen,
    t,
    projectName,
    setProjectName,
    onClose,
    onSubmit,
    isSubmitting,
    error,
}) => {
    const { isRendered, isVisible } = useModalTransition(isOpen);
    if (!isRendered) return null;

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            onMouseDown={handleOverlayMouseDown}
        >
            <div className={`w-full max-w-[538px] rounded-[20px] bg-[#191D28] p-4 shadow-[0px_0px_32px_rgba(10,15,24,0.8)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0'}`}>
                <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                    <div className="flex items-start justify-between gap-5">
                        <h3 className="text-[20px] leading-[24px] font-medium tracking-[-0.01em] text-white">
                            {t('createProjectModalTitle')}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex h-5 w-5 items-center justify-center rounded-md text-white/70 transition hover:text-white hover:bg-[#2A2F3A] disabled:opacity-40"
                            aria-label={t('closeModal')}
                            title={t('closeModal')}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-[#A7A8AC]">
                            {t('projectNameLabel')}
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(event) => setProjectName(event.target.value)}
                            className="h-[44px] w-full rounded-[12px] bg-[#353842] px-3 text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF5620]"
                            placeholder={t('projectNamePlaceholder')}
                            maxLength={255}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-[13px] leading-[18px] text-[#FF7549]">{error}</p>
                    )}

                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-[44px] flex-1 rounded-[12px] bg-[#353842] text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition hover:bg-[#555A6C] disabled:opacity-60"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-[44px] flex-1 rounded-[12px] gg-gradient-btn text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition disabled:opacity-60"
                        >
                            {isSubmitting ? t('creatingProject') : t('createProjectAction')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RenameEntityModal = ({
    isOpen,
    t,
    title,
    label,
    value,
    onValueChange,
    onClose,
    onSubmit,
    isSubmitting,
    error,
}) => {
    if (!isOpen) return null;

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onMouseDown={handleOverlayMouseDown}
        >
            <div className="w-full max-w-[538px] rounded-[20px] bg-[#191D28] p-4 shadow-[0px_0px_32px_rgba(10,15,24,0.8)]">
                <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                    <div className="flex items-start justify-between gap-5">
                        <h3 className="text-[20px] leading-[24px] font-medium tracking-[-0.01em] text-white">
                            {title}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex h-5 w-5 items-center justify-center rounded-md text-white/70 transition hover:text-white hover:bg-[#2A2F3A] disabled:opacity-40"
                            aria-label={t('closeModal')}
                            title={t('closeModal')}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-[#A7A8AC]">
                            {label}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(event) => onValueChange(event.target.value)}
                            className="h-[44px] w-full rounded-[12px] bg-[#353842] px-3 text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF5620]"
                            maxLength={255}
                            autoFocus
                        />
                    </div>

                    {error && <p className="text-[13px] leading-[18px] text-[#FF7549]">{error}</p>}

                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-[44px] flex-1 rounded-[12px] bg-[#353842] text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition hover:bg-[#555A6C] disabled:opacity-60"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-[44px] flex-1 rounded-[12px] gg-gradient-btn text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition disabled:opacity-60"
                        >
                            {isSubmitting ? t('renaming') : t('renameAction')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmDeleteModal = ({
    isOpen,
    t,
    title,
    description,
    onClose,
    onConfirm,
    isSubmitting,
    error,
}) => {
    if (!isOpen) return null;

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[85] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onMouseDown={handleOverlayMouseDown}
        >
            <div className="w-full max-w-[538px] rounded-[20px] bg-[#191D28] p-4 shadow-[0px_0px_32px_rgba(10,15,24,0.8)]">
                <form className="flex flex-col gap-5" onSubmit={onConfirm}>
                    <div className="flex items-start justify-between gap-5">
                        <h3 className="text-[20px] leading-[24px] font-medium tracking-[-0.01em] text-white">
                            {title}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex h-5 w-5 items-center justify-center rounded-md text-white/70 transition hover:text-white hover:bg-[#2A2F3A] disabled:opacity-40"
                            aria-label={t('closeModal')}
                            title={t('closeModal')}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-[#A7A8AC]">
                        {description}
                    </p>
                    <p className="text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-[#FF7549]">
                        {t('deleteWarningText')}
                    </p>
                    {error && <p className="text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-[#FF7549]">{error}</p>}

                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-[44px] flex-1 rounded-[12px] bg-[#353842] text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition hover:bg-[#555A6C] disabled:opacity-60"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-[44px] flex-1 rounded-[12px] bg-[#3A1F24] text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-[#FF7549] transition hover:bg-[#4A242B] disabled:opacity-60"
                        >
                            {isSubmitting ? t('deleting') : t('deleteAction')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SelectProjectForAnalysisModal = ({
    isOpen,
    t,
    projects,
    selectedProjectId,
    onProjectChange,
    onBack,
    onSave,
    onCreateProject,
    onSkipSave,
    showSkipSaveAction = false,
    isSubmitting,
    error,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { isRendered, isVisible } = useModalTransition(isOpen);
    const dropdownRef = useRef(null);
    const hasProjects = projects.length > 0;
    const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;
    const filteredProjects = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return projects;
        return projects.filter((project) => String(project.name || '').toLowerCase().includes(q));
    }, [projects, searchTerm]);

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
            onBack();
        }
    };
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    useEffect(() => {
        if (!isOpen) return;
        setIsDropdownOpen(false);
        setSearchTerm('');
    }, [isOpen, selectedProjectId]);
    if (!isRendered) return null;

    return (
        <div
            className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            onMouseDown={handleOverlayMouseDown}
        >
            <div className={`w-full max-w-[538px] rounded-[20px] bg-[#191D28] p-4 shadow-[0px_0px_32px_rgba(10,15,24,0.8)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0'}`}>
                <form className="flex flex-col gap-5" onSubmit={onSave}>
                    <div className="flex items-start justify-between gap-5">
                        <h3 className="text-[20px] leading-[24px] font-medium tracking-[-0.01em] text-white">
                            {t('analysisAttachTitle')}
                        </h3>
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex h-5 w-5 items-center justify-center rounded-md text-white/70 transition hover:text-white hover:bg-[#2A2F3A] disabled:opacity-40"
                            aria-label={t('closeModal')}
                            title={t('closeModal')}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-[16px] leading-[120%] font-medium tracking-[-0.01em] text-[#BABBBF]">
                        {t('analysisAttachHint')}
                    </p>

                    {hasProjects ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-[#A7A8AC]">
                                {t('analysisAttachLabel')}
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    className="h-[44px] w-full rounded-[12px] bg-[#353842] px-3 pr-10 text-left text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-white focus:outline-none focus:ring-1 focus:ring-[#FF5620]"
                                >
                                    <span className={`block truncate ${selectedProject ? 'text-white' : 'text-[#A7A8AC]'}`}>
                                        {selectedProject?.name || t('analysisAttachLabel')}
                                    </span>
                                </button>
                                <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A7A8AC] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />

                                {isDropdownOpen && (
                                    <div className="absolute left-0 top-[48px] z-[95] w-full rounded-[12px] border border-[#323640] bg-[#191D28] shadow-[0_0_24px_rgba(0,0,0,0.45)]">
                                        <div className="border-b border-[#323640] p-2">
                                            <div className="relative">
                                                <InlineIcon
                                                    svg={iconSearch}
                                                    size={14}
                                                    color="#A7A8AC"
                                                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
                                                />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(event) => setSearchTerm(event.target.value)}
                                                    placeholder={t('search')}
                                                    className="h-[34px] w-full rounded-[8px] bg-[#0A0F18] pl-8 pr-8 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#FF5620]"
                                                    autoFocus
                                                />
                                                {searchTerm && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchTerm('')}
                                                        className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-white/60 transition hover:bg-[#2A2F3A] hover:text-white"
                                                        aria-label={t('clearSearch')}
                                                        title={t('clearSearch')}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-1">
                                            {filteredProjects.length > 0 ? (
                                                filteredProjects.map((project) => (
                                                    <button
                                                        key={project.id}
                                                        type="button"
                                                        onClick={() => {
                                                            onProjectChange(project.id);
                                                            setIsDropdownOpen(false);
                                                            setSearchTerm('');
                                                        }}
                                                        className={`flex h-[36px] w-full items-center px-3 text-left text-[13px] transition ${
                                                            project.id === selectedProjectId ? 'text-[#FF7549] bg-[#2A2F3A]' : 'text-white hover:bg-[#2A2F3A]'
                                                        }`}
                                                    >
                                                        <span className="truncate">{project.name}</span>
                                                        {project.id === selectedProjectId && <Check size={14} className="ml-auto text-[#FF7549]" />}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-[13px] text-[#A7A8AC]">{t('noMatches')}</div>
                                            )}
                                            <div className="my-1 h-px bg-[#323640]" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    setSearchTerm('');
                                                    onCreateProject();
                                                }}
                                                className="flex h-[36px] w-full items-center gap-2 px-3 text-left text-[13px] font-medium text-[#FF7549] transition hover:bg-[#2A2F3A]"
                                            >
                                                <Plus size={14} className="shrink-0" />
                                                <span>{t('analysisAttachCreateProjectAction')}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={onCreateProject}
                                disabled={isSubmitting}
                                className="h-[44px] w-full rounded-[12px] gg-gradient-btn text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition disabled:opacity-60"
                            >
                                {t('createProjectAction')}
                            </button>
                            {showSkipSaveAction && (
                                <button
                                    type="button"
                                    onClick={onSkipSave}
                                    disabled={isSubmitting}
                                    className="mx-auto text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-[#A7A8AC] underline underline-offset-2 transition hover:text-white disabled:opacity-60"
                                >
                                    {t('analysisAttachSkipSave')}
                                </button>
                            )}
                        </div>
                    )}

                    {error && <p className="text-[13px] leading-[18px] text-[#FF7549]">{error}</p>}

                    {hasProjects && (
                        <>
                            <div className="flex items-start gap-3">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={isSubmitting}
                                    className="h-[44px] flex-1 rounded-[12px] bg-[#353842] text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition hover:bg-[#555A6C] disabled:opacity-60"
                                >
                                    {t('analysisAttachBack')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-[44px] flex-1 rounded-[12px] gg-gradient-btn text-[16px] leading-[20px] font-medium tracking-[-0.01em] text-white transition disabled:opacity-60"
                                >
                                    {t('analysisAttachSave')}
                                </button>
                            </div>
                            {showSkipSaveAction && (
                                <button
                                    type="button"
                                    onClick={onSkipSave}
                                    disabled={isSubmitting}
                                    className="mx-auto text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-[#A7A8AC] underline underline-offset-2 transition hover:text-white disabled:opacity-60"
                                >
                                    {t('analysisAttachSkipSave')}
                                </button>
                            )}
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

// ... LeftSidebar ...
const LeftSidebar = ({
    t,
    onNavClick,
    activeTab,
    tocItems,
    activeTocId,
    onTocClick,
    isAnalyzed,
    onModalClick,
    onLanguageChange,
    currentLang,
    isCollapsed,
    onToggleCollapse,
    isAuthorized,
    projects = [],
    isProjectsLoading = false,
    selectedProjectId,
    onProjectSelect,
    onProjectCreate,
    onProjectRename,
    onProjectDelete,
    expandedProjectIds = [],
    projectAnalysesByProject = {},
    onProjectToggle,
    onAnalysisRename,
    onAnalysisDelete,
    onAnalysisSelect,
    selectedAnalysisId,
    createProjectModalOpenRequest = 0,
    onCreateProjectModalComplete,
}) => {
    const navigate = useNavigate();
    const navItems = [
        { id: 'description', label: t('navDescription'), icon: iconNavDescription },
        { id: 'market', label: t('navMarketAnalysis'), icon: iconNavMarket },
        { id: 'competitors', label: t('navCompetitors'), icon: iconNavCompetitors },
        { id: 'idea', label: t('navIdeaAnalysis'), icon: iconNavIdea },
        { id: 'pitch', label: t('navPitchPack'), icon: iconNavPitch },
    ];
    const aboutLink = { id: 'about', label: t('aboutContacts'), icon: iconNavAbout };
    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => onTocClick(id), 300);
        }
    };
    const handleToggleLanguage = () => {
        onLanguageChange(currentLang === 'ru' ? 'en' : 'ru');
    };
    const handleProtectedNavClick = (tabId) => {
        onNavClick(tabId);
    };
    const handleOpenCreateProjectModal = () => {
        setNewProjectName('');
        setCreateProjectError('');
        setIsCreateProjectModalOpen(true);
    };
    const handleCloseCreateProjectModal = () => {
        if (isCreatingProject) return;
        setIsCreateProjectModalOpen(false);
        setNewProjectName('');
        setCreateProjectError('');
        onCreateProjectModalComplete?.(null);
    };
    const handleCreateProjectSubmit = async (event) => {
        event.preventDefault();
        const normalizedName = newProjectName.trim();
        if (!normalizedName) {
            setCreateProjectError(t('projectNameRequired'));
            return;
        }
        if (!onProjectCreate) return;

        setIsCreatingProject(true);
        setCreateProjectError('');
        try {
            const createdProject = await onProjectCreate(normalizedName);
            setIsCreateProjectModalOpen(false);
            setNewProjectName('');
            onCreateProjectModalComplete?.(createdProject || null);
        } catch (error) {
            setCreateProjectError(error?.message || t('projectCreateFailed'));
        } finally {
            setIsCreatingProject(false);
        }
    };
    const handleProjectRenameClick = async (project) => {
        setOpenProjectMenu(null);
        if (!project?.id) return;
        setRenameTarget({ type: 'project', projectId: project.id });
        setRenameValue(project.name || '');
        setRenameError('');
    };
    const handleProjectDeleteClick = async (project) => {
        setOpenProjectMenu(null);
        if (!project?.id) return;
        setDeleteTarget({ type: 'project', projectId: project.id, label: project.name || '' });
        setDeleteError('');
    };
    const handleAnalysisRenameClick = async (analysis, projectId) => {
        setOpenAnalysisMenu(null);
        if (!analysis?.id || !projectId) return;
        setRenameTarget({ type: 'analysis', projectId, analysisId: analysis.id });
        setRenameValue(analysis.name || '');
        setRenameError('');
    };
    const handleAnalysisDeleteClick = async (analysis, projectId) => {
        setOpenAnalysisMenu(null);
        if (!analysis?.id || !projectId) return;
        setDeleteTarget({ type: 'analysis', analysisId: analysis.id, projectId, label: analysis.name || '' });
        setDeleteError('');
    };
    const handleCloseRenameModal = () => {
        if (isRenaming) return;
        setRenameTarget(null);
        setRenameValue('');
        setRenameError('');
    };
    const handleRenameSubmit = async (event) => {
        event.preventDefault();
        if (!renameTarget) return;
        const normalized = renameValue.trim();
        if (!normalized) {
            setRenameError(t('projectNameRequired'));
            return;
        }

        setIsRenaming(true);
        setRenameError('');
        try {
            if (renameTarget.type === 'project') {
                if (!onProjectRename) return;
                await onProjectRename(renameTarget.projectId, normalized);
            } else if (renameTarget.type === 'analysis') {
                if (!onAnalysisRename) return;
                await onAnalysisRename({
                    analysisId: renameTarget.analysisId,
                    projectId: renameTarget.projectId,
                    name: normalized,
                });
            }
            setRenameTarget(null);
            setRenameValue('');
        } catch (error) {
            const fallback = renameTarget.type === 'project' ? t('projectRenameFailed') : t('analysisRenameFailed');
            setRenameError(error?.message || fallback);
        } finally {
            setIsRenaming(false);
        }
    };
    const handleCloseDeleteModal = () => {
        if (isDeleting) return;
        setDeleteTarget(null);
        setDeleteError('');
    };
    const handleConfirmDeleteSubmit = async (event) => {
        event.preventDefault();
        if (!deleteTarget) return;
        setIsDeleting(true);
        setDeleteError('');
        try {
            if (deleteTarget.type === 'project') {
                if (!onProjectDelete) return;
                await onProjectDelete(deleteTarget.projectId);
            } else {
                if (!onAnalysisDelete) return;
                await onAnalysisDelete({ analysisId: deleteTarget.analysisId, projectId: deleteTarget.projectId });
            }
            setDeleteTarget(null);
        } catch (error) {
            const fallback = deleteTarget.type === 'project' ? t('projectDeleteFailed') : t('analysisDeleteFailed');
            setDeleteError(error?.message || fallback);
        } finally {
            setIsDeleting(false);
        }
    };
    const searchInputRef = useRef(null);
    const createProjectModalRequestRef = useRef(createProjectModalOpenRequest);
    const searchContainerRef = useRef(null);
    const searchRequestSeqRef = useRef(0);
    const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchHovered, setIsSearchHovered] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState('');
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [createProjectError, setCreateProjectError] = useState('');
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [openProjectMenu, setOpenProjectMenu] = useState(null);
    const [openAnalysisMenu, setOpenAnalysisMenu] = useState(null);
    const [renameTarget, setRenameTarget] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [renameError, setRenameError] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const hasSearchText = searchQuery.trim().length > 0;
    const isSearchActive = isSearchFocused && hasSearchText;
    const showSearchDropdown = !isCollapsed && hasSearchText && isSearchFocused;
    const getActionsMenuPosition = useCallback((triggerElement, menuWidth = 168) => {
        const rect = triggerElement.getBoundingClientRect();
        const viewportPadding = 8;
        const left = Math.min(
            Math.max(viewportPadding, rect.right - menuWidth),
            window.innerWidth - menuWidth - viewportPadding
        );
        const top = Math.min(rect.bottom + 6, window.innerHeight - 90);
        return { left, top };
    }, []);
    useEffect(() => {
        if (!isCollapsed && shouldFocusSearch) {
            searchInputRef.current?.focus();
            setShouldFocusSearch(false);
        }
    }, [isCollapsed, shouldFocusSearch]);
    useEffect(() => {
        if (createProjectModalOpenRequest === createProjectModalRequestRef.current) return;
        createProjectModalRequestRef.current = createProjectModalOpenRequest;
        setNewProjectName('');
        setCreateProjectError('');
        setIsCreateProjectModalOpen(true);
    }, [createProjectModalOpenRequest]);
    useEffect(() => {
        if (isCollapsed) {
            setIsCreateProjectModalOpen(false);
            setCreateProjectError('');
            setIsCreatingProject(false);
            setOpenProjectMenu(null);
            setOpenAnalysisMenu(null);
            setRenameTarget(null);
            setRenameValue('');
            setRenameError('');
            setIsRenaming(false);
            setDeleteTarget(null);
            setDeleteError('');
            setIsDeleting(false);
        }
    }, [isCollapsed]);
    useEffect(() => {
        const handleClickOutsideMenus = (event) => {
            if (event.target.closest('[data-actions-menu-root]')) return;
            setOpenProjectMenu(null);
            setOpenAnalysisMenu(null);
        };
        document.addEventListener('mousedown', handleClickOutsideMenus);
        return () => document.removeEventListener('mousedown', handleClickOutsideMenus);
    }, []);
    useEffect(() => {
        if (!openProjectMenu && !openAnalysisMenu) return;
        const handleViewportChange = () => {
            setOpenProjectMenu(null);
            setOpenAnalysisMenu(null);
        };
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);
        return () => {
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [openProjectMenu, openAnalysisMenu]);
    useEffect(() => {
        if (!showSearchDropdown) return;

        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSearchDropdown]);
    useEffect(() => {
        if (isCollapsed) {
            setSearchQuery('');
            setSearchResults([]);
            setSearchError('');
            setIsSearching(false);
            setIsSearchFocused(false);
        }
    }, [isCollapsed]);
    useEffect(() => {
        if (isCollapsed) return;

        const query = searchQuery.trim();
        if (query.length < 2) {
            setSearchResults([]);
            setSearchError('');
            setIsSearching(false);
            return;
        }

        const requestId = searchRequestSeqRef.current + 1;
        searchRequestSeqRef.current = requestId;
        const abortController = new AbortController();

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            setSearchError('');
            try {
                const response = await apiRequest(`/games/search?query=${encodeURIComponent(query)}&limit=20`, {
                    signal: abortController.signal,
                });
                if (!response.ok) {
                    throw new Error(`Search request failed with status ${response.status}`);
                }
                const data = await response.json();
                if (requestId !== searchRequestSeqRef.current) return;
                setSearchResults(Array.isArray(data) ? data : []);
            } catch (error) {
                if (abortController.signal.aborted) return;
                if (requestId !== searchRequestSeqRef.current) return;
                setSearchResults([]);
                setSearchError(t('searchRequestError'));
            } finally {
                if (requestId === searchRequestSeqRef.current && !abortController.signal.aborted) {
                    setIsSearching(false);
                }
            }
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            abortController.abort();
        };
    }, [searchQuery, isCollapsed, t]);
    const handleSearchSelect = (gameId) => {
        if (!gameId && gameId !== 0) return;
        setIsSearchFocused(false);
        setSearchQuery('');
        setSearchResults([]);
        navigate(`/info_game/${gameId}`);
    };
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (window.Plotly) {
                const plots = document.querySelectorAll('.js-plotly-plot');
                
                plots.forEach(plotDiv => {
                    window.Plotly.relayout(plotDiv, {});
                });
            }
        }, 500); // 300 Р В РЎВР РЋР С“ Р В РўвЂР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂў, Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋР С“Р В РЎВР В Р’ВµР В Р вЂ¦Р РЋРІР‚в„– Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР В РЎвЂР В Р вЂ¦Р РЋРІР‚в„– Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІвЂљВ¬Р В Р’В»Р В Р’В°

        return () => clearTimeout(timeoutId);
    }, [isCollapsed]);
    const showSidebarToc = !isCollapsed && activeTab === 'market' && tocItems.length > 0;

    return (
        <nav 
            className={`group fixed top-0 left-0 h-screen overflow-x-hidden overflow-y-hidden bg-[#191D28] text-white flex flex-col z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[76px] p-4 items-start' : 'w-[296px] p-4'}`}
        >
            <div className={`flex flex-col w-full h-full items-start gap-8`}>
                <div className={`flex flex-col w-full items-start gap-5`}>
                    <div className={`relative flex items-center w-full h-[38px] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <button 
                            onClick={() => onNavClick('landing')} 
                            className={`${isCollapsed ? 'w-[44px] h-[38px] justify-center' : 'w-full h-[38px]'} flex items-center cursor-pointer hover:opacity-80 transition ${isCollapsed ? 'group-hover:opacity-0' : ''}`}
                        >
                            <img 
                                src={isCollapsed ? logoCollapsed : logoExpanded} 
                                alt={t('appName')} 
                                className={`${isCollapsed ? 'w-[16px] h-[26px]' : 'w-[129px] h-[32px] ml-2'}`}
                            />
                        </button>
                        <button
                            onClick={onToggleCollapse}
                            className={`absolute ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-0'} w-[38px] h-[38px] flex items-center justify-center rounded-[12px] transition-colors opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-[#2A2F3A]`}
                        >
                            <InlineIcon svg={isCollapsed ? iconChevronCollapsed : iconChevron} size={20} />
                        </button>
                    </div>
                    {isCollapsed && (
                        <button
                            onClick={() => {
                                setShouldFocusSearch(true);
                                onToggleCollapse();
                            }}
                            className="w-[44px] h-[44px] flex items-center justify-center rounded-[12px] hover:bg-[#2A2F3A]"
                        >
                            <InlineIcon svg={iconSearch} color="#A7A8AC" size={20} />
                        </button>
                    )}
                    {!isCollapsed && (
                        <div ref={searchContainerRef} className="relative w-full max-w-[264px]">
                            <div
                                onMouseEnter={() => setIsSearchHovered(true)}
                                onMouseLeave={() => setIsSearchHovered(false)}
                                className="h-[44px] w-full rounded-[12px] p-[2px] transition-all duration-200"
                                style={{
                                    background: isSearchActive
                                        ? 'radial-gradient(99.96% 99.96% at 50% 0.04%, #FF7549 0%, #FF5620 100%)'
                                        : (isSearchHovered ? '#D4DDEA' : 'transparent'),
                                }}
                            >
                                <div className="flex h-full w-full items-center gap-2 rounded-[10px] bg-[#353842] px-3">
                                    <InlineIcon svg={iconSearch} color={isSearchActive ? '#FFFFFF' : '#A7A8AC'} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        placeholder={t('sidebarSearchPlaceholder')}
                                        className={`w-full bg-transparent pr-1 text-[14px] leading-[18px] focus:outline-none ${
                                            isSearchActive ? 'text-white placeholder:text-white/60' : 'text-[#A7A8AC] placeholder:text-[#A7A8AC]'
                                        }`}
                                    />
                                    {hasSearchText && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSearchResults([]);
                                                setSearchError('');
                                                searchInputRef.current?.focus();
                                            }}
                                            className="flex h-5 w-5 items-center justify-center text-white/90 transition hover:text-white"
                                            aria-label={t('clearSearch')}
                                            title={t('clearSearch')}
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {showSearchDropdown && isSearching && (
                                <div className="absolute left-0 top-[52px] z-50 flex h-[141px] w-[264px] flex-col items-center rounded-[12px] bg-[#191D28] py-6 shadow-[0px_0px_32px_rgba(10,15,24,0.8)]">
                                    <div className="relative h-10 w-10">
                                        <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#353842]" />
                                        <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-transparent border-t-white animate-spin" />
                                    </div>
                                    <div className="mt-2 flex h-[53px] w-full flex-col items-start justify-center gap-1 p-2">
                                        <p className="w-full text-center text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-white">{t('searchPleaseWait')}</p>
                                        <p className="w-full text-center text-[12px] font-medium leading-[15px] tracking-[-0.01em] text-[#A7A8AC]">{t('searchMayTakeTime')}</p>
                                    </div>
                                </div>
                            )}

                            {showSearchDropdown && !isSearching && searchError && (
    <div className="absolute left-0 top-[52px] z-50 w-[264px] rounded-[12px] bg-[#191D28] shadow-[0px_0px_32px_rgba(10,15,24,0.8)]">
        <div className="px-3 py-4 text-center text-[13px] leading-[18px] text-[#A7A8AC]">
            {searchError}
        </div>
    </div>
)}

{showSearchDropdown && !isSearching && !searchError && searchResults.length === 0 && (
    <div className="absolute left-0 top-[52px] z-50 flex h-[141px] w-[264px] flex-col items-center rounded-[12px] bg-[#191D28] py-6 shadow-[0px_0px_32px_rgba(10,15,24,0.8)]">
        <Frown className="h-10 w-10 text-[#A7A8AC]" strokeWidth={1.8} />
        <div className="mt-2 flex h-[53px] w-full flex-col items-start justify-center gap-1 p-2">
            <p className="w-full text-center text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-white">{t('searchGameNotFound')}</p>
            <p className="w-full text-center text-[12px] font-medium leading-[15px] tracking-[-0.01em] text-[#A7A8AC]">{t('searchTryDifferentTitle')}</p>
        </div>
    </div>
)}

{showSearchDropdown && !isSearching && !searchError && searchResults.length > 0 && (
    <div className="absolute left-0 top-[52px] z-50 w-[264px] max-h-[375px] overflow-y-auto rounded-[12px] bg-[#191D28] shadow-[0px_0px_32px_rgba(10,15,24,0.8)] custom-scrollbar">
        {searchResults.map((game, index) => (
            <button
                key={game.id}
                onClick={() => handleSearchSelect(game.id)}
                className={`flex h-[44px] w-full items-center gap-3 px-2 text-left transition-colors hover:bg-[#353842]`}
            >
                {game.image && game.image !== 'РІР‚вЂќ' ? (
                    <img
                        src={game.image}
                        alt={game.name}
                        className="h-[28px] w-[60px] rounded-[4px] object-cover shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                    />
                ) : (
                    <div className="h-[28px] w-[60px] rounded-[4px] bg-[#555A6C]" />
                )}
                <span className="flex-1 truncate text-[14px] font-semibold leading-[18px] tracking-[-0.01em] text-white">
                    {game.name}
                </span>
            </button>
        ))}
    </div>
)}
                        </div>
                    )}
                </div>

                <div className={`flex flex-col w-full flex-1 min-h-0 items-start gap-5`}>
                    <div className={`flex flex-col w-full items-start gap-1 -mt-5`}>
                        {navItems.map(item => {
                            const isActive = activeTab === item.id;
                            return (
                                <button 
                                    key={item.id} 
                                    onClick={() => handleProtectedNavClick(item.id)} 
                                    className={`flex items-center ${isCollapsed ? 'w-[44px] h-[44px] justify-center gap-0' : 'w-full max-w-[264px] h-[44px] px-3 gap-2'} rounded-[12px] transition ${isActive ? 'bg-[#353842]' : 'hover:bg-[#2A2F3A]'}`} 
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <InlineIcon svg={item.icon} color={isActive ? '#FFFFFF' : '#A7A8AC'} />
                                    <span
                                        className={`text-[14px] leading-[18px] font-medium text-white transition-all duration-200 ease-in-out overflow-hidden ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
                                        style={{ maxWidth: isCollapsed ? 0 : '200px' }}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onModalClick(aboutLink.id)}
                            className={`flex items-center ${isCollapsed ? 'w-[44px] h-[44px] justify-center gap-0' : 'w-full max-w-[264px] h-[44px] px-3 gap-2'} rounded-[12px] transition hover:bg-[#2A2F3A]`}
                            title={isCollapsed ? aboutLink.label : ''}
                        >
                            <InlineIcon svg={aboutLink.icon} color="#A7A8AC" />
                            <span
                                className={`text-[14px] leading-[18px] font-medium text-white transition-all duration-200 ease-in-out overflow-hidden ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
                                style={{ maxWidth: isCollapsed ? 0 : '200px' }}
                            >
                                {aboutLink.label}
                            </span>
                        </button>
                    </div>

                    {!isCollapsed && <div className="w-full max-w-[244px] h-px bg-[#555A6C]" />}
                    {isCollapsed && <div className="w-[24px] h-px bg-[#555A6C] self-center" />}

                    <div className={`flex flex-col w-full items-start gap-3`}>
                        {!isCollapsed && isAuthorized && (
                            <div className="flex w-full max-w-[264px] flex-col gap-1">
                                <div className="flex h-5 w-full items-center justify-between px-3">
                                    <span className="text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-[#A7A8AC]">
                                        {t('projectsTitle')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleOpenCreateProjectModal}
                                        className="flex h-5 w-5 items-center justify-center rounded-[6px] text-white transition hover:bg-[#2A2F3A]"
                                        aria-label={t('createProjectAction')}
                                        title={t('createProjectAction')}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex h-[220px] flex-col gap-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
                                    {isProjectsLoading && (
                                        <div className="px-3 py-2 text-[13px] leading-[18px] text-[#A7A8AC]">
                                            {t('projectsLoading')}
                                        </div>
                                    )}
                                    {!isProjectsLoading && projects.length === 0 && (
                                        <div className="px-3 py-2 text-[13px] leading-[18px] text-[#A7A8AC]">
                                            {t('projectsEmpty')}
                                        </div>
                                    )}
                                    {!isProjectsLoading && projects.map((project) => {
                                        const isExpanded = expandedProjectIds.includes(project.id);
                                        const analysesState = projectAnalysesByProject[project.id] || {};
                                        const analyses = Array.isArray(analysesState.items) ? analysesState.items : [];
                                        return (
                                            <div key={project.id} className={`group/project relative flex w-full flex-col ${openProjectMenu?.id === project.id ? 'z-[260]' : ''}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (onProjectToggle) {
                                                            onProjectToggle(project.id);
                                                            return;
                                                        }
                                                        onProjectSelect?.(project.id);
                                                    }}
                                                    className="flex h-[44px] w-full min-w-0 items-center gap-2 rounded-[12px] px-3 pr-10 text-left transition"
                                                >
                                                    <ChevronRight className={`h-5 w-5 text-white transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                    <span className="truncate text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-white">
                                                        {project.name}
                                                    </span>
                                                </button>
                                                <div data-actions-menu-root className="absolute right-2 top-[22px] -translate-y-1/2">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            const nextPosition = getActionsMenuPosition(event.currentTarget);
                                                            setOpenAnalysisMenu(null);
                                                            setOpenProjectMenu((prev) => (prev?.id === project.id ? null : { id: project.id, ...nextPosition }));
                                                        }}
                                                        className={`flex h-6 w-6 items-center justify-center rounded-md text-[#A7A8AC] transition hover:bg-[#2A2F3A] hover:text-white ${
                                                            openProjectMenu?.id === project.id ? 'opacity-100' : 'opacity-0 group-hover/project:opacity-100'
                                                        }`}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {openProjectMenu?.id === project.id && createPortal(
                                                        <div
                                                            data-actions-menu-root
                                                            className="fixed z-[1200] w-[168px] rounded-[12px] border border-[#323640] bg-[#191D28] p-1 shadow-[0_0_24px_rgba(0,0,0,0.45)]"
                                                            style={{ left: openProjectMenu.left, top: openProjectMenu.top }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    void handleProjectRenameClick(project);
                                                                }}
                                                                className="flex h-9 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[13px] text-white transition hover:bg-[#2A2F3A]"
                                                            >
                                                                <Pencil size={14} />
                                                                <span>{t('renameAction')}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    void handleProjectDeleteClick(project);
                                                                }}
                                                                className="flex h-9 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[13px] text-[#FF7549] transition hover:bg-[#2A2F3A]"
                                                            >
                                                                <Trash2 size={14} />
                                                                <span>{t('deleteAction')}</span>
                                                            </button>
                                                        </div>,
                                                        document.body
                                                    )}
                                                </div>

                                                {isExpanded && (
                                                    <div className="flex w-full flex-col">
                                                        {!!analysesState.error && (
                                                            <div className="pl-[54px] pr-3 py-2 text-[13px] leading-[18px] text-[#FF7549]">
                                                                {analysesState.error}
                                                            </div>
                                                        )}
                                                        {analysesState.loading && (
                                                            <div className="pl-[54px] pr-3 py-2 text-[13px] leading-[18px] text-[#A7A8AC]">
                                                                {t('analysesLoading')}
                                                            </div>
                                                        )}
                                                        {!analysesState.loading && !analysesState.error && analyses.length === 0 && (
                                                            <div className="pl-[54px] pr-3 py-2 text-[13px] leading-[18px] text-[#A7A8AC]">
                                                                {t('analysesEmpty')}
                                                            </div>
                                                        )}
                                                        {!analysesState.loading && !analysesState.error && analyses.length > 0 && (
                                                            <div className="relative flex w-full flex-col overflow-x-hidden">
                                                                <div className="pointer-events-none absolute left-[26px] top-0 bottom-0 w-px bg-[#555A6C]" />
                                                                {analyses.map((analysis) => (
                                                                    <div key={analysis.id} className="relative flex w-full items-stretch">
                                                                        <div className="w-[52px] shrink-0" />
                                                                        <div className={`group/analysis relative flex-1 min-w-0 ${openAnalysisMenu?.menuId === `${project.id}:${analysis.id}` ? 'z-[200]' : ''}`} data-actions-menu-root>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => onAnalysisSelect?.(analysis.id, project.id)}
                                                                                className={`h-[44px] w-full rounded-[12px] px-3 pr-10 text-left transition ${
                                                                                    selectedAnalysisId === analysis.id ? 'bg-[#353842] hover:bg-[#555A6C]' : 'group-hover/analysis:bg-[#2A2F3A]'
                                                                                }`}
                                                                            >
                                                                                <span className="block truncate text-[14px] leading-[18px] font-medium tracking-[-0.01em] text-white">
                                                                                    {analysis.name}
                                                                                </span>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    const menuId = `${project.id}:${analysis.id}`;
                                                                                    const nextPosition = getActionsMenuPosition(event.currentTarget);
                                                                                    setOpenProjectMenu(null);
                                                                                    setOpenAnalysisMenu((prev) => (prev?.menuId === menuId ? null : { menuId, ...nextPosition }));
                                                                                }}
                                                                                className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-[#A7A8AC] transition hover:bg-[#2A2F3A] hover:text-white ${
                                                                                    openAnalysisMenu?.menuId === `${project.id}:${analysis.id}` ? 'opacity-100' : 'opacity-0 group-hover/analysis:opacity-100'
                                                                                }`}
                                                                            >
                                                                                <MoreVertical size={16} />
                                                                            </button>
                                                                            {openAnalysisMenu?.menuId === `${project.id}:${analysis.id}` && createPortal(
                                                                                <div
                                                                                    data-actions-menu-root
                                                                                    className="fixed z-[1200] w-[168px] rounded-[12px] border border-[#323640] bg-[#191D28] p-1 shadow-[0_0_24px_rgba(0,0,0,0.45)]"
                                                                                    style={{ left: openAnalysisMenu.left, top: openAnalysisMenu.top }}
                                                                                >
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(event) => {
                                                                                            event.stopPropagation();
                                                                                            void handleAnalysisRenameClick(analysis, project.id);
                                                                                        }}
                                                                                        className="flex h-9 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[13px] text-white transition hover:bg-[#2A2F3A]"
                                                                                    >
                                                                                        <Pencil size={14} />
                                                                                        <span>{t('renameAction')}</span>
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(event) => {
                                                                                            event.stopPropagation();
                                                                                            void handleAnalysisDeleteClick(analysis, project.id);
                                                                                        }}
                                                                                        className="flex h-9 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[13px] text-[#FF7549] transition hover:bg-[#2A2F3A]"
                                                                                    >
                                                                                        <Trash2 size={14} />
                                                                                        <span>{t('deleteAction')}</span>
                                                                                    </button>
                                                                                </div>,
                                                                                document.body
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className={`flex items-center ${isCollapsed ? 'w-[44px] h-[44px] justify-center' : 'w-full max-w-[264px] h-[44px] px-3'} gap-2 rounded-[12px] transition hover:bg-[#2A2F3A]`}>
                            <button
                                onClick={isCollapsed ? handleToggleLanguage : undefined}
                                className={`flex items-center gap-2 ${isCollapsed ? '' : 'w-full'}`}
                                title={isCollapsed ? (currentLang === 'ru' ? 'EN' : 'RU') : ''}
                            >
                                <InlineIcon svg={iconLanguage} color="#A7A8AC" />
                                {!isCollapsed && (
                                    <div className="flex items-center gap-1 text-[14px] leading-[18px]">
                                        <button onClick={() => onLanguageChange('ru')} className={`${currentLang === 'ru' ? 'text-[#FFFFFF]' : 'text-[#A7A8AC] hover:text-white'}`}>{t('russian')}</button>
                                        <span className="text-[#A7A8AC]">|</span>
                                        <button onClick={() => onLanguageChange('en')} className={`${currentLang === 'en' ? 'text-[#FFFFFF]' : 'text-[#A7A8AC] hover:text-white'}`}>{t('english')}</button>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {showSidebarToc && (
                        <div className="flex-1 overflow-hidden flex flex-col pt-3 mt-2 w-full">
                            <div className="overflow-hidden flex-1 space-y-2 pr-2">
                                {/* {tocItems.map(item => (
                                    <button key={item.id} onClick={() => scrollTo(item.id)} className={`group relative block w-full text-left transition text-sm py-1 ${activeTocId === item.id ? 'text-[#FFC132] border-l-2 border-[#FFC132] pl-3' : 'hover:text-white text-white/70 pl-4'}`} title={item.title}>
                                        <span className="block truncate">{item.title}</span>
                                    </button>
                                ))} */}
                            </div>
                        </div>
                    )}
                    {!showSidebarToc && <div className="flex-1"></div>}

                </div>
                <div className={`mt-auto w-full ${isCollapsed ? 'flex flex-col items-start gap-4' : ''}`} />
            </div>
            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                t={t}
                projectName={newProjectName}
                setProjectName={setNewProjectName}
                onClose={handleCloseCreateProjectModal}
                onSubmit={handleCreateProjectSubmit}
                isSubmitting={isCreatingProject}
                error={createProjectError}
            />
            <RenameEntityModal
                isOpen={Boolean(renameTarget)}
                t={t}
                title={renameTarget?.type === 'analysis' ? t('renameAnalysisTitle') : t('renameProjectTitle')}
                label={renameTarget?.type === 'analysis' ? t('analysisNameLabel') : t('projectNameLabel')}
                value={renameValue}
                onValueChange={setRenameValue}
                onClose={handleCloseRenameModal}
                onSubmit={handleRenameSubmit}
                isSubmitting={isRenaming}
                error={renameError}
            />
            <ConfirmDeleteModal
                isOpen={Boolean(deleteTarget)}
                t={t}
                title={deleteTarget?.type === 'analysis' ? t('deleteAnalysisTitle') : t('deleteProjectTitle')}
                description={deleteTarget
                    ? `${deleteTarget.type === 'analysis' ? t('deleteAnalysisConfirm') : t('deleteProjectConfirm')} ${deleteTarget.label || ''}`.trim()
                    : ''
                }
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDeleteSubmit}
                isSubmitting={isDeleting}
                error={deleteError}
            />
        </nav>
    );
};

const CompetitorsFilterSidebar = ({ t, options, formState, isVisible, isFloating = false, onCloseFloating, onApply }) => {
    // Pre-fill with values from description form
    const [filterGenre, setFilterGenre] = useState(formState.genre);
    const [filterTags, setFilterTags] = useState(formState.tags);
    const [filterCategories, setFilterCategories] = useState(formState.categories);
    const [dateFromRelease, setDateFromRelease] = useState('');
    const [dateToRelease, setDateToRelease] = useState('');
    const [peakCCUFrom, setPeakCCUFrom] = useState('');
    const [peakCCUTo, setPeakCCUTo] = useState('');
    const [publisherClass, setPublisherClass] = useState([]);
    const [priceFrom, setPriceFrom] = useState('');
    const [priceTo, setPriceTo] = useState('');
    const [revenueFrom, setRevenueFrom] = useState('');
    const [revenueTo, setRevenueTo] = useState('');
    const [publishers, setPublishers] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [reviewsFrom, setReviewsFrom] = useState('');
    const [reviewsTo, setReviewsTo] = useState('');
    const [positiveReviewsFrom, setPositiveReviewsFrom] = useState('');
    const [positiveReviewsTo, setPositiveReviewsTo] = useState('');

    // Pre-fill with values from description form only on initial mount
    useEffect(() => {
        setFilterGenre(formState.genre);
        setFilterTags(formState.tags);
        setFilterCategories(formState.categories);
    }, []); // Empty dependency array - only run on mount

    const handleReset = () => {
        setFilterGenre([]);
        setFilterTags([]);
        setFilterCategories([]);
        setDateFromRelease('');
        setDateToRelease('');
        setPeakCCUFrom('');
        setPeakCCUTo('');
        setPublisherClass([]);
        setPriceFrom('');
        setPriceTo('');
        setRevenueFrom('');
        setRevenueTo('');
        setPublishers([]);
        setDevelopers([]);
        setReviewsFrom('');
        setReviewsTo('');
        setPositiveReviewsFrom('');
        setPositiveReviewsTo('');
    };

    const publisherClassOptions = PUBLISHER_CLASS_OPTIONS;
    const developerOptions = DEVELOPER_OPTIONS;
    const publisherOptions = PUBLISHER_OPTIONS;

    return (
        <div className={`fixed top-16 right-6 z-50 w-96 h-[calc(100vh-96px)] flex flex-col shadow-2xl transition-all duration-200 ease-in-out transform ${isVisible && isFloating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
            {isFloating && (
                <>
                    <div className="bg-[#0A0F18] rounded-t-lg p-3 py-2 px-4 md:px-6 flex items-center justify-between border-b border-[#323640] h-12">
                        <h3 className="text-lg font-bold text-white">{t('filtersTitle')}</h3>
                        <div><button onClick={onCloseFloating} className="p-2 rounded-md text-white/70 hover:text-white"><X /></button></div>
                    </div>
                    <div className="bg-[#0A0F18] rounded-b-lg overflow-hidden flex-1 flex flex-col relative">
                        <div className="overflow-y-auto custom-scrollbar p-6 pb-[120px]">
                            <div className="space-y-4">
                                <div className="border-b border-[#323640] pb-4">
                                    <MultiSelect label={t('genre')} options={options.genres} selected={filterGenre} onChange={setFilterGenre} onClear={() => setFilterGenre([])} placeholder={t('selectGenres')} t={t} />
                                    <div className="mt-3" />
                                    <MultiSelect label={t('tags')} options={options.tags} selected={filterTags} onChange={setFilterTags} onClear={() => setFilterTags([])} placeholder={t('selectTags')} t={t} />
                                    <div className="mt-3" />
                                    <MultiSelect label={t('categories')} options={options.categories} selected={filterCategories} onChange={setFilterCategories} onClear={() => setFilterCategories([])} placeholder={t('selectCategories')} t={t} />
                                </div>
                                <div className="border-b border-[#323640] pb-4">
                                    <label className="text-sm font-semibold text-white/70 block mb-2">{t('releaseDate')}</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-white/70 text-xs mb-1">{t('fromD')}</label>
                                            <input type="date" value={dateFromRelease} onChange={(e) => setDateFromRelease(e.target.value)} className="w-full bg-[#191D28] border border-[#323640] rounded-lg p-2 text-white/80 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC132]" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-white/70 text-xs mb-1">{t('toD')}</label>
                                            <input type="date" value={dateToRelease} onChange={(e) => setDateToRelease(e.target.value)} className="w-full bg-[#191D28] border border-[#323640] rounded-lg p-2 text-white/80 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC132]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="border-b border-[#323640] pb-4 space-y-3">
                                    <RangeInput label={t('compPeakCCU')} fromValue={peakCCUFrom} toValue={peakCCUTo} onFromChange={setPeakCCUFrom} onToChange={setPeakCCUTo} t={t} />
                                    <RangeInput label={t('price')} fromValue={priceFrom} toValue={priceTo} onFromChange={setPriceFrom} onToChange={setPriceTo} t={t} />
                                    <RangeInput label={t('revenue')} fromValue={revenueFrom} toValue={revenueTo} onFromChange={setRevenueFrom} onToChange={setRevenueTo} t={t} />
                                </div>
                                <div className="border-b border-[#323640] pb-4">
                                    <MultiSelect label={t('publisherClass')} options={publisherClassOptions} selected={publisherClass} onChange={setPublisherClass} onClear={() => setPublisherClass([])} placeholder={t('selectPublisherClass')} t={t} />
                                </div>
                                <div className="border-b border-[#323640] pb-4">
                                    <MultiSelect label={t('publisher')} options={publisherOptions} selected={publishers} onChange={setPublishers} onClear={() => setPublishers([])} placeholder={t('selectPublisher')} t={t} />
                                    <div className="mt-3" />
                                    <MultiSelect label={t('developer')} options={developerOptions} selected={developers} onChange={setDevelopers} onClear={() => setDevelopers([])} placeholder={t('selectDeveloper')} t={t} />
                                </div>
                                <div className="border-b border-[#323640] pb-4 space-y-3">
                                    <RangeInput label={t('reviewCount')} fromValue={reviewsFrom} toValue={reviewsTo} onFromChange={setReviewsFrom} onToChange={setReviewsTo} t={t} />
                                    <RangeInput label={t('positiveReviewsPercent')} fromValue={positiveReviewsFrom} toValue={positiveReviewsTo} onFromChange={setPositiveReviewsFrom} onToChange={setPositiveReviewsTo} t={t} />
                                </div>
                            </div>
                        </div>
                        
                    <div className="absolute bottom-0 w-full flex flex-col justify-end items-center gap-3 p-4" style={{ background: 'linear-gradient(180deg, rgba(244, 246, 251, 0) 0%, #FFFFFF 100%)', height: '106px' }}>
                            <button
                                onClick={() => {
                                    const payload = { genres: filterGenre, tags: filterTags, categories: filterCategories, releaseStart: dateFromRelease || null, releaseFinish: dateToRelease || null, peakCCUFrom: peakCCUFrom || null, peakCCUTo: peakCCUTo || null, priceFrom: priceFrom || null, priceTo: priceTo || null, revenueFrom: revenueFrom || null, revenueTo: revenueTo || null, publisherClass: publisherClass, publishers: publishers, developers: developers, reviewsFrom: reviewsFrom || null, reviewsTo: reviewsTo || null, positiveReviewsFrom: positiveReviewsFrom || null, positiveReviewsTo: positiveReviewsTo || null };
                                    if (onApply) onApply(payload);
                                }}
                                className="w-full max-w-[264px] h-[44px] rounded-[12px] flex items-center justify-center text-white font-medium shadow-md transition gg-gradient-btn"
                            >
                                <span className="text-[16px] font-medium font-['Onest']">{t('apply')}</span>
                            </button>
                            <button onClick={handleReset} className="w-full max-w-[264px] h-[18px] text-center text-white text-sm font-medium opacity-40 hover:opacity-100 transition-opacity font-['Onest']">
                                {t('resetFilters')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const RightFilterSidebar = ({ t, options, formState, isVisible, isCollapsed, onToggleCollapse, onApply, isFloating = false, onCloseFloating }) => {
    // Local State for filters
    const [filterGenre, setFilterGenre] = useState(formState.genre);
    const [filterTags, setFilterTags] = useState(formState.tags);
    const [filterCategories, setFilterCategories] = useState(formState.categories);
    const [filterLanguage, setFilterLanguage] = useState(formState.language);
    const [publisherClass, setPublisherClass] = useState([]);
    const [dateFromRelease, setDateFromRelease] = useState('');
    const [dateToRelease, setDateToRelease] = useState('');
    const [copiesSoldFrom, setCopiesSoldFrom] = useState('');
    const [copiesSoldTo, setCopiesSoldTo] = useState('');
    const [priceFrom, setPriceFrom] = useState('');
    const [priceTo, setPriceTo] = useState('');
    const [revenueFrom, setRevenueFrom] = useState('');
    const [revenueTo, setRevenueTo] = useState('');
    const [ratingFrom, setRatingFrom] = useState('');
    const [ratingTo, setRatingTo] = useState('');
    const [publishers, setPublishers] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [reviewsFrom, setReviewsFrom] = useState('');
    const [reviewsTo, setReviewsTo] = useState('');
    const [playtimeFrom, setPlaytimeFrom] = useState('');
    const [playtimeTo, setPlaytimeTo] = useState('');
    const [followersFrom, setFollowersFrom] = useState('');
    const [followersTo, setFollowersTo] = useState('');

    useEffect(() => {
        setFilterGenre(formState.genre);
        setFilterTags(formState.tags);
        setFilterCategories(formState.categories);
        setFilterLanguage(formState.language);
    }, [formState]);

    // NEW: Handle Reset
    const handleReset = () => {
        setFilterGenre([]);
        setFilterTags([]);
        setFilterCategories([]);
        setFilterLanguage([]);
        setPublisherClass([]);
        setDateFromRelease('');
        setDateToRelease('');
        setCopiesSoldFrom('');
        setCopiesSoldTo('');
        setPriceFrom('');
        setPriceTo('');
        setRevenueFrom('');
        setRevenueTo('');
        setRatingFrom('');
        setRatingTo('');
        setPublishers([]);
        setDevelopers([]);
        setReviewsFrom('');
        setReviewsTo('');
        setPlaytimeFrom('');
        setPlaytimeTo('');
        setFollowersFrom('');
        setFollowersTo('');
    };

    const publisherClassOptions = PUBLISHER_CLASS_OPTIONS;
    const developerOptions = DEVELOPER_OPTIONS;
    const publisherOptions = PUBLISHER_OPTIONS;

    return (
        <div className={`fixed top-16 right-6 z-50 w-96 h-[calc(100vh-96px)] flex flex-col shadow-2xl transition-all duration-200 ease-in-out transform ${isVisible && isFloating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
             {isFloating && (
                 <>
                <div className="bg-[#0A0F18] rounded-t-lg p-3 py-2 px-4 md:px-6 flex items-center justify-between border-b border-[#323640] h-12">
                    <h3 className="text-lg font-bold text-white">{t('filtersTitle')}</h3>
                    <div><button onClick={onCloseFloating} className="p-2 rounded-md text-white/70 hover:text-white"><X /></button></div>
                </div>
                <div className="bg-[#0A0F18] rounded-b-lg overflow-hidden flex-1 flex flex-col relative">
                    <div className="overflow-y-auto custom-scrollbar p-6 pb-[120px]">
                        <div className="space-y-4">
                        <div className="border-b border-[#323640] pb-4">
                            <MultiSelect label={t('genre')} options={options.genres} selected={filterGenre} onChange={setFilterGenre} onClear={() => setFilterGenre([])} placeholder={t('selectGenres')} t={t} />
                            <div className="mt-3" />
                            <MultiSelect label={t('tags')} options={options.tags} selected={filterTags} onChange={setFilterTags} onClear={() => setFilterTags([])} placeholder={t('selectTags')} t={t} />
                            <div className="mt-3" />
                            <MultiSelect label={t('categories')} options={options.categories} selected={filterCategories} onChange={setFilterCategories} onClear={() => setFilterCategories([])} placeholder={t('selectCategories')} t={t} />
                            <div className="mt-3" />
                            <MultiSelect label={t('language')} options={options.languages} selected={filterLanguage} onChange={setFilterLanguage} onClear={() => setFilterLanguage([])} placeholder={t('selectLanguage')} t={t} />
                        </div>
                        <div className="border-b border-[#323640] pb-4">
                            <MultiSelect label={t('publisherClass')} options={publisherClassOptions} selected={publisherClass} onChange={setPublisherClass} onClear={() => setPublisherClass([])} placeholder={t('selectPublisherClass')} t={t} />
                        </div>
                        <div className="border-b border-[#323640] pb-4">
                            <label className="text-sm font-semibold text-white/70 block mb-2">{t('releaseDate')}</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-white/70 text-xs mb-1">{t('fromD')}</label>
                                    <input
                                        type="date"
                                        value={dateFromRelease}
                                        onChange={(e) => setDateFromRelease(e.target.value)}
                                        className="w-full bg-[#191D28] border border-[#323640] rounded-lg p-2 text-white/80 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC132]"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-white/70 text-xs mb-1">{t('toD')}</label>
                                    <input
                                        type="date"
                                        value={dateToRelease}
                                        onChange={(e) => setDateToRelease(e.target.value)}
                                        className="w-full bg-[#191D28] border border-[#323640] rounded-lg p-2 text-white/80 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC132]"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="border-b border-[#323640] pb-4 space-y-3">
                            <RangeInput label={t('copiesSold')} fromValue={copiesSoldFrom} toValue={copiesSoldTo} onFromChange={setCopiesSoldFrom} onToChange={setCopiesSoldTo} t={t} />
                            <RangeInput label={t('price')} fromValue={priceFrom} toValue={priceTo} onFromChange={setPriceFrom} onToChange={setPriceTo} t={t} />
                            <RangeInput label={t('revenue')} fromValue={revenueFrom} toValue={revenueTo} onFromChange={setRevenueFrom} onToChange={setRevenueTo} t={t} />
                            <RangeInput label={t('playerRating')} fromValue={ratingFrom} toValue={ratingTo} onFromChange={setRatingFrom} onToChange={setRatingTo} t={t} />
                        </div>
                        <div className="border-b border-[#323640] pb-4">
                            <MultiSelect label={t('publisher')} options={publisherOptions} selected={publishers} onChange={setPublishers} onClear={() => setPublishers([])} placeholder={t('selectPublisher')} t={t} />
                            <div className="mt-3" />
                            <MultiSelect label={t('developer')} options={developerOptions} selected={developers} onChange={setDevelopers} onClear={() => setDevelopers([])} placeholder={t('selectDeveloper')} t={t} />
                        </div>
                        <div className="border-b border-[#323640] pb-4 space-y-3">
                            <RangeInput label={t('reviewCount')} fromValue={reviewsFrom} toValue={reviewsTo} onFromChange={setReviewsFrom} onToChange={setReviewsTo} t={t} />
                            <RangeInput label={t('averagePlaytime')} fromValue={playtimeFrom} toValue={playtimeTo} onFromChange={setPlaytimeFrom} onToChange={setPlaytimeTo} t={t} />
                            <RangeInput label={t('followerCount')} fromValue={followersFrom} toValue={followersTo} onFromChange={setFollowersFrom} onToChange={setFollowersTo} t={t} />
                        </div>
                        </div>
                    </div>
                    
                    {/* -- UPDATED BOTTOM BAR with Reset Button -- */}
                    <div 
                        className="absolute bottom-0 w-full flex flex-col justify-end items-center gap-3 p-4"
                        style={{ background: 'linear-gradient(180deg, rgba(244, 246, 251, 0) 0%, #FFFFFF 100%)', height: '106px' }}
                    >
                        <button
                            onClick={() => {
                                const payload = { genres: filterGenre, tags: filterTags, categories: filterCategories, languages: filterLanguage, publisherClass: publisherClass, releaseStart: dateFromRelease || null, releaseFinish: dateToRelease || null, copiesSoldFrom: copiesSoldFrom || null, copiesSoldTo: copiesSoldTo || null, priceFrom: priceFrom || null, priceTo: priceTo || null, revenueFrom: revenueFrom || null, revenueTo: revenueTo || null, ratingFrom: ratingFrom || null, ratingTo: ratingTo || null, publishers: publishers, developers: developers, reviewsFrom: reviewsFrom || null, reviewsTo: reviewsTo || null, playtimeFrom: playtimeFrom || null, playtimeTo: playtimeTo || null, followersFrom: followersFrom || null, followersTo: followersTo || null, };
                                if (onApply) onApply(payload);
                            }}
                            className="w-full max-w-[264px] h-[44px] rounded-[12px] flex items-center justify-center text-white font-medium shadow-md transition gg-gradient-btn"
                        >
                            <span className="text-[16px] font-medium font-['Onest']">{t('apply')}</span>
                        </button>
                        <button 
                            onClick={handleReset}
                            className="w-full max-w-[264px] h-[18px] text-center text-white text-sm font-medium opacity-40 hover:opacity-100 transition-opacity font-['Onest']"
                        >
                            {t('resetFilters')}
                        </button>
                    </div>
                </div>
                </>
             )}
        </div>
    );
};



// ... (Main App component remains same, using the updated sub-components) ...
export default function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLegacyAuthRoute = ['/auth', '/register', '/forgot', '/confirm', '/reset-password'].includes(location.pathname);
    const infoGameMatch = matchPath('/info_game/:id', location.pathname);
    const isInfoGameRoute = Boolean(infoGameMatch);
    const infoGameId = infoGameMatch?.params?.id;
    const createEmptyFormState = () => ({ ideaDescription: '', genre: [], tags: [], categories: [], language: [] });
    const isAuthorized = true;
    // Р В РЎСџР В РЎвЂўР РЋРІР‚С™Р В РЎвЂўР В РЎВ Р РЋР С“Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р вЂ¦Р В Р’В° Р В Р вЂ¦Р В Р’В°Р РЋРІвЂљВ¬ Р РЋРІР‚С™Р В РЎвЂўР В РЎвЂќР В Р’ВµР В Р вЂ¦
    // ... State Hooks ...
    const [uiLanguage, setUiLanguage] = useState('en');
    const [formState, setFormState] = useState(createEmptyFormState);
    const [activeModal, setActiveModal] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAutofilling, setIsAutofilling] = useState(false);
    const [autoFillError, setAutoFillError] = useState(null);
    const [activeTab, setActiveTab] = useState('landing'); 
    const [isAnalyzed, setIsAnalyzed] = useState(false); 
    const [isLoadingCompetitorsData, setIsLoadingCompetitorsData] = useState(false);
    const [isLoadingIdeaData, setIsLoadingIdeaData] = useState(false);
    const [validationToast, setValidationToast] = useState(null);
    const [tocItems, setTocItems] = useState([]); 
    const [activeTocId, setActiveTocId] = useState(null); 
    const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(false); 
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(true); 
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [marketData, setMarketData] = useState(null);
    const [competitorsData, setCompetitorsData] = useState(null);
    const [ideaData, setIdeaData] = useState(null);
    const [rawApiResponse, setRawApiResponse] = useState(null);
    const [lastMarketFilters, setLastMarketFilters] = useState({
        genres: [],
        tags: [],
        categories: [],
        languages: [],
    });
    const [competitorsSortOption, setCompetitorsSortOption] = useState('reviewsDesc');
    const [isCompetitorsDropdownOpen, setIsCompetitorsDropdownOpen] = useState(false);
    const [showCompetitorsFilterPopup, setShowCompetitorsFilterPopup] = useState(false);
    const [filteredCompetitorsData, setFilteredCompetitorsData] = useState(null);
    const [competitorsFilters, setCompetitorsFilters] = useState(null);
    const [projects, setProjects] = useState([]);
    const [isProjectsLoading, setIsProjectsLoading] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [expandedProjectIds, setExpandedProjectIds] = useState([]);
    const [projectAnalysesByProject, setProjectAnalysesByProject] = useState({});
    const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
    const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] = useState(false);
    const [projectSelectionForAnalysis, setProjectSelectionForAnalysis] = useState('');
    const [selectProjectModalError, setSelectProjectModalError] = useState('');
    const [projectSelectMode, setProjectSelectMode] = useState('beforeRun');
    const [projectSelectModeBeforeCreate, setProjectSelectModeBeforeCreate] = useState('beforeRun');
    const [returnToSelectAfterProjectModal, setReturnToSelectAfterProjectModal] = useState(false);
    const [hasUnsavedAnalysis, setHasUnsavedAnalysis] = useState(false);
    const [lastGameIdeaRawPayload, setLastGameIdeaRawPayload] = useState(null);
    const [useCompactLoader, setUseCompactLoader] = useState(false);
    const [createProjectModalOpenRequest, setCreateProjectModalOpenRequest] = useState(0);
    const mainContentRef = useRef(null);
    const projectSelectReturnTimeoutRef = useRef(null);
    const isAnalysisBusy = isLoading || isLoadingCompetitorsData || isLoadingIdeaData;

    useEffect(() => () => {
        if (projectSelectReturnTimeoutRef.current) {
            window.clearTimeout(projectSelectReturnTimeoutRef.current);
            projectSelectReturnTimeoutRef.current = null;
        }
    }, []);

    const t = useCallback((key) => { return i18n[uiLanguage][key] || i18n['en'][key] || key; }, [uiLanguage]);
    const tabTooltipText = useMemo(() => {
        if (activeTab === 'market') return t('marketSubtitle');
        if (activeTab === 'competitors') return t('competitorsSubtitle');
        if (activeTab === 'idea') return t('ideaSubtitle');
        if (activeTab === 'pitch') return t('pitchSubtitle');
        return '';
    }, [activeTab, t]);
    const isUnauthorizedError = useCallback((error) => {
        const message = String(error?.message || '').toLowerCase();
        return error?.code === 'UNAUTHORIZED' || message.includes('unauthorized') || message.includes('session expired') || message.includes('forbidden');
    }, []);
    const redirectToAuthRequired = useCallback(() => {
        setValidationToast({ message: t('authRequiredToast'), type: 'error' });
        navigate(`/?tab=landing&lang=${uiLanguage}`, { replace: true });
    }, [navigate, t, uiLanguage]);
    const loadProjects = useCallback(async () => {
        if (!isAuthorized) return;

        setIsProjectsLoading(true);
        try {
            const items = await fetchUserProjects();
            const normalized = Array.isArray(items) ? items : [];

            setProjects(normalized);
            setSelectedProjectId((prev) => {
                if (prev && normalized.some((project) => project.id === prev)) {
                    return prev;
                }
                return normalized[0]?.id || null;
            });
            setProjectSelectionForAnalysis((prev) => {
                if (prev && normalized.some((project) => project.id === prev)) {
                    return prev;
                }
                return normalized[0]?.id || '';
            });
            setExpandedProjectIds([]);

            if (normalized.length === 0) {
                setProjectAnalysesByProject({});
                return;
            }

            setProjectAnalysesByProject(
                normalized.reduce((acc, project) => {
                    acc[project.id] = { items: [], loading: true, loaded: false, error: '' };
                    return acc;
                }, {})
            );

            const analysesEntries = await Promise.all(
                normalized.map(async (project) => {
                    try {
                        const analyses = await fetchProjectAnalyses(project.id);
                        return {
                            projectId: project.id,
                            state: {
                                items: Array.isArray(analyses) ? analyses : [],
                                loading: false,
                                loaded: true,
                                error: '',
                            },
                        };
                    } catch (error) {
                        if (isUnauthorizedError(error)) {
                            throw error;
                        }
                        return {
                            projectId: project.id,
                            state: {
                                items: [],
                                loading: false,
                                loaded: false,
                                error: error?.message || t('projectsLoadFailed'),
                            },
                        };
                    }
                })
            );

            setProjectAnalysesByProject(
                analysesEntries.reduce((acc, entry) => {
                    acc[entry.projectId] = entry.state;
                    return acc;
                }, {})
            );
        } catch (error) {
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                return;
            }
            setProjects([]);
            setSelectedProjectId(null);
            setExpandedProjectIds([]);
            setProjectAnalysesByProject({});
            setSelectedAnalysisId(null);
            setValidationToast({ message: t('projectsLoadFailed'), type: 'error' });
            console.error('Failed to load projects:', error);
        } finally {
            setIsProjectsLoading(false);
        }
    }, [isAuthorized, isUnauthorizedError, redirectToAuthRequired, t]);
    const handleProjectToggle = useCallback((projectId) => {
        if (!projectId) return;
        setSelectedProjectId(projectId);

        const isExpanded = expandedProjectIds.includes(projectId);
        setExpandedProjectIds(isExpanded ? [] : [projectId]);
    }, [expandedProjectIds]);
    const handleCreateProject = useCallback(async (projectName) => {
        const normalizedName = projectName.trim();
        if (!normalizedName) {
            throw new Error(t('projectNameRequired'));
        }

        try {
            const createdProject = await createUserProject(normalizedName);
            const nextProject = { id: createdProject.id, name: createdProject.name };
            setProjects((prev) => [nextProject, ...prev]);
            setSelectedProjectId(nextProject.id);
            setExpandedProjectIds([nextProject.id]);
            setProjectSelectionForAnalysis(nextProject.id);
            setProjectAnalysesByProject((prev) => ({
                ...prev,
                [nextProject.id]: {
                    items: [],
                    loading: false,
                    loaded: true,
                    error: '',
                },
            }));
            return nextProject;
        } catch (error) {
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                throw new Error(t('authRequiredToast'));
            }
            throw error;
        }
    }, [isUnauthorizedError, redirectToAuthRequired, t]);
    const handleRenameProject = useCallback(async (projectId, name) => {
        const normalized = String(name || '').trim();
        if (!normalized) {
            throw new Error(t('projectNameRequired'));
        }

        try {
            const updated = await renameUserProject({ projectId, name: normalized });
            setProjects((prev) => prev.map((project) => (
                project.id === projectId ? { ...project, name: updated.name } : project
            )));
            setValidationToast({ message: t('projectRenamedSuccess'), type: 'success' });
            return updated;
        } catch (error) {
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                throw new Error(t('authRequiredToast'));
            }
            throw new Error(error?.message || t('projectRenameFailed'));
        }
    }, [isUnauthorizedError, redirectToAuthRequired, t]);
    const handleDeleteProject = useCallback(async (projectId) => {
        try {
            await deleteUserProject(projectId);
            const remainingProjects = projects.filter((project) => project.id !== projectId);
            setProjects(remainingProjects);
            setProjectAnalysesByProject((prev) => {
                const next = { ...prev };
                delete next[projectId];
                return next;
            });
            setExpandedProjectIds((prev) => prev.filter((id) => id !== projectId));
            setSelectedProjectId((prev) => {
                if (prev !== projectId) return prev;
                return remainingProjects[0]?.id || null;
            });
            setProjectSelectionForAnalysis((prev) => {
                if (prev !== projectId) return prev;
                return remainingProjects[0]?.id || '';
            });
            if (selectedAnalysisId && !remainingProjects.some((project) => {
                const analyses = projectAnalysesByProject[project.id]?.items || [];
                return analyses.some((analysis) => analysis.id === selectedAnalysisId);
            })) {
                setSelectedAnalysisId(null);
            }
            setValidationToast({ message: t('projectDeletedSuccess'), type: 'success' });
        } catch (error) {
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                throw new Error(t('authRequiredToast'));
            }
            throw new Error(error?.message || t('projectDeleteFailed'));
        }
    }, [isUnauthorizedError, redirectToAuthRequired, t, projects, selectedAnalysisId, projectAnalysesByProject]);
    const handleRenameAnalysis = useCallback(async ({ analysisId, projectId, name }) => {
        const normalized = String(name || '').trim();
        if (!normalized) {
            throw new Error(t('projectNameRequired'));
        }

        try {
            const updated = await renameUserAnalysis({ analysisId, name: normalized });
            setProjectAnalysesByProject((prev) => {
                const currentItems = Array.isArray(prev[projectId]?.items) ? prev[projectId].items : [];
                return {
                    ...prev,
                    [projectId]: {
                        ...(prev[projectId] || {}),
                        items: currentItems.map((analysis) => (
                            analysis.id === analysisId ? { ...analysis, name: updated.name } : analysis
                        )),
                        loading: false,
                        loaded: true,
                        error: '',
                    },
                };
            });
            setValidationToast({ message: t('analysisRenamedSuccess'), type: 'success' });
            return updated;
        } catch (error) {
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                throw new Error(t('authRequiredToast'));
            }
            throw new Error(error?.message || t('analysisRenameFailed'));
        }
    }, [isUnauthorizedError, redirectToAuthRequired, t]);
    const handleDeleteAnalysis = useCallback(async ({ analysisId, projectId }) => {
        try {
            await deleteUserAnalysis(analysisId);
            setProjectAnalysesByProject((prev) => {
                const currentItems = Array.isArray(prev[projectId]?.items) ? prev[projectId].items : [];
                return {
                    ...prev,
                    [projectId]: {
                        ...(prev[projectId] || {}),
                        items: currentItems.filter((analysis) => analysis.id !== analysisId),
                        loading: false,
                        loaded: true,
                        error: '',
                    },
                };
            });
            if (selectedAnalysisId === analysisId) {
                setSelectedAnalysisId(null);
            }
            setValidationToast({ message: t('analysisDeletedSuccess'), type: 'success' });
        } catch (error) {
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                throw new Error(t('authRequiredToast'));
            }
            throw new Error(error?.message || t('analysisDeleteFailed'));
        }
    }, [isUnauthorizedError, redirectToAuthRequired, t, selectedAnalysisId]);
    const buildAnalysisName = useCallback((descriptionText) => {
        const normalized = String(descriptionText || '').trim().replace(/\s+/g, ' ');
        if (!normalized) {
            return t('analysisDefaultName');
        }
        const trimmed = normalized.slice(0, 20);
        return `${trimmed}...`;
    }, [t]);

    const handleLanguageChange = (nextLang) => {
        setUiLanguage(nextLang);
        const params = new URLSearchParams(location.search);
        params.set('lang', nextLang);
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };
    const handleInfoSidebarNav = useCallback((tabId) => {
        const params = new URLSearchParams();
        params.set('tab', tabId);
        params.set('lang', uiLanguage);
        navigate(`/?${params.toString()}`);
    }, [navigate, uiLanguage]);
    // ... Handlers (handleSetFormState, handleAutofill, enrichWithMockData, handleFormSubmit, handleFilterApply) same as before ...
    const handleSetFormState = (key, value) => { setFormState(prev => ({ ...prev, [key]: value })); };
    const isFormValid = useMemo(() => { return formState.ideaDescription.trim().length > 10 && formState.genre.length > 0 && formState.language.length > 0; }, [formState.ideaDescription, formState.genre, formState.language]);
    const selectOptions = useMemo(() => ({
        genres: GENRES,
        tags: TAGS,
        categories: CATEGORIES,
        languages: LANGUAGES,
    }), []);
    const handleClearAll = () => {
        setFormState(prev => ({ ...prev, ...createEmptyFormState() }));
        setHasUnsavedAnalysis(false);
    };
    const handleAutofill = async () => {
        if (!formState.ideaDescription) return;
        setIsAutofilling(true); setAutoFillError(null);
        try { await new Promise(resolve => setTimeout(resolve, 1000)); setFormState(prev => ({ ...prev, genre: ['RPG'], tags: ['Fantasy', 'Open World'], categories: ['Single-player'], language: ['English'], })); } catch (error) { setAutoFillError(t('autofillError')); }
        setIsAutofilling(false);
    };

    const enrichWithMockData = (rawResponse, uiLanguage) => { // Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР В Р’В»Р В РЎвЂ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР В Р’В°Р В РЎВР В Р’ВµР РЋРІР‚С™Р РЋР вЂљ uiLanguage
        if (Array.isArray(rawResponse) && rawResponse.length >= 2) {
            const langKey = uiLanguage === 'ru' ? 'ru' : 'eng'; // Р В РІР‚в„ўР РЋРІР‚в„–Р В Р’В±Р В РЎвЂўР РЋР вЂљ Р В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’В° Р В Р вЂ¦Р В Р’В° Р В РЎвЂўР РЋР С“Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’Вµ uiLanguage ('en' -> 'eng')
            const langData = rawResponse[0][langKey]; // Р В РІР‚СњР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В РўвЂР В Р’В»Р РЋР РЏ Р В Р вЂ Р РЋРІР‚в„–Р В Р’В±Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р РЋР РЏР В Р’В·Р РЋРІР‚в„–Р В РЎвЂќР В Р’В°
            const metricsData = rawResponse[1]; // Р В РЎС™Р В Р’ВµР РЋРІР‚С™Р РЋР вЂљР В РЎвЂР В РЎвЂќР В РЎвЂ Р В Р вЂ¦Р В Р’Вµ Р В Р’В·Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋР С“Р РЋР РЏР РЋРІР‚С™ Р В РЎвЂўР РЋРІР‚С™ Р РЋР РЏР В Р’В·Р РЋРІР‚в„–Р В РЎвЂќР В Р’В°
            if (!langData) {
                console.error(`Language data for "${langKey}" not found in response.`);
                return { plots: [], metrics: {}, intro: { description: t('marketSubtitle') } }; // Fallback Р В Р вЂ¦Р В Р’В° Р В РЎвЂ”Р РЋРЎвЂњР РЋР С“Р РЋРІР‚С™Р РЋРІР‚в„–Р В Р’Вµ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ
            }
            return {
                plots: langData.plots || [],
                metrics: {
                    foundGames: metricsData.games_count?.toLocaleString() || '-',
                    totalCCU: metricsData.total_ccu?.toLocaleString() || '-',
                    // medianCCU: metricsData.median_peak_ccu?.toFixed(0) || '-',
                    // avgCCU: metricsData.avg_peak_ccu?.toFixed(0) || '-',
                    avMedCCU: `${metricsData.avg_peak_ccu?.toFixed(0)  || '-'} / ${metricsData.median_peak_ccu?.toFixed(0) || '-'}`,
                    totalRevenue: `$${Math.round(metricsData.total_revenue)?.toLocaleString() || '-'}`,
                    medianRevenue: `$${metricsData.median_revenue?.toLocaleString() || '-'}`,
                    avgRevenue: `$${Math.round(metricsData.avg_revenue)?.toLocaleString() || '-'}`,
                    medianPrice: `$${metricsData.median_price?.toFixed(2) || '-'}`,
                    avgPrice: `$${metricsData.avg_price?.toFixed(2) || '-'}`,
                    minMaxPrice: `$${metricsData.min_price?.toFixed(2) || '-'} / $${metricsData.max_price?.toFixed(2) || '-'}`,
                    avgReviewScore: `${metricsData.avg_review_score?.toFixed(1) || '-'} / 100`,
                    avgPositiveReviews: metricsData.avg_positive_reviews?.toFixed(0) || '-',
                    avgNegativeReviews: metricsData.avg_negative_reviews?.toFixed(0) || '-',
                    avgPositiveRatio: `${metricsData.avg_positive_ratio?.toFixed(1) || '-'}%`
                },
                intro: { description: t('marketSubtitle') }
            };
        }
        // Fallback for old format or error
        const fullStructure = {
            intro: { description: t('marketSubtitle') },
            metrics: { foundGames: "0", avMedCCU: "0/0", totalCCU: "0", totalRevenue: "$0", medianRevenue: "$0", avgRevenue: "$0", medianPrice: "$0.00", avgPrice: "$0.00", minMaxPrice: "$0.00 / $0.00", avgReviewScore: "0", avgPositiveReviews: "0", avgNegativeReviews: "0", avgPositiveRatio: "0%" },
            plots: []
        };
        let plots = [];
        if (Array.isArray(rawResponse)) { plots = rawResponse; } else if (rawResponse && rawResponse.plots) { plots = rawResponse.plots; if(rawResponse.metrics) fullStructure.metrics = rawResponse.metrics; if(rawResponse.intro) fullStructure.intro = rawResponse.intro; } else if (rawResponse && rawResponse.result) { plots = rawResponse.result; }
        fullStructure.plots = plots.map(p => ({ ...p, description: p.description || t('defaultPlotDescription') })); // Р В РІР‚вЂќР В Р’В°Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В° hardcoded Р В Р вЂ¦Р В Р’В° t() Р В РўвЂР В Р’В»Р РЋР РЏ Р В Р’В»Р В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ Р В РўвЂР В Р’ВµР РЋРІР‚С›Р В РЎвЂўР В Р’В»Р РЋРІР‚С™Р В Р’В°
        return fullStructure;
    };

    const buildAnalysisPayload = useCallback(({
        chartsRaw,
        marketEnriched,
        gameIdeaRaw,
        competitors,
        ideaAnalysis,
        language = uiLanguage,
        formStateOverride = null,
    }) => {
        const sourceFormState = formStateOverride || formState;
        return {
            ideaJson: {
                chartsRaw: chartsRaw || null,
                marketEnriched: marketEnriched || null,
                gameIdeaRaw: gameIdeaRaw || {
                    competitors: competitors || null,
                    idea_analysis: ideaAnalysis || null,
                    source: 'derived',
                },
                competitors: competitors || null,
                ideaAnalysis: ideaAnalysis || null,
                savedAt: new Date().toISOString(),
                uiLanguage: language,
            },
            gameJson: {
                uiLanguage: language,
                formState: {
                    ideaDescription: sourceFormState.ideaDescription || '',
                    genre: Array.isArray(sourceFormState.genre) ? sourceFormState.genre : [],
                    tags: Array.isArray(sourceFormState.tags) ? sourceFormState.tags : [],
                    categories: Array.isArray(sourceFormState.categories) ? sourceFormState.categories : [],
                    language: Array.isArray(sourceFormState.language) ? sourceFormState.language : [],
                },
            },
        };
    }, [formState, uiLanguage]);
    const persistAnalysisToProject = useCallback(async ({ targetProjectId, analysisName, ideaJson, gameJson }) => {
        const createdAnalysis = await createProjectAnalysis({
            projectId: targetProjectId,
            name: analysisName,
        });

        await saveProjectAnalysis({
            analysisId: createdAnalysis.id,
            ideaJson,
            gameJson,
        });

        setSelectedProjectId(targetProjectId);
        setSelectedAnalysisId(createdAnalysis.id);
        setExpandedProjectIds([targetProjectId]);
        setProjectAnalysesByProject((prev) => {
            const currentItems = Array.isArray(prev[targetProjectId]?.items) ? prev[targetProjectId].items : [];
            const nextItem = {
                id: createdAnalysis.id,
                name: createdAnalysis.name,
                is_locked: Boolean(createdAnalysis.is_locked),
            };
            const deduped = [nextItem, ...currentItems.filter((item) => item.id !== nextItem.id)];
            return {
                ...prev,
                [targetProjectId]: {
                    items: deduped,
                    loading: false,
                    loaded: true,
                    error: '',
                },
            };
        });

        return createdAnalysis;
    }, []);
    const handleOpenProjectSelectModal = () => {
        const defaultProjectId = projects.some((project) => project.id === selectedProjectId)
            ? selectedProjectId
            : (projects[0]?.id || '');
        setProjectSelectionForAnalysis(defaultProjectId);
        setSelectProjectModalError('');
        setProjectSelectMode('beforeRun');
        setIsSelectProjectModalOpen(true);
    };
    const handleOpenSaveUnsavedAnalysisModal = () => {
        if (!projects.length) {
            setValidationToast({ message: t('analysisAttachNoProjects'), type: 'error' });
            return;
        }
        if (!hasUnsavedAnalysis) return;
        const defaultProjectId = projects.some((project) => project.id === selectedProjectId)
            ? selectedProjectId
            : projects[0].id;
        setProjectSelectionForAnalysis(defaultProjectId);
        setSelectProjectModalError('');
        setProjectSelectMode('saveUnsaved');
        setIsSelectProjectModalOpen(true);
    };
    const handleCloseProjectSelectModal = () => {
        if (isAnalysisBusy) return;
        setIsSelectProjectModalOpen(false);
        setSelectProjectModalError('');
        setProjectSelectMode('beforeRun');
    };
    const handleCreateProjectFromSelectModal = () => {
        setProjectSelectModeBeforeCreate(projectSelectMode);
        setReturnToSelectAfterProjectModal(true);
        setIsSelectProjectModalOpen(false);
        setSelectProjectModalError('');
        setCreateProjectModalOpenRequest((prev) => prev + 1);
    };
    const handleProjectCreateModalComplete = useCallback((createdProject = null) => {
        if (!returnToSelectAfterProjectModal) return;

        if (projectSelectReturnTimeoutRef.current) {
            window.clearTimeout(projectSelectReturnTimeoutRef.current);
            projectSelectReturnTimeoutRef.current = null;
        }

        setProjectSelectionForAnalysis((prev) => createdProject?.id || prev || projects[0]?.id || '');
        setSelectProjectModalError('');
        setProjectSelectMode(projectSelectModeBeforeCreate);
        setReturnToSelectAfterProjectModal(false);
        setProjectSelectModeBeforeCreate('beforeRun');

        projectSelectReturnTimeoutRef.current = window.setTimeout(() => {
            setIsSelectProjectModalOpen(true);
            projectSelectReturnTimeoutRef.current = null;
        }, 120);
    }, [projectSelectModeBeforeCreate, projects, returnToSelectAfterProjectModal]);
    const handleAnalysisSelect = async (analysisId, projectId) => {
        if (!analysisId || !projectId) return;
        setSelectedProjectId(projectId);
        setSelectedAnalysisId(analysisId);

        try {
            const analysis = await fetchAnalysisById(analysisId);
            const storedIdea = analysis?.idea_json || {};
            const storedGame = analysis?.game_json || {};
            const storedForm = storedGame?.formState || storedGame?.form_state || storedGame || {};
            const analysisLanguage = (storedGame?.uiLanguage === 'ru' || storedGame?.uiLanguage === 'en')
                ? storedGame.uiLanguage
                : uiLanguage;

            setFormState({
                ideaDescription: typeof storedForm.ideaDescription === 'string' ? storedForm.ideaDescription : '',
                genre: Array.isArray(storedForm.genre) ? storedForm.genre : [],
                tags: Array.isArray(storedForm.tags) ? storedForm.tags : [],
                categories: Array.isArray(storedForm.categories) ? storedForm.categories : [],
                language: Array.isArray(storedForm.language) ? storedForm.language : [],
            });

            if (storedIdea.chartsRaw) {
                const enrichedFromRaw = enrichWithMockData(storedIdea.chartsRaw, analysisLanguage);
                setRawApiResponse(storedIdea.chartsRaw);
                setApiResponse(enrichedFromRaw);
                setMarketData(enrichedFromRaw);
            } else if (storedIdea.marketEnriched) {
                setRawApiResponse(null);
                setApiResponse(storedIdea.marketEnriched);
                setMarketData(storedIdea.marketEnriched);
            } else {
                setApiResponse(null);
                setRawApiResponse(null);
                setMarketData(null);
            }

            setCompetitorsData(storedIdea.competitors || null);
            setIdeaData(storedIdea.ideaAnalysis || null);
            setLastGameIdeaRawPayload(storedIdea.gameIdeaRaw || null);
            setFilteredCompetitorsData(null);
            setCompetitorsFilters(null);
            setIsAnalyzed(Boolean(storedIdea.chartsRaw || storedIdea.marketEnriched || storedIdea.competitors || storedIdea.ideaAnalysis));
            setHasUnsavedAnalysis(false);
            const targetTab = 'description';
            setActiveTab(targetTab);

            if (isInfoGameRoute) {
                navigate(`/?tab=${targetTab}&lang=${uiLanguage}`);
            }
        } catch (error) {
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                return;
            }
            setValidationToast({ message: error?.message || t('analysisSaveFailed'), type: 'error' });
        }
    };
    const handleFormSubmit = async ({ targetProjectId = null, shouldSave = true } = {}) => {
        if (isLoading || isLoadingCompetitorsData || isLoadingIdeaData) return;
        if (shouldSave && !targetProjectId) {
            throw new Error(t('analysisAttachRequired'));
        }

        setUseCompactLoader(false);
        setIsLoading(true);
        setApiResponse(null);
        setTocItems([]);
        setIsLoadingCompetitorsData(true);
        setIsLoadingIdeaData(true);
        setCompetitorsData(null);
        setIdeaData(null);
        setLastGameIdeaRawPayload(null);
        setFilteredCompetitorsData(null);
        setCompetitorsFilters(null);
        setSelectProjectModalError('');

        const runLanguage = uiLanguage;
        const runFormState = {
            ideaDescription: formState.ideaDescription || '',
            genre: Array.isArray(formState.genre) ? [...formState.genre] : [],
            tags: Array.isArray(formState.tags) ? [...formState.tags] : [],
            categories: Array.isArray(formState.categories) ? [...formState.categories] : [],
            language: Array.isArray(formState.language) ? [...formState.language] : [],
        };
        const analysisName = buildAnalysisName(runFormState.ideaDescription);

        let chartsData = null;
        let enrichedData = null;

        try {
            const marketPayload = {
                description: runFormState.ideaDescription,
                genres: runFormState.genre,
                tags: runFormState.tags,
                categories: runFormState.categories,
                languages: runFormState.language,
                appLanguage: runLanguage,
            };

            Object.keys(formState).forEach((key) => {
                if (!['ideaDescription', 'genre', 'tags', 'categories', 'language'].includes(key)) {
                    marketPayload[key] = formState[key];
                }
            });

            const chartsResponse = await apiRequest('/analyze_charts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(marketPayload),
            });
            if (!chartsResponse.ok) {
                if (chartsResponse.status === 401 || chartsResponse.status === 403) {
                    const authError = new Error('Unauthorized');
                    authError.code = 'UNAUTHORIZED';
                    throw authError;
                }
                throw new Error(`Server error: ${chartsResponse.status}`);
            }

            chartsData = await chartsResponse.json();
            setLastMarketFilters({
                genres: Array.isArray(marketPayload.genres) ? marketPayload.genres : [],
                tags: Array.isArray(marketPayload.tags) ? marketPayload.tags : [],
                categories: Array.isArray(marketPayload.categories) ? marketPayload.categories : [],
                languages: Array.isArray(marketPayload.languages) ? marketPayload.languages : [],
            });
            setRawApiResponse(chartsData);
            enrichedData = enrichWithMockData(chartsData, runLanguage);
            setApiResponse(enrichedData);
            setMarketData(enrichedData);
        } catch (error) {
            console.error('Analysis failed:', error);
            setIsLoading(false);
            setIsLoadingCompetitorsData(false);
            setIsLoadingIdeaData(false);
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                return;
            }
            setValidationToast({ message: error?.message || t('analysisSaveFailed'), type: 'error' });
            throw error;
        }

        setIsLoading(false);
        setIsAnalyzed(true);
        setActiveTab('market');
        setTimeout(() => { mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);

        const analysisCreationPromise = shouldSave
            ? (async () => {
                try {
                    const initialPayload = buildAnalysisPayload({
                        chartsRaw: chartsData,
                        marketEnriched: enrichedData,
                        gameIdeaRaw: null,
                        competitors: null,
                        ideaAnalysis: null,
                        language: runLanguage,
                        formStateOverride: runFormState,
                    });
                    const createdAnalysis = await persistAnalysisToProject({
                        targetProjectId,
                        analysisName,
                        ideaJson: initialPayload.ideaJson,
                        gameJson: initialPayload.gameJson,
                    });
                    setHasUnsavedAnalysis(false);
                    return createdAnalysis;
                } catch (error) {
                    if (isUnauthorizedError(error)) {
                        redirectToAuthRequired();
                        return null;
                    }
                    setHasUnsavedAnalysis(true);
                    setValidationToast({ message: error?.message || t('analysisSaveFailed'), type: 'error' });
                    return null;
                }
            })()
            : Promise.resolve(null);

        if (!shouldSave) {
            setSelectedAnalysisId(null);
            setHasUnsavedAnalysis(true);
        }

        void (async () => {
            let competitorsPayload = null;
            let ideaPayload = null;
            let gameIdeaRawPayload = null;

            try {
                const gameIdeaPayload = {
                    idea: runFormState.ideaDescription,
                    tags: runFormState.tags,
                    language: runLanguage === 'ru' ? 'ru' : 'en',
                    min_reviews: 0,
                    min_review_score: 0,
                    min_revenue: 0,
                    min_semantic_score: 0.8,
                    popularity_weight: 0.1,
                    limit: 100,
                };

                const gameIdeaResponse = await apiRequest('/analyze_game_idea', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gameIdeaPayload),
                });
                if (!gameIdeaResponse.ok) {
                    if (gameIdeaResponse.status === 401 || gameIdeaResponse.status === 403) {
                        const authError = new Error('Unauthorized');
                        authError.code = 'UNAUTHORIZED';
                        throw authError;
                    }
                    throw new Error(`HTTP error ${gameIdeaResponse.status}`);
                }

                const contentType = (gameIdeaResponse.headers.get('content-type') || '').toLowerCase();
                if (!contentType.includes('text/event-stream') || !gameIdeaResponse.body) {
                    const data = await gameIdeaResponse.json();
                    gameIdeaRawPayload = data;
                    competitorsPayload = data.competitors || null;
                    ideaPayload = isIdeaAnalysisPayloadUsable(data.idea_analysis)
                        ? data.idea_analysis
                        : buildMockIdeaAnalysisPayload(runLanguage);

                    if (competitorsPayload) {
                        setCompetitorsData(competitorsPayload);
                    }
                    if (ideaPayload) {
                        setIdeaData(ideaPayload);
                    }

                    setIsLoadingCompetitorsData(false);
                    setIsLoadingIdeaData(false);
                } else {
                    const reader = gameIdeaResponse.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    const handleSsePayload = (payload) => {
                        if (!payload || typeof payload !== 'object') return;

                        if (payload.event === 'function1_complete') {
                            if (payload.data?.competitors) {
                                competitorsPayload = payload.data.competitors;
                                setCompetitorsData(payload.data.competitors);
                                setIsLoadingCompetitorsData(false);
                            }
                            return;
                        }

                        if (payload.event === 'function2_complete') {
                            ideaPayload = isIdeaAnalysisPayloadUsable(payload.data)
                                ? payload.data
                                : buildMockIdeaAnalysisPayload(runLanguage);
                            setIdeaData(ideaPayload);
                            setIsLoadingIdeaData(false);
                            return;
                        }

                        if (payload.event === 'error') {
                            if (payload.step === 2) {
                                console.warn('analyze_game_idea step 2 error:', payload.message);
                                ideaPayload = buildMockIdeaAnalysisPayload(runLanguage);
                                setIdeaData(ideaPayload);
                                setIsLoadingIdeaData(false);
                                return;
                            }
                            throw new Error(payload.message || 'analyze_game_idea stream error');
                        }
                    };

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const chunks = buffer.split(/\r?\n\r?\n/);
                        buffer = chunks.pop() || '';

                        for (const chunk of chunks) {
                            const dataLine = chunk
                                .split(/\r?\n/)
                                .filter((line) => line.startsWith('data:'))
                                .map((line) => line.slice(5).trim())
                                .join('');

                            if (!dataLine) continue;

                            let parsedPayload = null;
                            try {
                                parsedPayload = JSON.parse(dataLine);
                            } catch (parseError) {
                                console.warn('Failed to parse SSE payload from analyze_game_idea:', parseError);
                                continue;
                            }
                            handleSsePayload(parsedPayload);
                        }
                    }

                    const tail = buffer.trim();
                    if (tail.startsWith('data:')) {
                        const maybeJson = tail.replace(/^data:\s*/, '');
                        let parsedPayload = null;
                        try {
                            parsedPayload = JSON.parse(maybeJson);
                        } catch (parseError) {
                            console.warn('Failed to parse trailing SSE payload from analyze_game_idea:', parseError);
                        }
                        if (parsedPayload) {
                            handleSsePayload(parsedPayload);
                        }
                    }

                    if (!isIdeaAnalysisPayloadUsable(ideaPayload)) {
                        ideaPayload = buildMockIdeaAnalysisPayload(runLanguage);
                        setIdeaData(ideaPayload);
                        setIsLoadingIdeaData(false);
                    }

                    gameIdeaRawPayload = {
                        competitors: competitorsPayload,
                        idea_analysis: ideaPayload,
                        source: 'sse',
                    };
                }
            } catch (error) {
                console.error('Background analyze_game_idea failed:', error);
                if (isUnauthorizedError(error)) {
                    redirectToAuthRequired();
                    return;
                }
                setValidationToast({ message: error?.message || t('analysisSaveFailed'), type: 'error' });
            } finally {
                setIsLoadingCompetitorsData(false);
                setIsLoadingIdeaData(false);
            }

            if (!gameIdeaRawPayload) {
                gameIdeaRawPayload = {
                    competitors: competitorsPayload,
                    idea_analysis: ideaPayload,
                    source: 'derived',
                };
            }
            setLastGameIdeaRawPayload(gameIdeaRawPayload);

            if (!shouldSave) {
                setHasUnsavedAnalysis(true);
                return;
            }

            const createdAnalysis = await analysisCreationPromise;
            if (!createdAnalysis?.id) {
                setHasUnsavedAnalysis(true);
                return;
            }

            try {
                const finalPayload = buildAnalysisPayload({
                    chartsRaw: chartsData,
                    marketEnriched: enrichedData,
                    gameIdeaRaw: gameIdeaRawPayload,
                    competitors: competitorsPayload,
                    ideaAnalysis: ideaPayload,
                    language: runLanguage,
                    formStateOverride: runFormState,
                });

                await saveProjectAnalysis({
                    analysisId: createdAnalysis.id,
                    ideaJson: finalPayload.ideaJson,
                    gameJson: finalPayload.gameJson,
                });

                setHasUnsavedAnalysis(false);
                setValidationToast({ message: t('analysisSavedToProject'), type: 'success' });
            } catch (error) {
                if (isUnauthorizedError(error)) {
                    redirectToAuthRequired();
                    return;
                }
                setHasUnsavedAnalysis(true);
                setValidationToast({ message: error?.message || t('analysisSaveFailed'), type: 'error' });
            }
        })();
    };
    const handleSaveUnsavedAnalysisToProject = async (targetProjectId) => {
        if (!targetProjectId) {
            throw new Error(t('analysisAttachRequired'));
        }
        if (!hasUnsavedAnalysis) {
            throw new Error(t('analysisNothingToSave'));
        }

        const hasAnyResultData = Boolean(rawApiResponse || apiResponse || competitorsData || ideaData);
        if (!hasAnyResultData) {
            throw new Error(t('analysisNothingToSave'));
        }

        setIsLoading(true);
        setUseCompactLoader(true);
        setSelectProjectModalError('');
        try {
            const analysisName = buildAnalysisName(formState.ideaDescription);
            const payload = buildAnalysisPayload({
                chartsRaw: rawApiResponse,
                marketEnriched: apiResponse || marketData,
                gameIdeaRaw: lastGameIdeaRawPayload,
                competitors: competitorsData,
                ideaAnalysis: ideaData,
                language: uiLanguage,
            });

            await persistAnalysisToProject({
                targetProjectId,
                analysisName,
                ideaJson: payload.ideaJson,
                gameJson: payload.gameJson,
            });
            setHasUnsavedAnalysis(false);
            setValidationToast({ message: t('analysisSavedToProject'), type: 'success' });
        } catch (error) {
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
                throw error;
            }
            throw new Error(error?.message || t('analysisSaveFailed'));
        } finally {
            setIsLoading(false);
            setUseCompactLoader(false);
        }
    };
    const handleRunWithoutProjectSave = async () => {
        setIsSelectProjectModalOpen(false);
        setProjectSelectMode('beforeRun');
        try {
            await handleFormSubmit({ shouldSave: false });
        } catch {
            // Errors are handled inside handleFormSubmit.
        }
    };
    const handleConfirmProjectForAnalysis = async (event) => {
        event.preventDefault();
        if (!projectSelectionForAnalysis) {
            setSelectProjectModalError(t('analysisAttachRequired'));
            return;
        }

        setIsSelectProjectModalOpen(false);
        try {
            if (projectSelectMode === 'saveUnsaved') {
                await handleSaveUnsavedAnalysisToProject(projectSelectionForAnalysis);
            } else {
                await handleFormSubmit({ targetProjectId: projectSelectionForAnalysis, shouldSave: true });
            }
        } catch {
            // Errors are handled in dedicated methods.
        } finally {
            setProjectSelectMode('beforeRun');
        }
    };
    const handleFilterApply = async (filters) => {
        if (isLoading) return;
        setUseCompactLoader(false);
        setIsLoading(true); setApiResponse(null); setTocItems([]);
        try {
            const payload = { ...filters, appLanguage: uiLanguage, };
            setLastMarketFilters({
                genres: Array.isArray(payload.genres) ? payload.genres : [],
                tags: Array.isArray(payload.tags) ? payload.tags : [],
                categories: Array.isArray(payload.categories) ? payload.categories : [],
                languages: Array.isArray(payload.languages) ? payload.languages : [],
            });
            const response = await apiRequest('/analyze_charts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const authError = new Error('Unauthorized');
                    authError.code = 'UNAUTHORIZED';
                    throw authError;
                }
                throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            setRawApiResponse(data); // Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋР С“Р РЋРІР‚в„–Р РЋР вЂљР В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂўР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋРІР‚С™
            const enrichedData = enrichWithMockData(data, uiLanguage); // Р В РЎСџР В Р’ВµР РЋР вЂљР В Р’ВµР В РўвЂР В Р’В°Р РЋРІР‚ВР В РЎВ uiLanguage
            setApiResponse(enrichedData);
            setIsAnalyzed(true); setActiveTab('market');
            setTimeout(() => { mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
        } catch (error) {
            console.error('Filter apply failed:', error);
            if (isUnauthorizedError(error)) {
                redirectToAuthRequired();
            }
        } finally { setIsLoading(false); }
    };

    /**
     * Р В РІР‚в„ўР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В РЎВР В РЎвЂўР В РЎвЂ“Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІР‚С›Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РўвЂР В Р’В»Р РЋР РЏ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР РЋР С“Р В РЎвЂР В Р вЂ¦Р В РЎвЂ“Р В Р’В° Р РЋРІР‚РЋР В РЎвЂР РЋР С“Р В Р’В»Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В РІвЂћвЂ“ Р РЋР С“ K, M Р РЋР С“Р РЋРЎвЂњР РЋРІР‚С›Р РЋРІР‚С›Р В РЎвЂР В РЎвЂќР РЋР С“Р В Р’В°Р В РЎВР В РЎвЂ
     * Р В РЎСџР РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР РЋР вЂљР РЋРІР‚в„–: "5K" -> 5000, "2.5M" -> 2500000, "100" -> 100
     * Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ "-" Р В РЎвЂР В Р’В»Р В РЎвЂ Р В РЎвЂ”Р РЋРЎвЂњР РЋР С“Р РЋРІР‚С™Р В РЎвЂў -> Р В Р вЂ Р В РЎвЂўР В Р’В·Р В Р вЂ Р РЋР вЂљР В Р’В°Р РЋРІР‚В°Р В Р’В°Р В Р’ВµР РЋРІР‚С™ null (Р В Р вЂ¦Р В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ)
     */
    /**
     * Р В РЎСџР В Р’В°Р РЋР вЂљР РЋР С“Р В РЎвЂР РЋРІР‚С™ Р РЋРІР‚РЋР В РЎвЂР РЋР С“Р В Р’В»Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В Р’Вµ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р РЋР С“ Р РЋР вЂљР В Р’В°Р В Р’В·Р В Р’В»Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р В РЎВР В РЎвЂ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р РЋРІР‚С™Р В Р’В°Р В РЎВР В РЎвЂ Р В РЎвЂ Р РЋР С“Р РЋРЎвЂњР РЋРІР‚С›Р РЋРІР‚С›Р В РЎвЂР В РЎвЂќР РЋР С“Р В Р’В°Р В РЎВР В РЎвЂ
     * Р В РЎСџР В РЎвЂўР В РўвЂР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™:
     * - "$42.30" -> 42.30
     * - "$19.9K" -> 19900
     * - "5K" -> 5000
     * - "2.5M" -> 2500000
     * - "1.2B" -> 1200000000
     * - "-" Р В РЎвЂР В Р’В»Р В РЎвЂ Р В РЎвЂ”Р РЋРЎвЂњР РЋР С“Р РЋРІР‚С™Р В РЎвЂў -> null (Р В Р вЂ¦Р В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ)
     * - "100" -> 100
     */
    const parseNumberWithSuffix = (value) => {
        if (!value || value === '-' || value.trim() === '') return null;
        
        // Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В Р вЂ Р РЋР С“Р В Р’Вµ Р В Р вЂ¦Р В Р’ВµР РЋРІР‚РЋР В РЎвЂР РЋР С“Р В Р’В»Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В Р’Вµ Р РЋР С“Р В РЎвЂР В РЎВР В Р вЂ Р В РЎвЂўР В Р’В»Р РЋРІР‚в„– Р В РЎвЂќР РЋР вЂљР В РЎвЂўР В РЎВР В Р’Вµ Р РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂќР В РЎвЂ Р В РЎвЂ Р В Р’В±Р РЋРЎвЂњР В РЎвЂќР В Р вЂ  (Р В РўвЂР В Р’В»Р РЋР РЏ K, M, B)
        // Р В РЎвЂєР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р РЋРІР‚В Р В РЎвЂР РЋРІР‚С›Р РЋР вЂљР РЋРІР‚в„–, Р РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂќР РЋРЎвЂњ Р В РЎвЂ Р В Р’В±Р РЋРЎвЂњР В РЎвЂќР В Р вЂ Р РЋРІР‚в„– K, M, B
        let str = value.toString().trim().toUpperCase();
        str = str.replace(/[^\d.KMB]/g, ''); // Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ $, Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В Р’В»Р РЋРІР‚в„– Р В РЎвЂ Р В РўвЂР РЋР вЂљР РЋРЎвЂњР В РЎвЂ“Р В РЎвЂР В Р’Вµ Р РЋР С“Р В РЎвЂР В РЎВР В Р вЂ Р В РЎвЂўР В Р’В»Р РЋРІР‚в„–
        
        if (!str) return null;
        
        let num = parseFloat(str);
        
        if (isNaN(num)) return null;
        
        if (str.includes('K')) return num * 1000;
        if (str.includes('M')) return num * 1000000;
        if (str.includes('B')) return num * 1000000000;
        
        return num;
    };

    /**
     * Р В РІР‚в„ўР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В РЎВР В РЎвЂўР В РЎвЂ“Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІР‚С›Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РўвЂР В Р’В»Р РЋР РЏ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР РЋР С“Р В РЎвЂР В Р вЂ¦Р В РЎвЂ“Р В Р’В° Р В РўвЂР В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„–
     * Р В РЎСџР В РЎвЂўР В РўвЂР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„–:
     * - "Feb 18, 2021" -> Date object
     * - "DD.MM.YYYY" -> Date object
     * - "YYYY-MM-DD" -> Date object (Р В РЎвЂР В Р’В· input type="date")
     */
    const parseDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return null;
        
        // Р В РЎСџР РЋР вЂљР В РЎвЂўР В Р’В±Р РЋРЎвЂњР В Р’ВµР В РЎВ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР РЋР С“Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂќР В Р’В°Р В РЎвЂќ "Feb 18, 2021" Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р РЋРІР‚С™
        const enDate = new Date(dateStr);
        if (!isNaN(enDate.getTime())) return enDate;
        
        // Р В РЎСџР РЋР вЂљР В РЎвЂўР В Р’В±Р РЋРЎвЂњР В Р’ВµР В РЎВ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР РЋР С“Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂќР В Р’В°Р В РЎвЂќ DD.MM.YYYY
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const date = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
            if (!isNaN(date.getTime())) return date;
        }
        
        return null;
    };

    const handleCompetitorsFilterApply = (filters) => {
        if (!competitorsData || !competitorsData.list) return;
        
        const filtered = competitorsData.list.filter(game => {
            // Р В РІР‚вЂњР В Р’В°Р В Р вЂ¦Р РЋР вЂљР РЋРІР‚в„–
            if (filters.genres && filters.genres.length > 0) {
                if (!game.genres || !filters.genres.some(g => game.genres.some(genre => genre.toLowerCase().includes(g.toLowerCase())))) {
                    return false;
                }
            }
            
            // Р В РЎС›Р РЋР РЉР В РЎвЂ“Р В РЎвЂ
            if (filters.tags && filters.tags.length > 0) {
                if (!game.tags || !filters.tags.some(tag => game.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())))) {
                    return false;
                }
            }
            
            // Р В РЎв„ўР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂўР РЋР вЂљР В РЎвЂР В РЎвЂ
            if (filters.categories && filters.categories.length > 0) {
                if (!game.categories || !filters.categories.some(cat => game.categories.some(c => c.toLowerCase().includes(cat.toLowerCase())))) {
                    return false;
                }
            }
            
            // Р В РІР‚СњР В Р’В°Р РЋРІР‚С™Р В Р’В° Р РЋР вЂљР В Р’ВµР В Р’В»Р В РЎвЂР В Р’В·Р В Р’В° (from/to)
            // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В РўвЂР В Р’В°Р РЋРІР‚С™Р В Р’В° Р РЋРЎвЂњР В РЎвЂќР В Р’В°Р В Р’В·Р В Р’В°Р В Р вЂ¦Р В Р’В° Р В Р вЂ  Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В Р’Вµ, Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В РўвЂР В Р’В°Р РЋРІР‚С™Р В Р’В° Р В РЎвЂР В РЎвЂ“Р РЋР вЂљР РЋРІР‚в„– Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В Р’В°
            if (filters.releaseStart || filters.releaseFinish) {
                const gameDate = parseDate(game.releaseDate);
                
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В РўвЂР В Р’В°Р РЋРІР‚С™Р В Р’В° Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В Р’В° - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљ
                if (gameDate !== null) {
                    if (filters.releaseStart) {
                        const fromDate = new Date(filters.releaseStart);
                        if (gameDate < fromDate) return false;
                    }
                    if (filters.releaseFinish) {
                        const toDate = new Date(filters.releaseFinish);
                        if (gameDate > toDate) return false;
                    }
                }
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В РўвЂР В Р’В°Р РЋРІР‚С™Р В Р’В° Р В Р вЂ¦Р В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В Р’В° (Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В РЎвЂќ) - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂќР РЋРЎвЂњ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р вЂ 
            }
            
            // Peak CCU (from/to)
            // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ CCU Р РЋРЎвЂњР В РЎвЂќР В Р’В°Р В Р’В·Р В Р’В°Р В Р вЂ¦ Р В Р вЂ  Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В Р’Вµ, Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў
            if (filters.peakCCUFrom !== undefined || filters.peakCCUTo !== undefined) {
                const gameCCU = parseNumberWithSuffix(game.peakCCU);
                
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљ
                if (gameCCU !== null) {
                    if (filters.peakCCUFrom !== undefined && filters.peakCCUFrom !== null && filters.peakCCUFrom !== '') {
                        const fromCCU = parseNumberWithSuffix(filters.peakCCUFrom);
                        if (fromCCU !== null && gameCCU < fromCCU) return false;
                    }
                    if (filters.peakCCUTo !== undefined && filters.peakCCUTo !== null && filters.peakCCUTo !== '') {
                        const toCCU = parseNumberWithSuffix(filters.peakCCUTo);
                        if (toCCU !== null && gameCCU > toCCU) return false;
                    }
                }
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў (Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В РЎвЂќ) - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂќР РЋРЎвЂњ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р вЂ 
            }
            
            // Publisher Class
            if (filters.publisherClass && filters.publisherClass.length > 0) {
                if (!game.publisherClass || !filters.publisherClass.includes(game.publisherClass)) {
                    return false;
                }
            }
            
            // Р В Р’В¦Р В Р’ВµР В Р вЂ¦Р В Р’В° (from/to)
            // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р В Р’В° Р РЋРЎвЂњР В РЎвЂќР В Р’В°Р В Р’В·Р В Р’В°Р В Р вЂ¦Р В Р’В° Р В Р вЂ  Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В Р’Вµ, Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў
            if (filters.priceFrom !== undefined || filters.priceTo !== undefined) {
                const gamePrice = parseNumberWithSuffix(game.price);
                
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљ
                if (gamePrice !== null) {
                    if (filters.priceFrom !== undefined && filters.priceFrom !== null && filters.priceFrom !== '') {
                        const fromPrice = parseNumberWithSuffix(filters.priceFrom);
                        if (fromPrice !== null && gamePrice < fromPrice) return false;
                    }
                    if (filters.priceTo !== undefined && filters.priceTo !== null && filters.priceTo !== '') {
                        const toPrice = parseNumberWithSuffix(filters.priceTo);
                        if (toPrice !== null && gamePrice > toPrice) return false;
                    }
                }
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў (Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В РЎвЂќ) - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂќР РЋРЎвЂњ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р вЂ 
            }
            
            // Estimated Revenue (from/to)
            // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р вЂ Р РЋРІР‚в„–Р РЋР вЂљР РЋРЎвЂњР РЋРІР‚РЋР В РЎвЂќР В Р’В° Р РЋРЎвЂњР В РЎвЂќР В Р’В°Р В Р’В·Р В Р’В°Р В Р вЂ¦Р В Р’В° Р В Р вЂ  Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В Р’Вµ, Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў
            if (filters.revenueFrom !== undefined || filters.revenueTo !== undefined) {
                const gameRevenue = parseNumberWithSuffix(game.estimatedRevenue);
                
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљ
                if (gameRevenue !== null) {
                    if (filters.revenueFrom !== undefined && filters.revenueFrom !== null && filters.revenueFrom !== '') {
                        const fromRevenue = parseNumberWithSuffix(filters.revenueFrom);
                        if (fromRevenue !== null && gameRevenue < fromRevenue) return false;
                    }
                    if (filters.revenueTo !== undefined && filters.revenueTo !== null && filters.revenueTo !== '') {
                        const toRevenue = parseNumberWithSuffix(filters.revenueTo);
                        if (toRevenue !== null && gameRevenue > toRevenue) return false;
                    }
                }
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў (Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В РЎвЂќ) - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂќР РЋРЎвЂњ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р вЂ 
            }
            
            // Publisher
            if (filters.publishers && filters.publishers.length > 0) {
                if (!game.publisher || !filters.publishers.some(p => game.publisher.toLowerCase().includes(p.toLowerCase()))) {
                    return false;
                }
            }
            
            // Developer
            if (filters.developers && filters.developers.length > 0) {
                if (!game.developer || !filters.developers.some(d => game.developer.toLowerCase().includes(d.toLowerCase()))) {
                    return false;
                }
            }
            
            // Review Count (from/to)
            // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂќР В РЎвЂўР В Р’В»Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В РЎвЂў Р В РЎвЂўР РЋРІР‚С™Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В РЎвЂўР В Р вЂ  Р РЋРЎвЂњР В РЎвЂќР В Р’В°Р В Р’В·Р В Р’В°Р В Р вЂ¦Р В РЎвЂў Р В Р вЂ  Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В Р’Вµ, Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў
            if (filters.reviewsFrom !== undefined || filters.reviewsTo !== undefined) {
                const gameReviewCount = parseNumberWithSuffix(game.reviewCount);
                
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљ
                if (gameReviewCount !== null) {
                    if (filters.reviewsFrom !== undefined && filters.reviewsFrom !== null && filters.reviewsFrom !== '') {
                        const fromReviews = parseNumberWithSuffix(filters.reviewsFrom);
                        if (fromReviews !== null && gameReviewCount < fromReviews) return false;
                    }
                    if (filters.reviewsTo !== undefined && filters.reviewsTo !== null && filters.reviewsTo !== '') {
                        const toReviews = parseNumberWithSuffix(filters.reviewsTo);
                        if (toReviews !== null && gameReviewCount > toReviews) return false;
                    }
                }
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў (Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В РЎвЂќ) - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂќР РЋРЎвЂњ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р вЂ 
            }
            
            // Positive Reviews %
            // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В РЎвЂўР В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РЎвЂўР РЋРІР‚С™Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В РЎвЂўР В Р вЂ  Р РЋРЎвЂњР В РЎвЂќР В Р’В°Р В Р’В·Р В Р’В°Р В Р вЂ¦ Р В Р вЂ  Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В Р’Вµ, Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў
            if (filters.positiveReviewsFrom !== undefined || filters.positiveReviewsTo !== undefined) {
                const gamePositivePercent = parseNumberWithSuffix(game.positiveReviewPercent);
                
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљ
                if (gamePositivePercent !== null) {
                    if (filters.positiveReviewsFrom !== undefined && filters.positiveReviewsFrom !== null && filters.positiveReviewsFrom !== '') {
                        const fromPercent = parseNumberWithSuffix(filters.positiveReviewsFrom);
                        if (fromPercent !== null && gamePositivePercent < fromPercent) return false;
                    }
                    if (filters.positiveReviewsTo !== undefined && filters.positiveReviewsTo !== null && filters.positiveReviewsTo !== '') {
                        const toPercent = parseNumberWithSuffix(filters.positiveReviewsTo);
                        if (toPercent !== null && gamePositivePercent > toPercent) return false;
                    }
                }
                // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў (Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В РЎвЂќ) - Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂќР РЋРЎвЂњ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р вЂ 
            }
            
            return true;
        });
        
        setFilteredCompetitorsData({
            ...competitorsData,
            list: filtered
        });
        setCompetitorsFilters(filters);
        setShowCompetitorsFilterPopup(false);
    };

    useEffect(() => {
        // Auto-collapse sidebar on landing page
        if (activeTab === 'landing') {
            setIsLeftCollapsed(true);
        }
    }, [activeTab]);

    useEffect(() => {
        if ((!apiResponse && activeTab === 'market') || (activeTab !== 'market' && activeTab !== 'competitors')) { setTocItems([]); setActiveTocId(null); return; }
        const timer = setTimeout(() => {
            let sections;
            if (activeTab === 'market') {
                sections = document.querySelectorAll('section[id^="plot-"]');
                if (sections.length === 0) return;
                const newTocItems = Array.from(sections).map(section => ({ id: section.id, title: section.dataset.title || section.id }));
                setTocItems(newTocItems);
            } else if (activeTab === 'competitors') {
                setTocItems([
                    { id: 'metrics', title: t('metricsOverview') },
                    { id: 'competitors', title: t('nearestCompetitors') },
                    { id: 'comparison', title: t('compCompareSection') }
                ]);
                sections = document.querySelectorAll('#metrics, #competitors, #comparison');
            }
            
            const observer = new IntersectionObserver((entries) => { 
                entries.forEach(entry => { 
                    if (entry.isIntersecting) { setActiveTocId(entry.target.id); } 
                }); 
            }, { 
                root: mainContentRef.current, 
                rootMargin: '-10% 0px -60% 0px', 
                threshold: 0 
            });
            
            sections.forEach(section => observer.observe(section));
            return () => sections.forEach(section => observer.unobserve(section));
        }, 200);
        return () => clearTimeout(timer);
    }, [activeTab, apiResponse, t]);

    useEffect(() => {
        if (rawApiResponse && activeTab === 'market') {
            const enriched = enrichWithMockData(rawApiResponse, uiLanguage);
            setApiResponse(enriched);
        }
    }, [uiLanguage, rawApiResponse, activeTab, t]); // t Р В Р’В·Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋР С“Р В РЎвЂР РЋРІР‚С™ Р В РЎвЂўР РЋРІР‚С™ uiLanguage

    useEffect(() => {
        if (!isLegacyAuthRoute) return;
        const params = new URLSearchParams(location.search);
        const lang = params.get('lang');
        const nextLang = lang === 'ru' || lang === 'en' ? lang : uiLanguage;
        navigate(`/?tab=landing&lang=${nextLang}`, { replace: true });
    }, [isLegacyAuthRoute, location.search, navigate, uiLanguage]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const toast = params.get('toast');
        const lang = params.get('lang');
        if (isLegacyAuthRoute) {
            return;
        }

        if (lang && (lang === 'ru' || lang === 'en') && lang !== uiLanguage) {
            setUiLanguage(lang);
        }

        if (tab && ['landing', 'description', 'market', 'competitors', 'idea', 'pitch'].includes(tab)) {
            setActiveTab(tab);
        }

        if (toast === 'login-success') {
            setValidationToast({ message: t('authLoginSuccessToast'), type: 'success' });
        }

        if (tab || toast || lang) {
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, location.pathname, navigate, t, uiLanguage, isLegacyAuthRoute]);
    useEffect(() => {
        if (!isAuthorized) {
            setProjects([]);
            setSelectedProjectId(null);
            setIsProjectsLoading(false);
            setExpandedProjectIds([]);
            setProjectAnalysesByProject({});
            setSelectedAnalysisId(null);
            setIsSelectProjectModalOpen(false);
            setProjectSelectionForAnalysis('');
            setSelectProjectModalError('');
            return;
        }
        void loadProjects();
    }, [isAuthorized]);

    useEffect(() => {
        let isProcessing = false; // Р В Р’В¤Р В Р’В»Р В Р’В°Р В РЎвЂ“, Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р В Р вЂ¦Р В Р’Вµ Р РЋР С“Р РЋР вЂљР В Р’В°Р В Р’В±Р В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎВР В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂўР В РЎвЂќР РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў

        const handleKeyDown = (e) => {
            // Ctrl + M (Windows/Linux) Р В РЎвЂР В Р’В»Р В РЎвЂ Cmd + M (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
                e.preventDefault(); // Р В РЎСџР РЋР вЂљР В Р’ВµР В РўвЂР В РЎвЂўР РЋРІР‚С™Р В Р вЂ Р РЋР вЂљР В Р’В°Р РЋРІР‚В°Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РўвЂР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР В Р вЂ Р В Р’ВµР В РўвЂР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ (Р В Р вЂ¦Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР РЋР вЂљ, Р В РЎвЂ”Р В РЎвЂўР В РЎвЂР РЋР С“Р В РЎвЂќ Р В Р вЂ  Р В Р’В±Р РЋР вЂљР В Р’В°Р РЋРЎвЂњР В Р’В·Р В Р’ВµР РЋР вЂљР В Р’Вµ)

                if (isProcessing) return; // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р РЋРЎвЂњР В Р’В¶Р В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р Р†Р вЂљРІР‚Сњ Р В РЎвЂР В РЎвЂ“Р В Р вЂ¦Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВ
                isProcessing = true;

                const currentMode = localStorage.getItem('forceMockData') === 'true';
                if (currentMode) {
                    localStorage.removeItem('forceMockData');
                    console.log('РЎР‚РЎСџРІР‚СњР’В§ Force mock data mode: OFF (Ctrl/Cmd + M)');
                } else {
                    localStorage.setItem('forceMockData', 'true');
                    console.log('РЎР‚РЎСџРІР‚СњР’В§ Force mock data mode: ON (Ctrl/Cmd + M)');
                }
            }
        };

        const handleKeyUp = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
                isProcessing = false; // Р В Р’В Р В Р’В°Р В Р’В·Р РЋР вЂљР В Р’ВµР РЋРІвЂљВ¬Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р В Р’В»Р В Р’ВµР В РўвЂР РЋРЎвЂњР РЋР вЂ№Р РЋРІР‚В°Р В Р’ВµР В Р’Вµ Р В Р вЂ¦Р В Р’В°Р В Р’В¶Р В Р’В°Р РЋРІР‚С™Р В РЎвЂР В Р’Вµ
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    if (isInfoGameRoute) {
        return (
            <div className="flex h-screen bg-[#0A0F18] text-white/90 font-['Onest']">
                <StyleInjector />
                <LeftSidebar
                    t={t}
                    activeTab={activeTab}
                    onNavClick={handleInfoSidebarNav}
                    tocItems={[]}
                    activeTocId={null}
                    onTocClick={() => {}}
                    isAnalyzed={isAnalyzed}
                    onModalClick={setActiveModal}
                    onLanguageChange={handleLanguageChange}
                    currentLang={uiLanguage}
                    isCollapsed={isLeftCollapsed}
                    onToggleCollapse={() => setIsLeftCollapsed(prev => !prev)}
                    isAuthorized={isAuthorized}
                    projects={projects}
                    isProjectsLoading={isProjectsLoading}
                    selectedProjectId={selectedProjectId}
                    onProjectSelect={setSelectedProjectId}
                    onProjectCreate={handleCreateProject}
                    onProjectRename={handleRenameProject}
                    onProjectDelete={handleDeleteProject}
                    expandedProjectIds={expandedProjectIds}
                    projectAnalysesByProject={projectAnalysesByProject}
                    onProjectToggle={handleProjectToggle}
                    onAnalysisRename={handleRenameAnalysis}
                    onAnalysisDelete={handleDeleteAnalysis}
                    onAnalysisSelect={handleAnalysisSelect}
                    selectedAnalysisId={selectedAnalysisId}
                    createProjectModalOpenRequest={createProjectModalOpenRequest}
                    onCreateProjectModalComplete={handleProjectCreateModalComplete}
                />
                <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-200 ease-in-out ${isLeftCollapsed ? 'ml-[76px]' : 'ml-[296px]'}`}>
                    <GameInfoPage gameId={infoGameId} t={t} />
                </div>
                <AboutModal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} t={t} />
                <SelectProjectForAnalysisModal
                    isOpen={isSelectProjectModalOpen}
                    t={t}
                    projects={projects}
                    selectedProjectId={projectSelectionForAnalysis}
                    onProjectChange={setProjectSelectionForAnalysis}
                    onBack={handleCloseProjectSelectModal}
                    onSave={handleConfirmProjectForAnalysis}
                    onCreateProject={handleCreateProjectFromSelectModal}
                    onSkipSave={handleRunWithoutProjectSave}
                    showSkipSaveAction={projectSelectMode === 'beforeRun'}
                    isSubmitting={isAnalysisBusy}
                    error={selectProjectModalError}
                />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0A0F18] text-white/90 font-['Onest']">
            <StyleInjector />
            {validationToast && <Toast message={validationToast.message} type={validationToast.type} onClose={() => setValidationToast(null)} />}
            <LeftSidebar
                t={t}
                activeTab={activeTab}
                onNavClick={setActiveTab}
                tocItems={tocItems}
                activeTocId={activeTocId}
                onTocClick={setActiveTocId}
                isAnalyzed={isAnalyzed}
                onModalClick={setActiveModal}
                onLanguageChange={handleLanguageChange}
                currentLang={uiLanguage}
                isCollapsed={isLeftCollapsed}
                onToggleCollapse={() => setIsLeftCollapsed(prev => !prev)}
                isAuthorized={isAuthorized}
                projects={projects}
                isProjectsLoading={isProjectsLoading}
                selectedProjectId={selectedProjectId}
                onProjectSelect={setSelectedProjectId}
                onProjectCreate={handleCreateProject}
                onProjectRename={handleRenameProject}
                onProjectDelete={handleDeleteProject}
                expandedProjectIds={expandedProjectIds}
                projectAnalysesByProject={projectAnalysesByProject}
                onProjectToggle={handleProjectToggle}
                onAnalysisRename={handleRenameAnalysis}
                onAnalysisDelete={handleDeleteAnalysis}
                onAnalysisSelect={handleAnalysisSelect}
                selectedAnalysisId={selectedAnalysisId}
                createProjectModalOpenRequest={createProjectModalOpenRequest}
                onCreateProjectModalComplete={handleProjectCreateModalComplete}
            />
            <div className={`flex-1 flex overflow-hidden transition-all duration-200 ease-in-out ${isLeftCollapsed ? 'ml-[76px]' : 'ml-[296px]'}`}>
                    {activeTab !== 'description' && activeTab !== 'landing' && (
                    <header className="fixed top-0 left-0 right-0 z-30 bg-[#0A0F18] border-b border-[#323640]">
                        <div className="max-w-full h-[72px] flex items-center" style={{ marginLeft: isLeftCollapsed ? '76px' : '320px', transition: 'margin 0.3s ease-in-out' }}>
                            <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-[7px] flex-1">
                                        <h1 className="text-[26px] font-medium leading-[120%] tracking-[-0.02em] text-white m-0">
                                            {activeTab === 'market' ? t('navMarketAnalysis') : (activeTab === 'competitors' ? t('navCompetitors') : (activeTab === 'idea' ? t('navIdeaAnalysis') : t('navPitchPack')))}</h1>
                                        {tabTooltipText && (
                                            <div className="relative group">
                                                <Info className="w-4 h-4 text-white/60 hover:text-white transition-colors cursor-help" />
                                                <div className="pointer-events-none absolute left-0 top-[130%] z-50 hidden w-[380px] max-w-[calc(100vw-32px)] rounded-[12px] border border-[#323640] bg-[#2B2C37] p-3 text-[13px] leading-[18px] text-white shadow-[0_0_32px_rgba(10,15,24,0.8)] group-hover:block">
                                                    {tabTooltipText}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {activeTab === 'competitors' && (
                                            <>
                                                <SortDropdown 
                                                    isOpen={isCompetitorsDropdownOpen}
                                                    setIsOpen={setIsCompetitorsDropdownOpen}
                                                    sortOption={competitorsSortOption}
                                                    setSortOption={setCompetitorsSortOption}
                                                    t={t}
                                                />
                                                <button onClick={() => setShowCompetitorsFilterPopup(prev => !prev)} className="flex items-center gap-1.5 bg-[#191D28] rounded-xl px-2 py-2 hover:bg-[#1f2634] transition-colors">
                                                    <Filter size={20} />
                                                    <span className="text-sm font-medium text-white" style={{ fontFamily: 'Onest' }}>{t('filtersTitle')}</span>
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'market' && (
                                            <button onClick={() => setShowFilterPopup(prev => !prev)} className="flex items-center gap-1.5 bg-[#191D28] rounded-xl px-2 py-2 hover:bg-[#1f2634] transition-colors">
                                                <Filter size={20} />
                                                <span className="text-sm font-medium text-white" style={{ fontFamily: 'Onest' }}>{t('filtersTitle')}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}
                {showFilterPopup && (<div onClick={() => setShowFilterPopup(false)} className="fixed inset-0 z-40 bg-black/60" />)}
                <main 
                    ref={mainContentRef} 
                    style={{ 
                        paddingTop: (activeTab !== 'description' && activeTab !== 'landing') ? '90px' : undefined 
                    }} 
                    className={`flex-1 relative custom-scrollbar ${
                        activeTab === 'description' ? 'overflow-hidden' : 'overflow-y-auto'
                    } ${
                        activeTab === 'landing' ? 'p-0' : (activeTab === 'description' ? 'px-6 pb-0' : 'px-6 pb-12')
                    }`}
                >
                    {activeTab === 'landing' && (
                        <LandingPage 
                            t={t} 
                            onGetStarted={() => {
                                setActiveTab('description');
                                setIsLeftCollapsed(false);
                            }}
                        />
                    )}
                    {activeTab === 'description' && (
                        <IdeaForm
                            t={t}
                            formState={formState}
                            setFormState={handleSetFormState}
                            onSubmit={handleOpenProjectSelectModal}
                            onSaveAnalysis={handleOpenSaveUnsavedAnalysisModal}
                            showSaveAction={hasUnsavedAnalysis}
                            onAutofill={handleAutofill}
                            onClear={handleClearAll}
                            isFormValid={isFormValid}
                            isLoading={isAnalysisBusy}
                            isAutofilling={isAutofilling}
                            autoFillError={autoFillError}
                            selectOptions={selectOptions}
                            onValidationError={(errorKey) => setValidationToast({ message: t(errorKey), type: 'error' })}
                        />
                    )}
                    {activeTab === 'market' && (
                        <>
                            {apiResponse ? (
                                <ResultsSection
                                    data={apiResponse}
                                    t={t}
                                    onDataUpdate={setMarketData}
                                    activeFilters={lastMarketFilters}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                                    <div className="w-24 h-24 bg-[#FF5620]/10 rounded-full flex items-center justify-center mb-6"><InlineIcon svg={iconNavMarket} color="#FF5620" size={48} /></div>
                                    <h2 className="text-2xl font-bold text-white mb-4">{t('noDataForDescription')}</h2>
                                    <p className="text-white/70 text-lg max-w-2xl mb-4">{t('noDataForDescriptionHint')}</p>
                                    <button onClick={() => { const defaultFilters = { genres: [], tags: [], categories: [], languages: [], publisherClass: [], releaseStart: null, releaseFinish: null, copiesSoldFrom: null, copiesSoldTo: null, priceFrom: null, priceTo: null, revenueFrom: null, revenueTo: null, ratingFrom: null, ratingTo: null, publishers: [], developers: [], reviewsFrom: null, reviewsTo: null, playtimeFrom: null, playtimeTo: null, followersFrom: null, followersTo: null, }; handleFilterApply(defaultFilters); }} disabled={isLoading} className="w-auto px-8 py-4 gg-gradient-btn text-white font-bold rounded-xl disabled:opacity-50 transition">
                                            {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin inline mr-2" />{t('generatingReport')}</>) : (<span>{t('analyzeFullMarket')}</span>)}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* --- COMPETITORS TAB --- */}
                    {activeTab === 'competitors' && (
                        <CompetitorsSection t={t} ideaDescription={formState.ideaDescription} uiLanguage={uiLanguage} onDataUpdate={setCompetitorsData} competitorData={filteredCompetitorsData || competitorsData} isLoading={isLoadingCompetitorsData} sortOption={competitorsSortOption} hasFilter={competitorsFilters !== null} />
                    )}

                    {activeTab === 'idea' && (
                        <IdeaAnalysisSection t={t} ideaDescription={formState.ideaDescription} tags={formState.tags} uiLanguage={uiLanguage} onDataUpdate={setIdeaData} ideaAnalysisData={ideaData} isLoading={isLoadingIdeaData} />
                    )}
                    {activeTab === 'pitch' && (
                        <PitchPackExportSection
                            t={t}
                            marketData={marketData}
                            competitorsData={filteredCompetitorsData || competitorsData}
                            ideaData={ideaData}
                            formState={formState}
                            uiLanguage={uiLanguage}
                            competitorsSortOption={competitorsSortOption}
                        />
                    )}
                </main>
                <RightFilterSidebar isVisible={activeTab === 'market'} isCollapsed={isFilterPanelCollapsed} onToggleCollapse={() => setIsFilterPanelCollapsed(prev => !prev)} t={t} options={selectOptions} formState={formState} onApply={(payload) => { setShowFilterPopup(false); handleFilterApply(payload); }} isFloating={showFilterPopup} onCloseFloating={() => setShowFilterPopup(false)} />
                <CompetitorsFilterSidebar isVisible={activeTab === 'competitors'} t={t} options={selectOptions} formState={formState} onApply={(payload) => { setShowCompetitorsFilterPopup(false); handleCompetitorsFilterApply(payload); }} isFloating={showCompetitorsFilterPopup} onCloseFloating={() => setShowCompetitorsFilterPopup(false)} />
                {showCompetitorsFilterPopup && (<div onClick={() => setShowCompetitorsFilterPopup(false)} className="fixed inset-0 z-40 bg-black/60" />)}
            </div>
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className={`bg-[#191D28] rounded-2xl flex flex-col items-center ${useCompactLoader ? 'p-6' : 'p-8 gap-4'}`}>
                        <Loader2 className="w-12 h-12 animate-spin text-[#FF5620]" />
                        {!useCompactLoader && (
                            <>
                                <h3 className="text-xl font-bold text-white">{t('generatingAnalytics')}</h3>
                                <p className="text-white/60 max-w-md text-center">{t('loaderDescription')}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
            <AboutModal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} t={t} />
            <SelectProjectForAnalysisModal
                isOpen={isSelectProjectModalOpen}
                t={t}
                projects={projects}
                selectedProjectId={projectSelectionForAnalysis}
                onProjectChange={setProjectSelectionForAnalysis}
                onBack={handleCloseProjectSelectModal}
                onSave={handleConfirmProjectForAnalysis}
                onCreateProject={handleCreateProjectFromSelectModal}
                onSkipSave={handleRunWithoutProjectSave}
                showSkipSaveAction={projectSelectMode === 'beforeRun'}
                isSubmitting={isAnalysisBusy}
                error={selectProjectModalError}
            />
                    </div>
    );
}






