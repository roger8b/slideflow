import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../constants';
import { standardColors } from '../../constants/colors';
import {
    TextEffect,
    TextEffectType,
    DEFAULT_SHADOW,
    DEFAULT_FLOAT,
    DEFAULT_HOLLOW,
    DEFAULT_BACKGROUND,
} from '../../types/textEffect';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TextEffectsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentEffect: TextEffect | undefined;
    onChange: (effect: TextEffect) => void;
    brandColors: Record<string, string>;
    documentColors?: string[];
}

// ─── Effect definitions ───────────────────────────────────────────────────────

const EFFECTS: { type: TextEffectType; label: string }[] = [
    { type: 'none',       label: 'Nenhum'    },
    { type: 'shadow',     label: 'Sombreado' },
    { type: 'float',      label: 'Flutuante' },
    { type: 'hollow',     label: 'Vazado'    },
    { type: 'background', label: 'Fundo'     },
];

// ─── Thumbnail previews ───────────────────────────────────────────────────────

function getThumbnailStyle(type: TextEffectType): React.CSSProperties {
    switch (type) {
        case 'shadow':
            return { textShadow: '3px 3px 0px rgba(0,0,0,0.4)' };
        case 'float':
            return { textShadow: '0px 4px 6px rgba(0,0,0,0.35)' };
        case 'hollow':
            return { WebkitTextStroke: '1.5px #222', WebkitTextFillColor: 'transparent', color: 'transparent' };
        case 'background':
            return {};
        default:
            return {};
    }
}

const EffectThumbnail = ({
    type,
    label,
    isActive,
    onClick,
}: {
    type: TextEffectType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) => {
    const isBackground = type === 'background';

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex flex-col items-center gap-1.5 group',
            )}
        >
            <div
                className={cn(
                    'w-[76px] h-[76px] rounded-lg border-2 flex items-center justify-center bg-white overflow-hidden transition-all',
                    isActive ? 'border-[#7B61FF]' : 'border-[#E5E5E5] hover:border-[#BBBFCA]'
                )}
            >
                {isBackground ? (
                    <div
                        className="flex items-center justify-center"
                        style={{
                            background: 'rgba(0,0,0,1)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                        }}
                    >
                        <span
                            className="text-[22px] font-bold select-none"
                            style={{ color: '#FFFFFF', fontFamily: 'serif' }}
                        >
                            Ag
                        </span>
                    </div>
                ) : (
                    <span
                        className="text-[22px] font-bold select-none text-[#222222]"
                        style={{ fontFamily: 'serif', ...getThumbnailStyle(type) }}
                    >
                        Ag
                    </span>
                )}
            </div>
            <span className={cn(
                'text-[11px] font-medium',
                isActive ? 'text-[#333333]' : 'text-[#666666]'
            )}>
                {label}
            </span>
        </button>
    );
};

// ─── Slider row ───────────────────────────────────────────────────────────────

const SliderRow = ({
    label,
    value,
    min,
    max,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}) => {
    const clamp = (v: number) => Math.min(max, Math.max(min, v));
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div className="flex flex-col gap-1.5 px-4">
            <span className="text-[12px] text-[#333333] font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <div className="flex-1 relative h-4 flex items-center">
                    <div className="w-full h-1.5 rounded-full bg-[#E5E5E5] relative">
                        <div
                            className="absolute left-0 top-0 h-full rounded-full bg-[#7B61FF]"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={(e) => onChange(clamp(Number(e.target.value)))}
                        className="absolute inset-0 opacity-0 w-full cursor-pointer"
                    />
                    <div
                        className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#7B61FF] shadow pointer-events-none"
                        style={{ left: `calc(${pct}% - 8px)` }}
                    />
                </div>
                <div className="flex items-center border border-[#E5E5E5] rounded-md overflow-hidden shrink-0">
                    <button
                        onClick={() => onChange(clamp(value - 1))}
                        className="w-7 h-7 flex items-center justify-center text-[#888888] hover:bg-[#F5F5F5] transition-colors text-[16px] leading-none"
                    >−</button>
                    <span className="w-9 text-center text-[12px] font-medium text-[#333333]">{value}</span>
                    <button
                        onClick={() => onChange(clamp(value + 1))}
                        className="w-7 h-7 flex items-center justify-center text-[#888888] hover:bg-[#F5F5F5] transition-colors text-[16px] leading-none"
                    >+</button>
                </div>
            </div>
        </div>
    );
};

// ─── Color picker popover ─────────────────────────────────────────────────────

const ColorPickerPopover = ({
    value,
    onChange,
    brandColors,
    documentColors,
}: {
    value: string;
    onChange: (color: string) => void;
    brandColors: Record<string, string>;
    documentColors: string[];
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [open]);

    const resolvedValue = value.startsWith('var(--brand-')
        ? brandColors[value.replace('var(--brand-', '').replace(')', '')] || '#000000'
        : value;

    const brandColorList = Object.entries(brandColors)
        .filter(([, v]) => v && v.startsWith('#'))
        .map(([, v]) => v);

    return (
        <div className="flex items-center justify-between px-4 py-1" ref={ref}>
            <span className="text-[12px] text-[#333333] font-medium">Cor</span>
            <div className="relative">
                <button
                    onClick={() => setOpen(v => !v)}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-md ring-1 ring-[#E5E5E5] transition-all hover:ring-[#7B61FF]"
                    style={{ background: resolvedValue }}
                />

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-9 z-[200] w-[220px] bg-white rounded-xl shadow-2xl border border-[#E5E5E5] p-3 flex flex-col gap-3"
                        >
                            {documentColors.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-2">Cores no documento</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {documentColors.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => { onChange(c); setOpen(false); }}
                                                className={cn(
                                                    'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                                                    resolvedValue === c ? 'border-[#7B61FF]' : 'border-white ring-1 ring-[#E5E5E5]'
                                                )}
                                                style={{ background: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {brandColorList.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-2">Cores da marca</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {brandColorList.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => { onChange(c); setOpen(false); }}
                                                className={cn(
                                                    'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                                                    resolvedValue === c ? 'border-[#7B61FF]' : 'border-white ring-1 ring-[#E5E5E5]'
                                                )}
                                                style={{ background: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-2">Cores sólidas padrão</p>
                                <div className="flex flex-wrap gap-1">
                                    {standardColors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => { onChange(c); setOpen(false); }}
                                            className={cn(
                                                'w-5 h-5 rounded-full border transition-all hover:scale-110',
                                                resolvedValue === c ? 'border-[#7B61FF] scale-110' : 'border-[#E5E5E5]'
                                            )}
                                            style={{ background: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const TextEffectsSidebar: React.FC<TextEffectsSidebarProps> = ({
    isOpen,
    onClose,
    currentEffect,
    onChange,
    brandColors,
    documentColors = [],
}) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    const effect: TextEffect = currentEffect ?? { type: 'none' };

    // Outside click to close
    useEffect(() => {
        if (!isOpen) return;
        const handle = (e: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [isOpen, onClose]);

    const setType = (type: TextEffectType) => {
        switch (type) {
            case 'none':
                onChange({ type: 'none' });
                break;
            case 'shadow':
                onChange({ type: 'shadow', ...DEFAULT_SHADOW });
                break;
            case 'float':
                onChange({ type: 'float', ...DEFAULT_FLOAT });
                break;
            case 'hollow':
                onChange({ type: 'hollow', ...DEFAULT_HOLLOW });
                break;
            case 'background':
                onChange({ type: 'background', ...DEFAULT_BACKGROUND });
                break;
        }
    };

    const patch = (partial: Partial<TextEffect>) => {
        onChange({ ...effect, ...partial });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={sidebarRef}
                    initial={{ x: -320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -320, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-[#E5E5E5] flex flex-col z-[150] shadow-2xl"
                >
                    {/* Header */}
                    <div className="h-12 px-4 border-b border-[#E5E5E5] flex items-center shrink-0">
                        <h2 className="text-[13px] font-bold text-[#333333] flex-1">Efeitos</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-[#888888]"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto pb-6">

                        {/* Estilo section */}
                        <div className="px-4 pt-4 pb-2">
                            <p className="text-[11px] font-bold text-[#333333] mb-3">Estilo</p>
                            <div className="flex flex-wrap gap-3">
                                {EFFECTS.map(({ type, label }) => (
                                    <EffectThumbnail
                                        key={type}
                                        type={type}
                                        label={label}
                                        isActive={effect.type === type}
                                        onClick={() => setType(type)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Contextual controls */}
                        {effect.type === 'shadow' && (
                            <div className="flex flex-col gap-3 mt-3">
                                <SliderRow
                                    label="Distância"
                                    value={effect.shadowDistance ?? DEFAULT_SHADOW.shadowDistance}
                                    min={0}
                                    max={100}
                                    onChange={(v) => patch({ shadowDistance: v })}
                                />
                                <SliderRow
                                    label="Direção"
                                    value={effect.shadowDirection ?? DEFAULT_SHADOW.shadowDirection}
                                    min={-180}
                                    max={180}
                                    onChange={(v) => patch({ shadowDirection: v })}
                                />
                                <SliderRow
                                    label="Desfoque"
                                    value={effect.shadowBlur ?? DEFAULT_SHADOW.shadowBlur}
                                    min={0}
                                    max={100}
                                    onChange={(v) => patch({ shadowBlur: v })}
                                />
                                <SliderRow
                                    label="Transparência"
                                    value={effect.shadowOpacity ?? DEFAULT_SHADOW.shadowOpacity}
                                    min={0}
                                    max={100}
                                    onChange={(v) => patch({ shadowOpacity: v })}
                                />
                                <ColorPickerPopover
                                    value={effect.shadowColor ?? DEFAULT_SHADOW.shadowColor}
                                    onChange={(c) => patch({ shadowColor: c })}
                                    brandColors={brandColors}
                                    documentColors={documentColors}
                                />
                            </div>
                        )}

                        {effect.type === 'float' && (
                            <div className="flex flex-col gap-3 mt-3">
                                <SliderRow
                                    label="Intensidade"
                                    value={effect.floatIntensity ?? DEFAULT_FLOAT.floatIntensity}
                                    min={0}
                                    max={100}
                                    onChange={(v) => patch({ floatIntensity: v })}
                                />
                            </div>
                        )}

                        {effect.type === 'hollow' && (
                            <div className="flex flex-col gap-3 mt-3">
                                <SliderRow
                                    label="Espessura"
                                    value={effect.hollowThickness ?? DEFAULT_HOLLOW.hollowThickness}
                                    min={0}
                                    max={100}
                                    onChange={(v) => patch({ hollowThickness: v })}
                                />
                            </div>
                        )}

                        {effect.type === 'background' && (
                            <div className="flex flex-col gap-3 mt-3">
                                <SliderRow
                                    label="Arredondamento"
                                    value={effect.bgRoundness ?? DEFAULT_BACKGROUND.bgRoundness}
                                    min={0}
                                    max={100}
                                    onChange={(v) => patch({ bgRoundness: v })}
                                />
                                <SliderRow
                                    label="Extensão"
                                    value={effect.bgExtension ?? DEFAULT_BACKGROUND.bgExtension}
                                    min={0}
                                    max={100}
                                    onChange={(v) => patch({ bgExtension: v })}
                                />
                                <SliderRow
                                    label="Transparência"
                                    value={effect.bgOpacity ?? DEFAULT_BACKGROUND.bgOpacity}
                                    min={0}
                                    max={100}
                                    onChange={(v) => patch({ bgOpacity: v })}
                                />
                                <ColorPickerPopover
                                    value={effect.bgColor ?? DEFAULT_BACKGROUND.bgColor}
                                    onChange={(c) => patch({ bgColor: c })}
                                    brandColors={brandColors}
                                    documentColors={documentColors}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
