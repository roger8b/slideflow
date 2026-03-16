import React, { useState, useMemo } from 'react';
import {
    X,
    Plus,
    ExternalLink,
    Palette,
    Type,
    ImageIcon
} from 'lucide-react';
import { PresentationMetadata } from '../../types';
import { cn } from '../../constants';
import brandKits from '../../data/brandKits.json';

interface BrandKitPanelProps {
    metadata: PresentationMetadata;
    savedBrandKits: any[];
    onUpdate: (brand: PresentationMetadata['brand']) => void;
    onSaveBrandKit: () => void;
    onClose: () => void;
}

export const BrandKitPanel: React.FC<BrandKitPanelProps> = ({ metadata, savedBrandKits, onUpdate, onSaveBrandKit, onClose }) => {
    const brand = metadata.brand || {
        colors: { primary: '#0D99FF', secondary: '#495464', background: '#FFFFFF', surface: '#F8F9FA', text: '#333333' },
        fonts: { title: 'Inter', header: 'Inter', subheader: 'Inter', body: 'Inter' },
        fontSizes: { title: 48, header: 32, subheader: 24, body: 18 },
        fontWeights: { title: '700', header: '600', subheader: '500', body: '400' }
    };

    const updateColor = (key: keyof typeof brand.colors, value: string) => {
        onUpdate({
            ...brand,
            colors: { ...brand.colors, [key]: value }
        });
    };

    const updateFont = (key: keyof typeof brand.fonts, value: string) => {
        onUpdate({
            ...brand,
            fonts: { ...brand.fonts, [key]: value }
        });
    };

    const updateFontSize = (key: keyof typeof brand.fontSizes, value: number) => {
        onUpdate({
            ...brand,
            fontSizes: { ...brand.fontSizes, [key]: value }
        });
    };

    const updateFontWeight = (key: keyof typeof brand.fontWeights, value: string) => {
        onUpdate({
            ...brand,
            fontWeights: { ...brand.fontWeights, [key]: value }
        });
    };

    const [activeFontEdit, setActiveFontEdit] = useState<string | null>(null);

    const allBrandKits = useMemo(() => [...savedBrandKits, ...brandKits], [savedBrandKits, brandKits]);

    const updateLogo = (url: string) => {
        onUpdate({ ...brand, logoUrl: url });
    };

    return (
        <div className="w-80 h-full bg-white border-r border-[#E5E5E5] flex flex-col shadow-xl z-20 animate-in slide-in-from-left duration-300">
            <div className="h-12 px-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50/50">
                <h2 className="text-[13px] font-bold text-[#333333] flex items-center gap-2">
                    <Palette size={16} className="text-[#0D99FF]" /> Kit de Marca
                </h2>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-[#888888]"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Brand Kit library */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Estilos Prontos</h3>
                        <button
                            onClick={onSaveBrandKit}
                            className="bg-[#0D99FF]/10 text-[#0D99FF] hover:bg-[#0D99FF]/20 px-2 py-1 rounded text-[9px] font-bold transition-colors flex items-center gap-1"
                            title="Salvar estilo atual como modelo"
                        >
                            <Plus size={10} strokeWidth={3} /> Salvar Atual
                        </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {allBrandKits.map((kit) => (
                            <button
                                key={kit.id}
                                onClick={() => onUpdate(kit as any)}
                                className="flex-shrink-0 group flex flex-col items-center gap-1"
                            >
                                <div
                                    className="w-14 h-14 rounded-xl border-2 border-transparent group-hover:border-[#0D99FF] transition-all overflow-hidden flex flex-col shadow-sm"
                                    style={{ backgroundColor: kit.colors.background }}
                                >
                                    <div className="flex-1 flex items-center justify-center font-bold" style={{ color: kit.colors.primary, fontFamily: kit.fonts.title }}>Aa</div>
                                    <div className="h-4 flex">
                                        <div className="flex-1" style={{ backgroundColor: kit.colors.primary }} />
                                        <div className="flex-1" style={{ backgroundColor: kit.colors.secondary }} />
                                    </div>
                                </div>
                                <span className="text-[9px] font-medium text-[#888888] truncate w-14 text-center">{kit.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Logos Section */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Logotipos</h3>
                        <button className="text-[#0D99FF] hover:bg-blue-50 p-1 rounded-md transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Link do logotipo (URL)"
                                value={brand.logoUrl || ''}
                                onChange={(e) => updateLogo(e.target.value)}
                                className="w-full text-[12px] px-3 py-2 bg-gray-50 border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#0D99FF] transition-all"
                            />
                            <ExternalLink size={12} className="absolute right-3 top-2.5 text-[#BBBBBB]" />
                        </div>
                        {brand.logoUrl && (
                            <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-[#E5E5E5]">
                                <img src={brand.logoUrl} alt="Logo Preview" className="max-w-[80%] max-h-[80%] object-contain" />
                            </div>
                        )}
                        {!brand.logoUrl && (
                            <div className="h-24 w-full border-2 border-dashed border-[#E5E5E5] rounded-lg flex flex-col items-center justify-center text-[#BBBBBB] gap-1">
                                <ImageIcon size={20} />
                                <span className="text-[10px] font-medium">Nenhum logo definido</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Colors Section */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Cores da marca</h3>
                        <button className="text-[#0D99FF] hover:bg-blue-50 p-1 rounded-md transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { key: 'primary', label: 'Primária' },
                            { key: 'secondary', label: 'Secundária' },
                            { key: 'background', label: 'Fundo' },
                            { key: 'text', label: 'Texto' }
                        ].map((color) => (
                            <div key={color.key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-[#E5E5E5] group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-6 h-6 rounded border border-black/10 shadow-sm relative overflow-hidden"
                                        style={{ backgroundColor: brand.colors[color.key as keyof typeof brand.colors] }}
                                    >
                                        <input
                                            type="color"
                                            value={brand.colors[color.key as keyof typeof brand.colors]}
                                            onChange={(e) => updateColor(color.key as keyof typeof brand.colors, e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                    <span className="text-[12px] font-medium text-[#333333]">{color.label}</span>
                                </div>
                                <span className="text-[10px] font-mono text-[#888888] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                    {brand.colors[color.key as keyof typeof brand.colors]}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Typography Section */}
                <section className="space-y-3 pb-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Fontes</h3>
                        <button className="text-[#0D99FF] hover:bg-blue-50 p-1 rounded-md transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {[
                            { key: 'title', label: 'Título' },
                            { key: 'header', label: 'Cabeçalho' },
                            { key: 'subheader', label: 'Subcabeçalho' },
                            { key: 'body', label: 'Corpo' }
                        ].map((font) => (
                            <div
                                key={font.key}
                                className={cn(
                                    "p-3 bg-gray-50 rounded-lg border transition-all cursor-pointer group",
                                    activeFontEdit === font.key ? "border-[#0D99FF] ring-1 ring-blue-100 bg-white" : "border-[#E5E5E5] hover:border-[#0D99FF]"
                                )}
                                onClick={() => setActiveFontEdit(activeFontEdit === font.key ? null : font.key)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-[#888888] uppercase">{font.label}</span>
                                    <Type size={12} className={cn("transition-colors", activeFontEdit === font.key ? "text-[#0D99FF]" : "text-[#BBBBBB]")} />
                                </div>
                                <div className="text-[14px] text-[#333333] font-medium truncate">
                                    {brand.fonts[font.key as keyof typeof brand.fonts]}
                                </div>

                                {activeFontEdit === font.key && (
                                    <div className="mt-3 space-y-2 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
                                        <div>
                                            <label className="text-[9px] font-bold text-[#888888] uppercase block mb-1">Família</label>
                                            <select
                                                value={brand.fonts[font.key as keyof typeof brand.fonts]}
                                                onChange={(e) => updateFont(font.key as keyof typeof brand.fonts, e.target.value)}
                                                className="w-full text-[12px] px-2 py-1.5 bg-gray-50 border border-[#E5E5E5] rounded focus:outline-none focus:border-[#0D99FF] appearance-none"
                                            >
                                                <optgroup label="Sans Serif (Modernas)">
                                                    <option value="Inter, sans-serif">Inter</option>
                                                    <option value="'Instrument Sans', sans-serif">Instrument Sans</option>
                                                    <option value="Outfit, sans-serif">Outfit</option>
                                                    <option value="Montserrat, sans-serif">Montserrat</option>
                                                    <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                                                    <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans</option>
                                                </optgroup>
                                                <optgroup label="Serif (Clássicas)">
                                                    <option value="'EB Garamond', serif">EB Garamond</option>
                                                    <option value="'Playfair Display', serif">Playfair Display</option>
                                                    <option value="'Fraunces', serif">Fraunces</option>
                                                    <option value="Libre Baskerville, serif">Libre Baskerville</option>
                                                </optgroup>
                                                <optgroup label="Display & Decorativas">
                                                    <option value="Syne, sans-serif">Syne (Bold/Art)</option>
                                                    <option value="'Clash Display', sans-serif">Clash Display</option>
                                                    <option value="'Cabinet Grotesk', sans-serif">Cabinet Grotesk</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[9px] font-bold text-[#888888] uppercase block mb-1">Tamanho</label>
                                                <input
                                                    type="number"
                                                    value={brand.fontSizes[font.key as keyof typeof brand.fontSizes]}
                                                    onChange={(e) => updateFontSize(font.key as keyof typeof brand.fontSizes, parseInt(e.target.value))}
                                                    className="w-full text-[12px] px-2 py-1.5 bg-gray-50 border border-[#E5E5E5] rounded focus:outline-none focus:border-[#0D99FF]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-[#888888] uppercase block mb-1">Peso (Style)</label>
                                                <select
                                                    value={brand.fontWeights[font.key as keyof typeof brand.fontWeights]}
                                                    onChange={(e) => updateFontWeight(font.key as keyof typeof brand.fontWeights, e.target.value)}
                                                    className="w-full text-[12px] px-2 py-1.5 bg-gray-50 border border-[#E5E5E5] rounded focus:outline-none focus:border-[#0D99FF] appearance-none"
                                                >
                                                    <option value="400">Regular (400)</option>
                                                    <option value="500">Medium (500)</option>
                                                    <option value="600">SemiBold (600)</option>
                                                    <option value="700">Bold (700)</option>
                                                    <option value="800">ExtraBold (800)</option>
                                                    <option value="900">Black (900)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-4 border-t border-[#E5E5E5] bg-gray-50/50">
                <button
                    onClick={onClose}
                    className="w-full py-2 bg-[#0D99FF] text-white text-[12px] font-bold rounded-md shadow-sm hover:bg-blue-600 transition-all active:scale-95"
                >
                    Aplicar à Marca
                </button>
            </div>
        </div>
    );
};
