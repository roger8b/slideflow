import React, { useState, useEffect, useRef } from 'react';
import { useEditor } from '@craftjs/core';
import { setClipboard, cloneNodeTree } from '../../lib/clipboard';
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
    Image as ImageIcon,
    StretchHorizontal,
    Minimize2,
    Pencil,
    Copy,
    CopyPlus,
    Rows,
    Columns,
    AlignStartVertical,
    AlignCenterVertical,
    AlignEndVertical,
    StretchVertical,
    AlignStartHorizontal,
    AlignCenterHorizontal,
    AlignEndHorizontal,
    SeparatorHorizontal
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../constants';

export const ContextualToolbar = ({
    metadata,
    onOpenColorPicker,
    onOpenFontPicker,
    onSerializedNodesChange,
}: {
    metadata: any;
    onOpenColorPicker: (nodeId: string, propKey: string, value: string) => void;
    onOpenFontPicker?: (nodeId: string, currentFont: string, currentStyle: { fontFamily: string; fontSize: number; fontWeight: string | number } | null) => void;
    onSerializedNodesChange?: (nodes: Record<string, any>) => void;
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
                    customLabel: (node.data.custom?.label as string | undefined) || null,
                    props: node.data.props,
                    isDeletable: query.node(currentNodeId).isDeletable(),
                };
            }
        }

        return { selected };
    });

    const [isRenaming, setIsRenaming] = useState(false);
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Close rename if selection changes
    useEffect(() => { setIsRenaming(false); }, [selected?.id]);

    useEffect(() => {
        if (isRenaming) renameInputRef.current?.select();
    }, [isRenaming]);

    const commitRename = (value: string) => {
        if (!selected) return;
        const newLabel = value.trim() || selected.name;
        actions.setCustom(selected.id, (c: Record<string, any>) => { c.label = newLabel; });
        setIsRenaming(false);
    };

    const handleCopy = () => {
        if (!selected) return;
        try {
            const tree = query.node(selected.id).toNodeTree();
            setClipboard(tree);
        } catch (err) {
            console.warn('[Toolbar] Copy failed:', err);
        }
    };

    const handleDuplicate = () => {
        if (!selected) return;
        try {
            const node = query.node(selected.id).get();
            const parentId = node.data.parent;
            if (parentId) {
                const tree = cloneNodeTree(query.node(selected.id).toNodeTree());
                const siblings: string[] = query.node(parentId).get().data.nodes ?? [];
                const idx = siblings.indexOf(selected.id);
                actions.addNodeTree(tree, parentId, idx + 1);
            }
        } catch (err) {
            console.warn('[Toolbar] Duplicate failed:', err);
        }
    };

    // Notify EditorContainer of serialized nodes for FontSidebar
    useEffect(() => {
        if (!onSerializedNodesChange) return;
        try {
            const nodes = query.getSerializedNodes();
            onSerializedNodesChange(nodes);
        } catch (_) { /* editor not ready */ }
    }, [selected?.id, onSerializedNodesChange]);

    const setProp = (key: string, value: any) => {
        if (selected) {
            actions.setProp(selected.id, (props) => {
                props[key] = value;
            });
        }
    };

    // Listen for events from universal color/font sidebars
    useEffect(() => {
        const handleExternalPropSet = (e: any) => {
            const { nodeId, key, value } = e.detail;
            if (selected && selected.id === nodeId) {
                setProp(key, value);
            }
        };
        const handleExternalPropsSet = (e: any) => {
            const { nodeId, props } = e.detail;
            if (selected && selected.id === nodeId) {
                actions.setProp(selected.id, (p: any) => {
                    Object.assign(p, props);
                });
            }
        };
        window.addEventListener('set-editor-prop', handleExternalPropSet);
        window.addEventListener('set-editor-props', handleExternalPropsSet);
        return () => {
            window.removeEventListener('set-editor-prop', handleExternalPropSet);
            window.removeEventListener('set-editor-props', handleExternalPropsSet);
        };
    }, [selected?.id]);

    const brand = metadata?.brand || {
        colors: { primary: '#0D99FF', secondary: '#495464', background: '#FFFFFF', surface: '#F8F9FA', text: '#333333' },
        fonts: { title: 'Inter', header: 'Inter', subheader: 'Inter', body: 'Inter' }
    };

    const resolveFontDisplayName = (value: string): string => {
        if (!value) return 'Fonte';
        if (value.startsWith('var(--brand-font-')) {
            const role = value.replace('var(--brand-font-', '').replace(')', '');
            const fontValue = brand.fonts[role] || '';
            return fontValue.replace(/['"]/g, '').split(',')[0].trim() || 'Fonte';
        }
        return value.replace(/['"]/g, '').split(',')[0].trim() || 'Fonte';
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
                    {/* Header: Component Icon & Renamable Label */}
                    <div className="flex items-center gap-2 px-3 border-r border-[#E5E5E5] text-[10px] h-full">
                        {isText && <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0"><Type size={12} className="text-[#0D99FF]" /></div>}
                        {isContainer && <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center shrink-0"><Layout size={12} className="text-purple-500" /></div>}
                        {isIcon && <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center shrink-0"><Star size={12} className="text-amber-500" /></div>}
                        {isImage && <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center shrink-0"><ImageIcon size={12} className="text-emerald-500" /></div>}

                        {isRenaming ? (
                            <input
                                ref={renameInputRef}
                                className="bg-white border border-[#0D99FF] rounded px-1.5 py-0.5 text-[10px] font-bold text-[#333333] outline-none w-32"
                                defaultValue={selected.customLabel || selected.name}
                                onBlur={(e) => commitRename(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitRename(e.currentTarget.value);
                                    if (e.key === 'Escape') setIsRenaming(false);
                                }}
                            />
                        ) : (
                            <button
                                onClick={() => setIsRenaming(true)}
                                className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-gray-50 transition-colors group/rename max-w-[120px]"
                                title="Clique para renomear"
                            >
                                <span className="font-bold text-[#333333] uppercase tracking-widest truncate">
                                    {selected.customLabel || selected.name}
                                </span>
                                <Pencil size={10} className="text-[#BBBFCA] opacity-0 group-hover/rename:opacity-100 transition-opacity" />
                            </button>
                        )}
                    </div>

                    {/* TEXT CONTROLS */}
                    {isText && (
                        <>
                            <button
                                onClick={() => onOpenFontPicker?.(
                                    selected.id,
                                    selected.props.fontFamily || '',
                                    {
                                        fontFamily: selected.props.fontFamily || '',
                                        fontSize: selected.props.fontSize || 16,
                                        fontWeight: selected.props.fontWeight || 'normal',
                                    }
                                )}
                                className="bg-transparent border-none text-[12px] font-bold outline-none px-3 hover:bg-gray-50 rounded-xl h-9 transition-colors max-w-[160px] flex items-center gap-1.5 truncate"
                                title="Selecionar fonte"
                            >
                                <span className="truncate">
                                    {resolveFontDisplayName(selected.props.fontFamily || '')}
                                </span>
                                <ChevronDown size={12} className="shrink-0 text-[#888888]" />
                            </button>

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
                                    { icon: AlignRight, value: 'right' },
                                    { icon: AlignJustify, value: 'justify' }
                                ].map((btn, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setProp('textAlign', btn.value)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${selected.props.textAlign === btn.value || (!selected.props.textAlign && btn.value === 'left') ? 'bg-blue-50 text-[#0D99FF]' : 'text-[#888888] hover:bg-gray-50'}`}
                                    >
                                        <btn.icon size={16} />
                                    </button>
                                ))}
                            </div>

                            <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                            <div className="flex items-center gap-0.5 px-1">
                                {[
                                    { icon: StretchHorizontal, value: 'fill', label: 'Ocupar toda a linha' },
                                    { icon: Minimize2, value: 'hug', label: 'Ajustar ao conteúdo' }
                                ].map((btn, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setProp('widthMode', btn.value)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${(selected.props.widthMode === btn.value || (!selected.props.widthMode && btn.value === 'fill')) ? 'bg-blue-50 text-[#0D99FF]' : 'text-[#888888] hover:bg-gray-50'}`}
                                        title={btn.label}
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
                                <>
                                    <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>
                                    <div className="flex bg-gray-50 rounded-xl p-0.5 h-9">
                                        <button
                                            onClick={() => setProp('flexDirection', 'column')}
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                                selected.props.flexDirection === 'column' || !selected.props.flexDirection ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                            )}
                                            title="Column (Vertical)"
                                        >
                                            <Rows size={16} />
                                        </button>
                                        <button
                                            onClick={() => setProp('flexDirection', 'row')}
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                                selected.props.flexDirection === 'row' ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                            )}
                                            title="Row (Horizontal)"
                                        >
                                            <Columns size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center bg-gray-50 rounded-xl px-2 h-9 ml-1">
                                        <span className="text-[10px] text-[#888888] font-bold mr-2">GAP</span>
                                        <input
                                            type="number"
                                            value={selected.props.gap || 0}
                                            onChange={(e) => setProp('gap', parseInt(e.target.value) || 0)}
                                            className="bg-transparent border-none text-center text-[12px] font-black w-8 outline-none"
                                        />
                                    </div>
                                    <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                                    {/* Alignment Controls - Unified Axis Logic */}
                                    <div className="flex items-center gap-1">
                                        {/* Horizontal Control Group (X-Axis) */}
                                        <div className="flex bg-gray-50 rounded-xl p-0.5 h-9">
                                            {[
                                                { icon: AlignStartHorizontal, value: 'flex-start', label: 'Esquerda' },
                                                { icon: AlignCenterHorizontal, value: 'center', label: 'Centro' },
                                                { icon: AlignEndHorizontal, value: 'flex-end', label: 'Direita' },
                                                selected.props.flexDirection === 'row'
                                                    ? { icon: SeparatorHorizontal, value: 'space-between', label: 'Distribuir' }
                                                    : { icon: StretchHorizontal, value: 'stretch', label: 'Esticar' }
                                            ].map((btn) => {
                                                const isRow = selected.props.flexDirection === 'row';
                                                const currentProp = isRow ? (selected.props.justifyContent || 'center') : (selected.props.alignItems || 'center');
                                                const isActive = currentProp === btn.value;

                                                return (
                                                    <button
                                                        key={btn.value}
                                                        onClick={() => {
                                                            const propName = isRow ? 'justifyContent' : 'alignItems';
                                                            setProp(propName, btn.value);
                                                        }}
                                                        className={cn(
                                                            "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                                            isActive ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                                        )}
                                                        title={`Horizontal: ${btn.label}`}
                                                    >
                                                        <btn.icon size={14} />
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Vertical Control Group (Y-Axis) */}
                                        <div className="flex bg-gray-50 rounded-xl p-0.5 h-9">
                                            {[
                                                { icon: AlignStartVertical, value: 'flex-start', label: 'Topo' },
                                                { icon: AlignCenterVertical, value: 'center', label: 'Meio' },
                                                { icon: AlignEndVertical, value: 'flex-end', label: 'Base' },
                                                selected.props.flexDirection === 'row'
                                                    ? { icon: StretchVertical, value: 'stretch', label: 'Esticar' }
                                                    : { icon: SeparatorHorizontal, value: 'space-between', label: 'Distribuir' }
                                            ].map((btn) => {
                                                const isRow = selected.props.flexDirection === 'row';
                                                const currentProp = isRow ? (selected.props.alignItems || 'center') : (selected.props.justifyContent || 'center');
                                                const isActive = currentProp === btn.value;

                                                return (
                                                    <button
                                                        key={btn.value}
                                                        onClick={() => {
                                                            const propName = isRow ? 'alignItems' : 'justifyContent';
                                                            setProp(propName, btn.value);
                                                        }}
                                                        className={cn(
                                                            "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                                            isActive ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                                        )}
                                                        title={`Vertical: ${btn.label}`}
                                                    >
                                                        <btn.icon size={14} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
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
                    <div className="flex items-center px-1 gap-0.5">
                        <button
                            onClick={handleCopy}
                            className="w-9 h-9 flex items-center justify-center text-[#888888] hover:bg-gray-100 hover:text-[#333333] rounded-xl transition-all active:scale-90"
                            title="Copiar (Ctrl+C)"
                        >
                            <Copy size={15} />
                        </button>
                        <button
                            onClick={handleDuplicate}
                            className="w-9 h-9 flex items-center justify-center text-[#888888] hover:bg-gray-100 hover:text-[#333333] rounded-xl transition-all active:scale-90"
                            title="Duplicar (Ctrl+D)"
                        >
                            <CopyPlus size={16} />
                        </button>
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
