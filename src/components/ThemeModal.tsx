import React, { useState } from 'react';
import { X, Palette, Check } from 'lucide-react';
import { THEMES, ThemeType, cn } from '../constants';

interface ThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (theme: ThemeType) => void;
    currentTheme?: string;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
    isOpen,
    onClose,
    onApply,
    currentTheme = 'modern',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-full max-w-md border border-[#E5E5E5] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#333333] text-white rounded">
                            <Palette size={14} />
                        </div>
                        <h2 className="text-[13px] font-bold text-[#333333] tracking-tight">Global Themes</h2>
                    </div>
                    <button onClick={onClose} className="text-[#888888] hover:text-[#333333] hover:bg-gray-100 p-1 rounded-md transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] text-[#888888] font-medium uppercase tracking-widest leading-relaxed">
                        Select a theme to apply to all slides. This will overwrite individual styles.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(THEMES) as ThemeType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => onApply(t)}
                                className={cn(
                                    "flex flex-col gap-2 p-3 rounded-lg border transition-all text-left group relative",
                                    currentTheme === t
                                        ? "border-[#0D99FF] bg-blue-50/30"
                                        : "border-[#E5E5E5] bg-white hover:border-[#0D99FF] hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex -space-x-1.5">
                                        <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: THEMES[t].colors.background }} />
                                        <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: THEMES[t].colors.title }} />
                                        <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: THEMES[t].colors.accent }} />
                                    </div>
                                    {currentTheme === t && (
                                        <div className="bg-[#0D99FF] text-white p-0.5 rounded-full">
                                            <Check size={10} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-[#333333] tracking-tight">{THEMES[t].name}</span>
                                    <span className="text-[9px] text-[#888888] font-medium uppercase tracking-tight truncate block">
                                        {THEMES[t].typography.fontFamily.split(',')[0]}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full py-1.5 rounded-md border border-[#E5E5E5] text-[#333333] hover:bg-gray-50 transition-colors font-medium text-[11px]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
