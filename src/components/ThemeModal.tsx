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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#F4F4F2] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#BBBFCA]">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#495464] text-white rounded-lg">
                            <Palette size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-[#495464] uppercase tracking-tighter">Global Themes</h2>
                    </div>
                    <button onClick={onClose} className="text-[#495464] hover:bg-[#E8E8E8] p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-xs text-[#BBBFCA] font-bold uppercase tracking-widest mb-4">
                        Select a theme to apply to all slides. This will overwrite individual styles.
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        {(Object.keys(THEMES) as ThemeType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => onApply(t)}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
                                    currentTheme === t
                                        ? "border-[#495464] bg-white shadow-md"
                                        : "border-[#BBBFCA] bg-white/50 hover:border-[#495464] hover:bg-white"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: THEMES[t].colors.background }} />
                                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: THEMES[t].colors.title }} />
                                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: THEMES[t].colors.accent }} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-black uppercase tracking-tighter text-[#495464]">{THEMES[t].name}</span>
                                        <span className="text-[10px] text-[#BBBFCA] font-bold uppercase">{THEMES[t].typography.fontFamily} • {THEMES[t].typography.titleSize}px</span>
                                    </div>
                                </div>
                                {currentTheme === t && (
                                    <div className="bg-[#495464] text-white p-1 rounded-full">
                                        <Check size={14} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border-2 border-[#BBBFCA] text-[#BBBFCA] hover:text-[#495464] hover:border-[#495464] transition-all font-black uppercase tracking-widest text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
