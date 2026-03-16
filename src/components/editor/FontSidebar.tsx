import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Type, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../constants';
import { FONT_LIBRARY, GOOGLE_FONTS_URL, FontVariant } from '../../constants/fonts';

interface BrandFonts {
    title: string;
    header: string;
    subheader: string;
    body: string;
    [key: string]: string;
}

interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: string | number;
    label: string;
}

interface FontExtras {
    fontWeight: number;
    fontStyle: 'normal' | 'italic';
}

interface FontSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentFont: string;
    currentStyle: { fontFamily: string; fontSize: number; fontWeight: string | number; fontStyle?: string } | null;
    onFontSelect: (value: string, extras?: FontExtras) => void;
    onStyleSelect: (style: { fontFamily: string; fontSize: number; fontWeight: string | number }) => void;
    brandFonts: BrandFonts;
    serializedNodes?: Record<string, any>;
}

const BRAND_ROLE_LABELS: Record<string, string> = {
    title: 'Título',
    header: 'Cabeçalho',
    subheader: 'Subcabeçalho',
    body: 'Corpo',
};

const BRAND_STYLE_DEFAULTS: Record<string, { fontSize: number; fontWeight: number; label: string }> = {
    title: { fontSize: 40, fontWeight: 700, label: 'Título' },
    header: { fontSize: 28, fontWeight: 700, label: 'Cabeçalho' },
    subheader: { fontSize: 20, fontWeight: 600, label: 'Subcabeçalho' },
    body: { fontSize: 16, fontWeight: 400, label: 'Corpo' },
};

function getDocumentFonts(serializedNodes: Record<string, any>): string[] {
    const fonts = new Set<string>();
    for (const node of Object.values(serializedNodes)) {
        const ff = node?.props?.fontFamily;
        if (ff && typeof ff === 'string' && !ff.startsWith('var(--brand-font-')) {
            fonts.add(ff);
        }
    }
    return Array.from(fonts);
}

function getDocumentStyles(serializedNodes: Record<string, any>): TextStyle[] {
    const map = new Map<string, TextStyle>();
    for (const node of Object.values(serializedNodes)) {
        const { fontFamily, fontSize, fontWeight } = node?.props || {};
        if (!fontFamily || !fontSize) continue;
        const key = `${fontFamily}|${fontSize}|${fontWeight}`;
        if (!map.has(key)) {
            map.set(key, { fontFamily, fontSize: Number(fontSize), fontWeight: fontWeight || 400, label: '' });
        }
    }
    const styles = Array.from(map.values()).sort((a, b) => b.fontSize - a.fontSize).slice(0, 5);
    const styleLabels = ['Título', 'Subtítulo', 'Corpo', 'Detalhe', 'Legenda'];
    return styles.map((s, i) => ({ ...s, label: styleLabels[i] || `Estilo ${i + 1}` }));
}

function resolveFontName(value: string, brandFonts: BrandFonts): string {
    if (!value) return value;
    if (value.startsWith('var(--brand-font-')) {
        const role = value.replace('var(--brand-font-', '').replace(')', '');
        return brandFonts[role] || value;
    }
    return value.replace(/['"]/g, '').split(',')[0].trim();
}

const SectionHeader = ({ label, action }: { label: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-4 py-2 mt-2">
        <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
            <Type size={11} />
            {label}
        </span>
        {action}
    </div>
);

// Expandable font row with optional variants
const FontRow = ({
    name,
    value,
    isActive,
    onClick,
    variants,
    expanded,
    onToggleExpand,
    onVariantSelect,
    activeVariant,
}: {
    name: string;
    value: string;
    isActive: boolean;
    onClick: () => void;
    variants?: FontVariant[];
    expanded?: boolean;
    onToggleExpand?: () => void;
    onVariantSelect?: (variant: FontVariant) => void;
    activeVariant?: { fontWeight: number; fontStyle: string } | null;
}) => (
    <div>
        {/* Main row */}
        <div
            className={cn(
                'flex items-center hover:bg-gray-50 transition-colors group',
                isActive && !expanded && 'bg-blue-50'
            )}
        >
            {/* Chevron toggle */}
            {variants && variants.length > 0 ? (
                <button
                    onClick={e => { e.stopPropagation(); onToggleExpand?.(); }}
                    className="pl-2 pr-1 py-2.5 shrink-0 text-[#BBBFCA] hover:text-[#0D99FF] transition-colors"
                    title="Ver variantes"
                >
                    <ChevronRight
                        size={14}
                        className={cn('transition-transform duration-200', expanded && 'rotate-90')}
                    />
                </button>
            ) : (
                <div className="w-7 shrink-0" />
            )}

            {/* Font name — click applies fontFamily only */}
            <button
                onClick={onClick}
                className="flex-1 flex items-center justify-between pr-4 py-2.5 text-left min-w-0"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span
                        className="text-[14px] text-[#333333] truncate"
                        style={{ fontFamily: value }}
                    >
                        {name}
                    </span>
                    <span
                        className="text-[12px] text-[#BBBFCA] shrink-0"
                        style={{ fontFamily: value }}
                    >
                        AaBbCc
                    </span>
                </div>
                {isActive && <Check size={14} className="text-[#0D99FF] shrink-0 ml-2" />}
            </button>
        </div>

        {/* Variant sub-items */}
        <AnimatePresence>
            {expanded && variants && variants.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                >
                    {variants.map((variant, i) => {
                        const isVariantActive =
                            isActive &&
                            activeVariant != null &&
                            Number(activeVariant.fontWeight) === variant.fontWeight &&
                            (activeVariant.fontStyle || 'normal') === variant.fontStyle;

                        return (
                            <button
                                key={i}
                                onClick={() => onVariantSelect?.(variant)}
                                className={cn(
                                    'w-full flex items-center justify-between pl-9 pr-4 py-2 hover:bg-gray-50 transition-colors text-left',
                                    isVariantActive && 'bg-blue-50'
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className="text-[13px] text-[#444444] truncate"
                                        style={{
                                            fontFamily: value,
                                            fontWeight: variant.fontWeight,
                                            fontStyle: variant.fontStyle,
                                        }}
                                    >
                                        {variant.label}
                                    </span>
                                    <span
                                        className="text-[11px] text-[#BBBFCA] shrink-0"
                                        style={{
                                            fontFamily: value,
                                            fontWeight: variant.fontWeight,
                                            fontStyle: variant.fontStyle,
                                        }}
                                    >
                                        AaBbCc
                                    </span>
                                </div>
                                {isVariantActive && <Check size={13} className="text-[#0D99FF] shrink-0 ml-2" />}
                            </button>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const StyleRow = ({
    style,
    isActive,
    onClick,
}: {
    style: TextStyle;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={cn(
            'w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left',
            isActive && 'bg-blue-50'
        )}
    >
        <span
            style={{
                fontFamily: style.fontFamily,
                fontSize: `${Math.min(style.fontSize, 24)}px`,
                fontWeight: style.fontWeight,
                lineHeight: 1.2,
            }}
            className="text-[#333333] truncate"
        >
            {style.label}
        </span>
        {isActive && <Check size={14} className="text-[#0D99FF] shrink-0 ml-2" />}
    </button>
);

export const FontSidebar: React.FC<FontSidebarProps> = ({
    isOpen,
    onClose,
    currentFont,
    currentStyle,
    onFontSelect,
    onStyleSelect,
    brandFonts,
    serializedNodes = {},
}) => {
    const [activeTab, setActiveTab] = useState<'fonte' | 'estilos'>('fonte');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFont, setExpandedFont] = useState<string | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Inject Google Fonts on mount
    useEffect(() => {
        const linkId = 'slideflow-font-library';
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = GOOGLE_FONTS_URL;
            document.head.appendChild(link);
        }
    }, []);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleMouseDown = (e: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [isOpen, onClose]);

    const documentFonts = useMemo(() => getDocumentFonts(serializedNodes), [serializedNodes]);

    const resolvedBrandFontValues = useMemo(() => Object.values(brandFonts), [brandFonts]);

    const libraryFonts = useMemo(
        () =>
            FONT_LIBRARY.filter(
                f =>
                    !resolvedBrandFontValues.some(bv =>
                        f.value.replace(/['"]/g, '').split(',')[0].trim() ===
                        bv.replace(/['"]/g, '').split(',')[0].trim()
                    ) &&
                    !documentFonts.includes(f.value)
            ),
        [resolvedBrandFontValues, documentFonts]
    );

    const q = searchQuery.toLowerCase();
    const filteredDocFonts = documentFonts.filter(v =>
        resolveFontName(v, brandFonts).toLowerCase().includes(q)
    );
    const filteredBrandRoles = Object.entries(brandFonts).filter(([role, fontValue]) => {
        const displayName = resolveFontName(fontValue, brandFonts);
        return (
            BRAND_ROLE_LABELS[role]?.toLowerCase().includes(q) ||
            displayName.toLowerCase().includes(q)
        );
    });
    const filteredLibrary = libraryFonts.filter(f => f.name.toLowerCase().includes(q));
    const hasResults = filteredDocFonts.length > 0 || filteredBrandRoles.length > 0 || filteredLibrary.length > 0;

    const documentStyles = useMemo(() => getDocumentStyles(serializedNodes), [serializedNodes]);

    const activeBrandStyleRole = Object.keys(BRAND_STYLE_DEFAULTS).find(role => {
        const defaults = BRAND_STYLE_DEFAULTS[role];
        return (
            currentStyle?.fontFamily === `var(--brand-font-${role})` &&
            currentStyle?.fontSize === defaults.fontSize &&
            Number(currentStyle?.fontWeight) === defaults.fontWeight
        );
    });

    const activeDocStyleKey = documentStyles.findIndex(
        s =>
            currentStyle?.fontFamily === s.fontFamily &&
            currentStyle?.fontSize === s.fontSize &&
            Number(currentStyle?.fontWeight) === Number(s.fontWeight)
    );

    // Active variant for matching font rows
    const activeVariant = currentFont
        ? {
              fontWeight: Number(currentStyle?.fontWeight) || 400,
              fontStyle: (currentStyle?.fontStyle as string) || 'normal',
          }
        : null;

    const handleToggleExpand = (fontValue: string) => {
        setExpandedFont(prev => (prev === fontValue ? null : fontValue));
    };

    const handleVariantSelect = (fontValue: string, variant: FontVariant) => {
        onFontSelect(fontValue, { fontWeight: variant.fontWeight, fontStyle: variant.fontStyle });
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
                        <h2 className="text-[13px] font-bold text-[#333333] flex-1">Fonte</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-[#888888]"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#E5E5E5] shrink-0">
                        {(['fonte', 'estilos'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    'flex-1 py-2.5 text-[11px] font-semibold transition-colors',
                                    activeTab === tab
                                        ? 'text-[#0D99FF] border-b-2 border-[#0D99FF]'
                                        : 'text-[#888888] hover:text-[#333333]'
                                )}
                            >
                                {tab === 'fonte' ? 'Fonte' : 'Estilos de Texto'}
                            </button>
                        ))}
                    </div>

                    {/* Tab: Fonte */}
                    {activeTab === 'fonte' && (
                        <div className="flex flex-col flex-1 overflow-hidden">
                            {/* Search */}
                            <div className="p-3 shrink-0">
                                <div className="relative group">
                                    <Search
                                        size={13}
                                        className="absolute left-3 top-2.5 text-[#BBBFCA] group-focus-within:text-[#0D99FF] transition-colors"
                                    />
                                    <input
                                        type="text"
                                        placeholder='Experimente "Inter" ou "Serif"'
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#F5F5F5] border-none rounded-lg py-2 pl-8 pr-3 text-[12px] placeholder:text-[#BBBFCA] outline-none focus:ring-1 focus:ring-[#0D99FF] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pb-6">
                                {searchQuery && !hasResults && (
                                    <p className="text-center text-[12px] text-[#BBBFCA] py-8">
                                        Nenhuma fonte encontrada
                                    </p>
                                )}

                                {/* Fontes do documento */}
                                {filteredDocFonts.length > 0 && (
                                    <div>
                                        <SectionHeader label="Fontes do documento" />
                                        {filteredDocFonts.map(value => (
                                            <FontRow
                                                key={value}
                                                name={resolveFontName(value, brandFonts)}
                                                value={value}
                                                isActive={currentFont === value}
                                                onClick={() => onFontSelect(value)}
                                                expanded={expandedFont === value}
                                                onToggleExpand={() => handleToggleExpand(value)}
                                                activeVariant={currentFont === value ? activeVariant : null}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Kit de marca */}
                                {filteredBrandRoles.length > 0 && (
                                    <div>
                                        <SectionHeader label="Kit de marca" />
                                        {filteredBrandRoles.map(([role, fontValue]) => {
                                            const tokenValue = `var(--brand-font-${role})`;
                                            const displayName = resolveFontName(fontValue, brandFonts);
                                            return (
                                                <button
                                                    key={role}
                                                    onClick={() => onFontSelect(tokenValue)}
                                                    className={cn(
                                                        'w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left',
                                                        currentFont === tokenValue && 'bg-blue-50'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="min-w-0">
                                                            <span
                                                                className="text-[14px] text-[#333333] block truncate"
                                                                style={{ fontFamily: fontValue }}
                                                            >
                                                                {displayName}
                                                            </span>
                                                            <span className="text-[10px] text-[#BBBFCA]">
                                                                {BRAND_ROLE_LABELS[role]}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className="text-[12px] text-[#BBBFCA] shrink-0"
                                                            style={{ fontFamily: fontValue }}
                                                        >
                                                            AaBbCc
                                                        </span>
                                                    </div>
                                                    {currentFont === tokenValue && (
                                                        <Check size={14} className="text-[#0D99FF] shrink-0 ml-2" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Biblioteca */}
                                {filteredLibrary.length > 0 && (
                                    <div>
                                        <SectionHeader label="Biblioteca" />
                                        {filteredLibrary.map(font => (
                                            <FontRow
                                                key={font.value}
                                                name={font.name}
                                                value={font.value}
                                                isActive={currentFont === font.value}
                                                onClick={() => onFontSelect(font.value)}
                                                variants={font.variants}
                                                expanded={expandedFont === font.value}
                                                onToggleExpand={() => handleToggleExpand(font.value)}
                                                onVariantSelect={variant => handleVariantSelect(font.value, variant)}
                                                activeVariant={currentFont === font.value ? activeVariant : null}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: Estilos de Texto */}
                    {activeTab === 'estilos' && (
                        <div className="flex-1 overflow-y-auto pb-6">
                            <div>
                                <SectionHeader label="Kit de marca" />
                                {Object.entries(BRAND_STYLE_DEFAULTS).map(([role, defaults]) => {
                                    const fontFamily = `var(--brand-font-${role})`;
                                    const resolvedFont = brandFonts[role] || 'Inter';
                                    return (
                                        <button
                                            key={role}
                                            onClick={() => onStyleSelect({ fontFamily, fontSize: defaults.fontSize, fontWeight: defaults.fontWeight })}
                                            className={cn(
                                                'w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left',
                                                activeBrandStyleRole === role && 'bg-blue-50'
                                            )}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: resolvedFont,
                                                    fontSize: `${Math.min(defaults.fontSize, 24)}px`,
                                                    fontWeight: defaults.fontWeight,
                                                    lineHeight: 1.2,
                                                }}
                                                className="text-[#333333] truncate"
                                            >
                                                {defaults.label}
                                            </span>
                                            {activeBrandStyleRole === role && (
                                                <Check size={14} className="text-[#0D99FF] shrink-0 ml-2" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {documentStyles.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between px-4 py-2 mt-2 border-t border-[#F0F0F0]">
                                        <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
                                            <Type size={11} /> Estilos do documento
                                        </span>
                                    </div>
                                    {documentStyles.map((style, i) => (
                                        <StyleRow
                                            key={i}
                                            style={style}
                                            isActive={activeDocStyleKey === i}
                                            onClick={() =>
                                                onStyleSelect({
                                                    fontFamily: style.fontFamily,
                                                    fontSize: style.fontSize,
                                                    fontWeight: style.fontWeight,
                                                })
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
