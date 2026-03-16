import React, { useState, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import {
    Type,
    Trash2,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Square,
    Palette,
    Circle,
    Plus,
    Minus,
    Layers,
    ChevronDown,
    Layout,
    Star,
    Image as ImageIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ContextualToolbar = ({
    metadata,
    onOpenColorPicker
}: {
    metadata: any;
    onOpenColorPicker: (nodeId: string, propKey: string, value: string) => void;
}) => {
    const { actions, selected, query } = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId) {
            const node = state.nodes[currentNodeId];
            if (node) {
                selected = {
                    id: currentNodeId,
                    name: node.data.displayName || node.data.name,
                    props: node.data.props,
                    isDeletable: query.node(currentNodeId).isDeletable(),
                };
            }
        }

        return { selected };
    });

    const setProp = (key: string, value: any) => {
        if (selected) {
            actions.setProp(selected.id, (props) => {
                props[key] = value;
            });
        }
    };

    // Listen for events from universal color sidebar
    useEffect(() => {
        const handleExternalPropSet = (e: any) => {
            const { nodeId, key, value } = e.detail;
            if (selected && selected.id === nodeId) {
                setProp(key, value);
            }
        };
        window.addEventListener('set-editor-prop', handleExternalPropSet);
        return () => window.removeEventListener('set-editor-prop', handleExternalPropSet);
    }, [selected?.id]);

    const brand = metadata?.brand || {
        colors: { primary: '#0D99FF', secondary: '#495464', background: '#FFFFFF', surface: '#F8F9FA', text: '#333333' },
        fonts: { title: 'Inter', header: 'Inter', subheader: 'Inter', body: 'Inter' }
    };

    const getHexFromVar = (val: string) => {
        if (!val) return '#ffffff';
        if (val.startsWith('#')) return val;
        if (val.startsWith('var(--brand-')) {
            const key = val.replace('var(--brand-', '').replace(')', '');
            return brand.colors[key] || '#ffffff';
        }
        return val;
    };

    if (!selected) return null;

    const isText = selected.name === 'Title' || selected.name === 'Text';
    const isContainer = selected.name === 'Container';
    const isIcon = selected.name === 'Icon';
    const isImage = selected.name === 'Image';

    // Color Selector Component (Opens Sidebar)
    const ColorSelector = ({ propKey, label }: { propKey: string, label?: string }) => {
        const value = selected.props[propKey];
        const hex = getHexFromVar(value);
        return (
            <div className="flex items-center gap-1.5 px-2 group">
                {label && <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">{label}</span>}
                <button
                    onClick={() => onOpenColorPicker(selected.id, propKey, value)}
                    className="w-10 h-10 rounded-xl border border-[#E5E5E5] group-hover:border-[#BBBFCA] p-1.5 transition-all flex items-center justify-center relative overflow-hidden shadow-sm active:scale-95"
                    title={`Alterar ${label || 'cor'}`}
                >
                    <div className="absolute inset-0 transition-opacity" style={{ background: value }} />
                    <Palette size={14} className={hex.toLowerCase() === '#ffffff' ? 'text-gray-400 z-10' : 'text-white/40 z-10'} />
                </button>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute top-16 left-0 right-0 flex justify-center z-40 pointer-events-none"
            >
                <div className="pointer-events-auto bg-white p-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E5E5E5] flex items-center gap-0.5 h-11">
                    {/* Header: Component Icon & Indicator */}
                    <div className="flex items-center gap-2 px-3 border-r border-[#E5E5E5] text-[10px] font-bold text-[#333333] uppercase tracking-widest whitespace-nowrap h-full">
                        {isText && <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center"><Type size={12} className="text-[#0D99FF]" /></div>}
                        {isContainer && <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center"><Layout size={12} className="text-purple-500" /></div>}
                        {isIcon && <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center"><Star size={12} className="text-amber-500" /></div>}
                        {isImage && <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center"><ImageIcon size={12} className="text-emerald-500" /></div>}
                        <span className="ml-1 opacity-70">{selected.name}</span>
                    </div>

                    {/* TEXT CONTROLS */}
                    {isText && (
                        <>
                            <select
                                value={selected.props.fontFamily || ''}
                                onChange={(e) => setProp('fontFamily', e.target.value)}
                                className="bg-transparent border-none text-[12px] font-bold outline-none px-3 hover:bg-gray-50 rounded-xl h-9 transition-colors max-w-[140px] appearance-none"
                            >
                                {Object.entries(brand.fonts).map(([key, value]) => (
                                    <option key={key} value={`var(--brand-font-${key})`}>
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                            <div className="flex items-center bg-gray-50 rounded-xl px-0.5 h-9">
                                <button
                                    onClick={() => setProp('fontSize', Math.max(8, (selected.props.fontSize || 16) - 1))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                >
                                    <Minus size={12} />
                                </button>
                                <input
                                    type="number"
                                    value={selected.props.fontSize || 16}
                                    onChange={(e) => setProp('fontSize', parseInt(e.target.value) || 16)}
                                    className="bg-transparent border-none text-center text-[12px] font-black w-10 outline-none"
                                />
                                <button
                                    onClick={() => setProp('fontSize', (selected.props.fontSize || 16) + 1)}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>

                            <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                            <ColorSelector propKey="color" />

                            <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                            <div className="flex items-center gap-0.5 px-1">
                                {[
                                    { icon: Bold, key: 'fontWeight', val: 'bold', active: selected.props.fontWeight === 'bold' },
                                    { icon: Italic, key: 'fontStyle', val: 'italic', active: selected.props.fontStyle === 'italic' },
                                    { icon: Underline, key: 'textDecoration', val: 'underline', active: selected.props.textDecoration === 'underline' }
                                ].map((btn, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setProp(btn.key, btn.active ? 'normal' : btn.val)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${btn.active ? 'bg-blue-50 text-[#0D99FF]' : 'text-[#888888] hover:bg-gray-50'}`}
                                    >
                                        <btn.icon size={16} />
                                    </button>
                                ))}
                            </div>

                            <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                            <div className="flex items-center gap-0.5 px-1">
                                {[
                                    { icon: AlignLeft, value: 'left' },
                                    { icon: AlignCenter, value: 'center' },
                                    { icon: AlignRight, value: 'right' }
                                ].map((btn, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setProp('textAlign', btn.value)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${selected.props.textAlign === btn.value ? 'bg-blue-50 text-[#0D99FF]' : 'text-[#888888] hover:bg-gray-50'}`}
                                    >
                                        <btn.icon size={16} />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* CONTAINER & ICON CONTROLS */}
                    {(isContainer || isIcon) && (
                        <>
                            <ColorSelector propKey={isContainer ? "background" : "color"} label={isContainer ? "Fill" : ""} />

                            <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                            {/* Radius & Border (Compact) */}
                            <div className="flex items-center gap-1.5 px-2">
                                <div className="flex items-center bg-gray-50 rounded-xl px-2 h-9">
                                    <span className="text-[10px] text-[#888888] font-bold mr-2">RAD</span>
                                    <input
                                        type="number"
                                        value={selected.props.borderRadius || 0}
                                        onChange={(e) => setProp('borderRadius', parseInt(e.target.value) || 0)}
                                        className="bg-transparent border-none text-center text-[12px] font-black w-8 outline-none"
                                    />
                                </div>
                                <div className="flex items-center bg-gray-50 rounded-xl px-2 h-9">
                                    <span className="text-[10px] text-[#888888] font-bold mr-2">BORD</span>
                                    <input
                                        type="number"
                                        value={selected.props.borderWidth || 0}
                                        onChange={(e) => setProp('borderWidth', parseInt(e.target.value) || 0)}
                                        className="bg-transparent border-none text-center text-[12px] font-black w-8 outline-none"
                                    />
                                </div>
                                {isContainer && (
                                    <div className="flex items-center bg-gray-50 rounded-xl px-2 h-9">
                                        <span className="text-[10px] text-[#888888] font-bold mr-2">PAD</span>
                                        <input
                                            type="number"
                                            value={selected.props.padding || 0}
                                            onChange={(e) => setProp('padding', parseInt(e.target.value) || 0)}
                                            className="bg-transparent border-none text-center text-[12px] font-black w-8 outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                            {/* Direction/Flex (For Container) */}
                            {isContainer && (
                                <div className="px-1">
                                    <button
                                        onClick={() => setProp('flexDirection', selected.props.flexDirection === 'row' ? 'column' : 'row')}
                                        className="flex items-center gap-2 px-3 h-9 hover:bg-gray-50 rounded-xl transition-all"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <div className={`h-1 w-3 rounded-full ${selected.props.flexDirection === 'row' ? 'bg-[#0D99FF]' : 'bg-[#BBBFCA]'}`} />
                                            <div className={`h-1 w-3 rounded-full ${selected.props.flexDirection === 'row' ? 'bg-[#0D99FF]' : 'bg-[#BBBFCA]'}`} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#333333]">{selected.props.flexDirection === 'row' ? 'Horizontal' : 'Vertical'}</span>
                                    </button>
                                </div>
                            )}

                            {/* Icon Name */}
                            {isIcon && (
                                <div className="px-2">
                                    <input
                                        type="text"
                                        value={selected.props.name || 'Star'}
                                        onChange={(e) => setProp('name', e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl px-3 h-9 text-[11px] font-bold outline-none w-[100px]"
                                        placeholder="Nome Icone"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* IMAGE URL */}
                    {isImage && (
                        <div className="px-3 flex items-center gap-2">
                            <input
                                type="text"
                                value={selected.props.src || ''}
                                onChange={(e) => setProp('src', e.target.value)}
                                className="bg-gray-50 border-none rounded-xl px-3 h-9 text-[11px] font-medium outline-none w-[320px]"
                                placeholder="Insira a URL da imagem aqui..."
                            />
                        </div>
                    )}

                    <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                    {/* Global Actions */}
                    <div className="flex items-center px-1">
                        {selected.isDeletable && (
                            <button
                                onClick={() => actions.delete(selected.id)}
                                className="w-9 h-9 flex items-center justify-center text-[#888888] hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-90"
                                title="Deletar Elemento"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
