import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Palette, Plus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../constants';
import { standardColors, gradientCategories } from '../../constants/colors';

interface ColorSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentColor: string;
    onColorSelect: (color: string) => void;
    onColorCommit?: (color: string, isCustom?: boolean) => void;
    brandColors: Record<string, string>;
    documentColors?: string[];
}

export const ColorSidebar: React.FC<ColorSidebarProps> = ({
    isOpen,
    onClose,
    currentColor,
    onColorSelect,
    onColorCommit,
    brandColors,
    documentColors = []
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState<'main' | 'gradients' | 'solids'>('main');
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleColorClick = (color: string, isCustom = false) => {
        onColorSelect(color);
        if (onColorCommit) onColorCommit(color, isCustom);
    };

    const getHexFromVar = (val: string) => {
        if (!val) return '#ffffff';
        if (val.startsWith('#')) return val;
        if (val.startsWith('var(--brand-')) {
            const key = val.replace('var(--brand-', '').replace(')', '');
            return brandColors[key] || '#ffffff';
        }
        return val;
    };

    const activeHex = getHexFromVar(currentColor);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    key={currentView}
                    initial={{ x: -320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-[#E5E5E5] flex flex-col z-[150] shadow-2xl"
                    ref={sidebarRef}
                >
                    {/* Header */}
                    <div className="h-12 px-4 border-b border-[#E5E5E5] flex items-center shrink-0">
                        {currentView !== 'main' && (
                            <button
                                onClick={() => setCurrentView('main')}
                                className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronRight size={20} className="rotate-180 text-[#333333]" />
                            </button>
                        )}
                        <h2 className="text-[13px] font-bold text-[#333333] flex-1">
                            {currentView === 'main' ? 'Cor' :
                                currentView === 'gradients' ? 'Cores de gradientes padrão' :
                                    'Cores sólidas padrão'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-[#888888]"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {currentView === 'main' ? (
                        <>
                            {/* Search */}
                            <div className="p-3">
                                <div className="relative group">
                                    <Search size={14} className="absolute left-3 top-2.5 text-[#BBBFCA] group-focus-within:text-[#0D99FF] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder='Experimente "azul" ou "#00dfcc"'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#F5F5F5] border-none rounded-lg py-2 pl-9 pr-3 text-[12px] placeholder:text-[#BBBFCA] outline-none focus:ring-1 focus:ring-[#0D99FF] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-6">
                                {/* Document Colors */}
                                <div className="space-y-3">
                                    <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Cores no documento</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="relative w-8 h-8 rounded-lg border-2 border-dashed border-[#E5E5E5] hover:border-[#0D99FF] transition-all group flex items-center justify-center cursor-pointer">
                                            <Plus size={14} className="text-[#BBBFCA] group-hover:text-[#0D99FF]" />
                                            <input
                                                type="color"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onInput={(e) => {
                                                    onColorSelect((e.target as HTMLInputElement).value);
                                                }}
                                                onChange={(e) => {
                                                    const color = (e.target as HTMLInputElement).value;
                                                    handleColorClick(color, true);
                                                }}
                                            />
                                        </div>

                                        {/* No Color / Transparent Option */}
                                        <button
                                            onClick={() => handleColorClick('transparent')}
                                            className={cn(
                                                "w-8 h-8 rounded-lg border border-black/10 transition-transform active:scale-90 bg-white relative overflow-hidden flex items-center justify-center",
                                                currentColor === 'transparent' && "ring-2 ring-[#0D99FF] ring-offset-2"
                                            )}
                                            title="Sem cor"
                                        >
                                            <div className="absolute w-[140%] h-[1.5px] bg-[#FF4D4D] rotate-45 shadow-sm" />
                                        </button>

                                        {documentColors.map((color, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleColorClick(color)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg border border-black/10 shadow-sm transition-transform active:scale-90",
                                                    (activeHex === color || currentColor === color) && "ring-2 ring-[#0D99FF] ring-offset-2"
                                                )}
                                                style={{ background: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Brand Kit */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5"><Palette size={12} /> Kit de marca</h3>
                                        <button className="text-[10px] text-[#0D99FF] font-bold hover:underline">Editar</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(brandColors).map(([key, value]) => {
                                            const varString = `var(--brand-${key})`;
                                            return (
                                                <button key={key} onClick={() => handleColorClick(varString)} className={cn("w-10 h-10 rounded-lg border border-black/5 transition-transform active:scale-90 shadow-sm", currentColor === varString && "ring-2 ring-[#0D99FF] ring-offset-2")} style={{ backgroundColor: value }} title={key} />
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Solids Quick Selection */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Cores sólidas padrão</h3>
                                        <button onClick={() => setCurrentView('solids')} className="text-[10px] text-[#888888] hover:text-[#0D99FF] font-bold transition-colors">Ver tudo</button>
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {standardColors.slice(0, 18).map((color, i) => (
                                            <button key={i} onClick={() => handleColorClick(color)} className={cn("aspect-square rounded-md border border-black/10 transition-transform active:scale-90", activeHex === color && "ring-2 ring-[#0D99FF] ring-offset-1")} style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Gradients Quick Selection */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Gradientes padrão</h3>
                                        <button onClick={() => setCurrentView('gradients')} className="text-[10px] text-[#888888] hover:text-[#0D99FF] font-bold transition-colors">Ver tudo</button>
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {gradientCategories.all.slice(0, 12).map((grad, i) => (
                                            <button key={i} onClick={() => handleColorClick(grad)} className={cn("aspect-square rounded-md border border-black/10 transition-transform active:scale-90 shadow-sm", currentColor === grad && "ring-2 ring-[#0D99FF] ring-offset-1")} style={{ background: grad }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : currentView === 'gradients' ? (
                        <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4 space-y-8 animate-in fade-in slide-in-from-right-2">
                            {/* Cool Tones */}
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-bold text-[#666666] tracking-tight">Tons frios</h3>
                                <div className="grid grid-cols-7 gap-2">
                                    {gradientCategories.cool.map((grad, i) => (
                                        <button key={i} onClick={() => handleColorClick(grad)} className={cn("aspect-square rounded-md border border-black/10 transition-transform hover:scale-110 active:scale-90 shadow-sm", currentColor === grad && "ring-2 ring-[#0D99FF] ring-offset-1")} style={{ background: grad }} />
                                    ))}
                                </div>
                            </div>

                            {/* Warm Tones */}
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-bold text-[#666666] tracking-tight">Tons quentes</h3>
                                <div className="grid grid-cols-7 gap-2">
                                    {gradientCategories.warm.map((grad, i) => (
                                        <button key={i} onClick={() => handleColorClick(grad)} className={cn("aspect-square rounded-md border border-black/10 transition-transform hover:scale-110 active:scale-90 shadow-sm", currentColor === grad && "ring-2 ring-[#0D99FF] ring-offset-1")} style={{ background: grad }} />
                                    ))}
                                </div>
                            </div>

                            {/* Monochromatic */}
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-bold text-[#666666] tracking-tight">Monocromático</h3>
                                <div className="grid grid-cols-7 gap-2">
                                    {gradientCategories.mono.map((grad, i) => (
                                        <button key={i} onClick={() => handleColorClick(grad)} className={cn("aspect-square rounded-md border border-black/10 transition-transform hover:scale-110 active:scale-90 shadow-sm", currentColor === grad && "ring-2 ring-[#0D99FF] ring-offset-1")} style={{ background: grad }} />
                                    ))}
                                </div>
                            </div>

                            {/* All Gradients */}
                            <div className="space-y-3 pb-8">
                                <h3 className="text-[11px] font-bold text-[#666666] tracking-tight">Todos os gradientes</h3>
                                <div className="grid grid-cols-7 gap-2">
                                    {gradientCategories.all.map((grad, i) => (
                                        <button key={i} onClick={() => handleColorClick(grad)} className={cn("aspect-square rounded-md border border-black/10 transition-transform hover:scale-110 active:scale-90 shadow-sm", currentColor === grad && "ring-2 ring-[#0D99FF] ring-offset-1")} style={{ background: grad }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Solids Expanded View */
                        <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4 space-y-6 animate-in fade-in slide-in-from-right-2">
                            <div className="grid grid-cols-7 gap-y-3 gap-x-2">
                                {standardColors.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleColorClick(color)}
                                        className={cn(
                                            "aspect-square rounded-md border border-black/10 transition-transform hover:scale-110 active:scale-90 shadow-sm",
                                            activeHex === color && "ring-2 ring-[#0D99FF] ring-offset-1"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
