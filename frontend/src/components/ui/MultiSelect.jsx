import React, { useState, useMemo, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import iconSearch from '../../assets/sidebar/search.svg';

// --- КОМПОНЕНТЫ ---

// 1. MultiSelect
export const MultiSelect = ({ label, options, selected, onChange, onClear, placeholder, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    useOutsideClick(dropdownRef, () => { setIsOpen(false); setSearchTerm(''); });

    const toggleOption = (option) => {
        const newSelected = selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option];
        onChange(newSelected);
    };

    const filteredOptions = useMemo(() => 
        options.filter(option => 
            option.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [options, searchTerm]
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="bg-[#191D28] border border-[#353842] rounded-xl flex items-center gap-3 p-3 w-full relative min-h-[56px] cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex-grow flex flex-col justify-center">
                    <label className="text-white text-[14px] leading-[18px] font-medium pointer-events-none">{label}</label>
                    <div className="flex flex-wrap gap-1.5 items-center mt-1 max-w-[calc(100%-42px)]">
                        {selected.length === 0 ? <span className="text-base text-white/40" style={{ fontFamily: 'Inter Tight' }}>{placeholder}</span> : selected.map(item => (
                            <div key={item} className="bg-[#353842] rounded-full pl-3 pr-1 py-0.5 text-xs text-white flex items-center gap-1.5">
                                {item}
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleOption(item); }} className="text-white/80 hover:text-white transition-colors p-0">
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center">
                    {selected.length > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-white/40 hover:text-white/80 transition-colors mr-2"><X size={16} /></button>}
                    <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-[#191D28] border border-[#2B2C37] rounded-lg shadow-2xl flex flex-col">
                    <div className="p-2 border-b border-[#2B2C37]">
                        <div className="relative">
                            <img src={iconSearch} alt="" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-80" />
                            <input type="text" placeholder={t('search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus className="w-full bg-[#0A0F18] text-white/80 placeholder-white/40 text-sm rounded-md pl-8 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FF7549]" />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSearchTerm('');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/90 hover:text-white transition-colors"
                                    aria-label={t('clearFilters')}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div key={option} onClick={() => { toggleOption(option); }} className={`px-4 py-2 text-base cursor-pointer hover:bg-[#2B2C37] flex justify-between items-center ${selected.includes(option) ? 'text-[#FF7549]' : 'text-white'}`} style={{ fontFamily: 'Inter Tight' }}>
                                    {option}
                                    {selected.includes(option) && <div className="w-1.5 h-1.5 rounded-full bg-[#FF7549]"></div>}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-white/50 text-center" style={{ fontFamily: 'Inter Tight' }}>{t('noMatches')}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
