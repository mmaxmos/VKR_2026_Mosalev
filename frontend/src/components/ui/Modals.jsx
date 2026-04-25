import React, { useEffect, useState } from 'react';
import { X, Link as LinkIcon, MessageSquareText, Users } from 'lucide-react';

export const Modal = ({ title, isOpen, onClose, children, t, headerContent }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#191D28] rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-6 border-b border-[#323640]">
                    {headerContent || <h2 className="text-2xl font-bold text-[#FFFFFF]">{title}</h2>}
                    <button onClick={onClose} title={t('closeModal')} className="p-2 rounded-full text-white/50 hover:text-white hover:bg-[#2A2F3A] transition">
                        <X className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-8 overflow-y-auto text-white/90 space-y-4 custom-scrollbar">{children}</div>
            </div>
        </div>
    );
};

export const AboutContactsContent = ({ t }) => (
    <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-6">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-[radial-gradient(100%_7302.48%_at_0%_1.14%,#FF7549_0%,#FF5620_100%)]">{t('bearHeadStudio')}</h2>
            <p className="text-lg font-light text-white max-w-3xl leading-relaxed">{t('bearHeadStudioDescription')}</p>
            <a href="https://bearheadstudio.ru/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto h-12 flex justify-center items-center px-8 py-3 gap-2 text-base font-medium rounded-xl transition bg-white text-black hover:bg-gray-200 shadow-md transform hover:scale-[1.02]">
                <LinkIcon size={20} />
                <span>{t('learnMore')}</span>
            </a>
        </div>
        <div className="h-px w-full bg-white/10" />
        <div className="flex flex-col items-center text-center gap-5">
            <p className="text-base font-light text-white/70 max-w-3xl leading-relaxed">{t('contactsDescription')}</p>
            <div className="flex flex-col sm:flex-row gap-6 mt-2">
                <a href="mailto:gameglory@gmail.com" className="flex items-center gap-3 text-lg text-white hover:text-[#FF5620] transition">
                    <MessageSquareText className="text-[#FF5620]" size={24} />
                    <span>{t('emailContact')}</span>
                </a>
                <a href="https://t.me/bear_head_studio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg text-white hover:text-[#FF5620] transition">
                    <LinkIcon className="text-[#FF5620]" size={24} />
                    <span>{t('telegramContact')}</span>
                </a>
                <a href="https://vk.com/bear_head_studio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg text-white hover:text-[#FF5620] transition">
                    <Users className="text-[#FF5620]" size={24} />
                    <span>{t('vkContact')}</span>
                </a>
            </div>
            <p className="text-sm text-white">{t('tagline')}</p>
        </div>
    </div>
);

export const HowItWorksContent = ({ t }) => (
    <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-6">
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#1E2333] p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
                    <span className="text-5xl font-extrabold text-[#FF5620]">1</span>
                    <h4 className="text-xl font-semibold text-white">{t('marketDataCollection')}</h4>
                    <p className="text-base font-light text-white/70">{t('marketDataCollectionDesc')}</p>
                </div>
                <div className="bg-[#1E2333] p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
                    <span className="text-5xl font-extrabold text-[#FF5620]">2</span>
                    <h4 className="text-xl font-semibold text-white">{t('aiIdeasAnalysis')}</h4>
                    <p className="text-base font-light text-white/70">{t('aiIdeasAnalysisDesc')}</p>
                </div>
                <div className="bg-[#1E2333] p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
                    <span className="text-5xl font-extrabold text-[#FF5620]">3</span>
                    <h4 className="text-xl font-semibold text-white">{t('metricsGeneration')}</h4>
                    <p className="text-base font-light text-white/70">{t('metricsGenerationDesc')}</p>
                </div>
            </div>

            <section className="rounded-2xl border border-[#323640] bg-[#1B2030] p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                    <h4 className="text-lg md:text-xl font-semibold text-white">{t('howItWorksQuickGuideTitle')}</h4>
                    <span className="rounded-full bg-[#FF5620]/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#FF8A66]">
                        {t('howItWorksQuickGuideBadge')}
                    </span>
                </div>
                <p className="mt-2 text-sm md:text-base text-white/70">
                    {t('howItWorksQuickGuideIntro')}
                </p>

                <div className="mt-4">
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <article key={index} className="rounded-xl border border-white/10 bg-[#191D28] p-4">
                                <p className="text-sm md:text-base font-medium text-white">
                                    {t(`howItWorksQuickStep${index}Title`)}
                                </p>
                                <p className="mt-1 text-sm text-white/70">
                                    {t(`howItWorksQuickStep${index}Desc`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    </div>
);

export const AboutModal = ({ isOpen, onClose, t }) => {
    const [activeTab, setActiveTab] = useState('contacts');

    useEffect(() => {
        if (isOpen) {
            setActiveTab('contacts');
        }
    }, [isOpen]);

    return (
        <Modal
            title={t('aboutContacts')}
            isOpen={isOpen}
            onClose={onClose}
            t={t}
            headerContent={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('contacts')}
                        className={`h-10 px-4 rounded-[10px] text-[14px] leading-[18px] font-medium transition ${
                            activeTab === 'contacts'
                                ? 'bg-[#353842] text-white'
                                : 'text-[#A7A8AC] hover:bg-[#2A2F3A] hover:text-white'
                        }`}
                    >
                        {t('contacts')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('how')}
                        className={`h-10 px-4 rounded-[10px] text-[14px] leading-[18px] font-medium transition ${
                            activeTab === 'how'
                                ? 'bg-[#353842] text-white'
                                : 'text-[#A7A8AC] hover:bg-[#2A2F3A] hover:text-white'
                        }`}
                    >
                        {t('howItWorks')}
                    </button>
                </div>
            }
        >
            {activeTab === 'contacts' ? <AboutContactsContent t={t} /> : <HowItWorksContent t={t} />}
        </Modal>
    );
};
