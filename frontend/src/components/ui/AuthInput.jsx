import React, { useState } from 'react';

export const AuthInput = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    errorText,
    rightSlot,
    onBlur,
    autoComplete,
    inputMode,
    autoCapitalize,
    autoCorrect,
    spellCheck,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const isActive = isFocused || (value && value.length > 0);

    return (
        <div className="flex flex-col gap-2 w-full">
            <label className="text-white text-[14px] font-medium leading-[18px] tracking-[-0.01em]">
                {label}
            </label>
            <div
                className={`rounded-[12px] p-[2px] ${
                    errorText ? 'bg-[#D23D3D]' : (isFocused ? 'bg-[linear-gradient(106.35deg,#FF7549_-11.99%,#FF5620_104.13%)]' : 'bg-transparent hover:bg-[#555A6C]')
                }`}
            >
                <div className="flex items-center h-[38px] px-3 gap-2 bg-[#353842] rounded-[10px]">
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        inputMode={inputMode}
                        autoCapitalize={autoCapitalize}
                        autoCorrect={autoCorrect}
                        spellCheck={spellCheck}
                        onFocus={() => setIsFocused(true)}
                        onBlur={(e) => {
                            setIsFocused(false);
                            if (onBlur) onBlur(e);
                        }}
                        className={`w-full bg-transparent text-[14px] leading-[18px] tracking-[-0.01em] focus:outline-none ${
                            isActive ? 'text-white' : 'text-[#A7A8AC]'
                        } placeholder:text-[#A7A8AC]`}
                    />
                    {rightSlot}
                </div>
            </div>
            {errorText && (
                <span className="text-[#D23D3D] text-[14px] font-medium leading-[18px] tracking-[-0.01em]">
                    {errorText}
                </span>
            )}
        </div>
    );
};
