import React, { useState, useEffect, useRef } from 'react';
import { useEditor } from '@craftjs/core';
import { setClipboard, cloneNodeTree } from '../../lib/clipboard';
import { saveBlock } from '../../lib/savedBlocks';
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
    SeparatorHorizontal,
    SlidersHorizontal,
    BookmarkPlus,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../constants';

// Buffered numeric input — commits to onChange only on blur or Enter,
// preventing the "snap to fallback" issue with controlled inputs.
const NumericInput = ({
    value,
    onChange,
    min,
    className,
    suffix,
}: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    className?: string;
    suffix?: string;
}) => {
    const [local, setLocal] = useState(String(value));
    const isFocused = useRef(false);
    const localRef = useRef(String(value));

    // Sync from external only when the input is not focused
    useEffect(() => {
        if (!isFocused.current) {
            setLocal(String(value));
            localRef.current = String(value);
        }
    }, [value]);

    const commit = () => {
        const parsed = parseInt(localRef.current);
        const clamped = isNaN(parsed) ? value : (min !== undefined ? Math.max(min, parsed) : parsed);
        onChange(clamped);
        localRef.current = String(clamped);
        setLocal(String(clamped));
    };

    return (
        <div className="flex items-center">
            <input
                type="number"
                value={local}
                onFocus={() => { isFocused.current = true; }}
                onBlur={() => { isFocused.current = false; commit(); }}
                onChange={(e) => { localRef.current = e.target.value; setLocal(e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
                className={className}
            />
            {suffix && <span className="text-[10px] text-[#888888] font-bold">{suffix}</span>}
        </div>
    );
};

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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);
    const [isSavingBlock, setIsSavingBlock] = useState(false);
    const [blockName, setBlockName] = useState('');

    // Close panels if selection changes
    useEffect(() => { setIsRenaming(false); setIsSettingsOpen(false); setIsSavingBlock(false); setBlockName(''); }, [selected?.id]);

    // Close settings panel on outside click
    useEffect(() => {
        if (!isSettingsOpen) return;
        const handleMouseDown = (e: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setIsSettingsOpen(false);
                setIsSavingBlock(false);
                setBlockName('');
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [isSettingsOpen]);

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

    const handleSaveBlock = () => {
        if (!selected || !blockName.trim()) return;
        try {
            const tree = query.node(selected.id).toNodeTree();
            saveBlock(blockName.trim(), tree);
            setIsSavingBlock(false);
            setBlockName('');
            setIsSettingsOpen(false);
        } catch (err) {
            console.error('[Toolbar] Save block failed:', err);
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

    const SHADOW_PRESETS = ['none', '0 4px 12px rgba(0,0,0,0.12)', '0 10px 30px rgba(0,0,0,0.25)'] as const;

    const getGridColCount = (gridTemplateColumns: string): number => {
        if (!gridTemplateColumns) return 2;
        if (gridTemplateColumns.includes('repeat')) {
            const match = gridTemplateColumns.match(/repeat\((\d+)/);
            return match ? parseInt(match[1]) : 2;
        }
        return gridTemplateColumns.split(' ').filter(Boolean).length || 2;
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

    // Settings Overflow Panel for Container
    const SettingsPanel = () => {
        const currentShadow = selected.props.boxShadow || 'none';
        const shadowIdx = SHADOW_PRESETS.indexOf(currentShadow as any);
        const shadowLabel = shadowIdx === 1 ? 'Soft' : shadowIdx === 2 ? 'Strong' : 'None';
        const hasShadow = shadowIdx > 0;
        const cols = getGridColCount(selected.props.gridTemplateColumns || '');
        const isGrid = selected.props.display === 'grid';

        return (
            <div className="absolute top-full mt-2 right-0 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-3 z-50 w-64 space-y-4">
                {/* Border group */}
                <div>
                    <span className="text-[9px] font-bold text-[#BBBFCA] uppercase tracking-wider block mb-2">Border</span>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-50 rounded-xl px-2 h-8 flex-1">
                            <span className="text-[10px] text-[#888888] font-bold mr-2">RAD</span>
                            <input
                                type="number"
                                value={selected.props.borderRadius || 0}
                                onChange={(e) => setProp('borderRadius', parseInt(e.target.value) || 0)}
                                className="bg-transparent border-none text-center text-[12px] font-black w-10 outline-none"
                            />
                        </div>
                        <div className="flex items-center bg-gray-50 rounded-xl px-2 h-8 flex-1">
                            <span className="text-[10px] text-[#888888] font-bold mr-2">BORD</span>
                            <input
                                type="number"
                                value={selected.props.borderWidth || 0}
                                onChange={(e) => setProp('borderWidth', parseInt(e.target.value) || 0)}
                                className="bg-transparent border-none text-center text-[12px] font-black w-10 outline-none"
                            />
                        </div>
                        <button
                            onClick={() => onOpenColorPicker(selected.id, 'borderColor', selected.props.borderColor || '#BBBFCA')}
                            className="w-8 h-8 rounded-xl border border-[#E5E5E5] hover:border-[#BBBFCA] shadow-sm transition-all relative overflow-hidden flex-shrink-0"
                            title="Cor da borda"
                            style={{ background: selected.props.borderColor || '#BBBFCA' }}
                        />
                    </div>
                </div>

                {/* Shadow group */}
                <div>
                    <span className="text-[9px] font-bold text-[#BBBFCA] uppercase tracking-wider block mb-2">Shadow</span>
                    <button
                        onClick={() => {
                            const next = SHADOW_PRESETS[(shadowIdx < 0 ? 0 : shadowIdx + 1) % SHADOW_PRESETS.length];
                            setProp('boxShadow', next);
                        }}
                        className={cn(
                            "w-full h-8 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold transition-all border",
                            hasShadow ? "bg-blue-50 text-[#0D99FF] border-blue-100" : "bg-gray-50 text-[#888888] border-transparent hover:border-gray-200"
                        )}
                        title="Clique para alternar sombra"
                    >
                        <Square size={12} className={hasShadow ? "drop-shadow-md" : ""} />
                        <span>SHD: {shadowLabel}</span>
                    </button>
                </div>

                {/* Display group */}
                <div>
                    <span className="text-[9px] font-bold text-[#BBBFCA] uppercase tracking-wider block mb-2">Display</span>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-50 rounded-xl p-0.5 flex-1">
                            <button
                                onClick={() => setProp('display', 'flex')}
                                className={cn(
                                    "flex-1 h-7 text-[10px] font-bold rounded-lg transition-all",
                                    (!selected.props.display || selected.props.display === 'flex') ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                )}
                            >Flex</button>
                            <button
                                onClick={() => {
                                    setProp('display', 'grid');
                                    if (!selected.props.gridTemplateColumns) setProp('gridTemplateColumns', 'repeat(2, 1fr)');
                                }}
                                className={cn(
                                    "flex-1 h-7 text-[10px] font-bold rounded-lg transition-all",
                                    selected.props.display === 'grid' ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                )}
                            >Grid</button>
                        </div>
                        {isGrid && (
                            <div className="flex items-center bg-gray-50 rounded-xl px-0.5 h-8">
                                <button
                                    onClick={() => cols > 1 && setProp('gridTemplateColumns', `repeat(${cols - 1}, 1fr)`)}
                                    disabled={cols <= 1}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
                                ><Minus size={11} /></button>
                                <span className="w-5 text-center text-[12px] font-black text-[#333333]">{cols}</span>
                                <button
                                    onClick={() => cols < 6 && setProp('gridTemplateColumns', `repeat(${cols + 1}, 1fr)`)}
                                    disabled={cols >= 6}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
                                ><Plus size={11} /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Effects group */}
                <div>
                    <span className="text-[9px] font-bold text-[#BBBFCA] uppercase tracking-wider block mb-2">Effects</span>
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-[#888888]">Blur</span>
                                <span className="text-[10px] font-bold text-[#333333]">{selected.props.backdropBlur || 0}px</span>
                            </div>
                            <input
                                type="range" min={0} max={40}
                                value={selected.props.backdropBlur || 0}
                                onChange={(e) => setProp('backdropBlur', parseInt(e.target.value))}
                                className="w-full accent-[#0D99FF]"
                            />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-[#888888] block mb-1">Background Image</span>
                            <input
                                type="text"
                                value={selected.props.backgroundImage || ''}
                                onChange={(e) => setProp('backgroundImage', e.target.value)}
                                placeholder="URL da imagem..."
                                className="w-full bg-[#F5F5F5] border-none rounded-lg px-2.5 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-[#0D99FF]"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-[#888888]">Opacity</span>
                                <span className="text-[10px] font-bold text-[#333333]">{selected.props.backgroundOpacity || 0}%</span>
                            </div>
                            <input
                                type="range" min={0} max={100}
                                value={selected.props.backgroundOpacity || 0}
                                onChange={(e) => setProp('backgroundOpacity', parseInt(e.target.value))}
                                className="w-full accent-[#0D99FF]"
                            />
                        </div>
                    </div>
                </div>

                {/* Presets group */}
                <div>
                    <span className="text-[9px] font-bold text-[#BBBFCA] uppercase tracking-wider block mb-2">Presets</span>
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={() => {
                                setProp('borderRadius', 16);
                                setProp('borderWidth', 0);
                                setProp('background', '#ffffff');
                                setProp('boxShadow', '0 10px 25px -5px rgba(0, 0, 0, 0.1)');
                            }}
                            className="p-1.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#333333] rounded-lg text-[10px] font-bold transition-colors"
                        >Surface</button>
                        <button
                            onClick={() => {
                                setProp('borderRadius', 16);
                                setProp('background', 'rgba(255,255,255,0.4)');
                                setProp('borderWidth', 1);
                                setProp('borderColor', 'rgba(255,255,255,0.3)');
                                setProp('backdropBlur', 10);
                            }}
                            className="p-1.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#333333] rounded-lg text-[10px] font-bold transition-colors"
                        >Glass</button>
                    </div>
                </div>

                {/* Save as Block */}
                <div className="border-t border-[#E5E5E5] pt-3">
                    {isSavingBlock ? (
                        <div className="flex gap-1.5">
                            <input
                                autoFocus
                                type="text"
                                value={blockName}
                                onChange={(e) => setBlockName(e.target.value)}
                                placeholder="Nome do bloco..."
                                className="flex-1 bg-[#F5F5F5] border-none rounded-lg px-2.5 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-[#0D99FF]"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveBlock();
                                    if (e.key === 'Escape') { setIsSavingBlock(false); setBlockName(''); }
                                }}
                            />
                            <button
                                onClick={handleSaveBlock}
                                disabled={!blockName.trim()}
                                className="px-2.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >Save</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsSavingBlock(true)}
                            className="w-full flex items-center justify-center gap-2 h-8 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#333333] rounded-lg text-[10px] font-bold transition-colors"
                        >
                            <BookmarkPlus size={12} />
                            Save as Block
                        </button>
                    )}
                </div>
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

                            {/* Container primary strip: PAD, GAP, direction, alignment, height */}
                            {isContainer && (
                                <>
                                    <div className="flex items-center gap-1.5 px-2">
                                        <div className="flex items-center bg-gray-50 rounded-xl px-2 h-9">
                                            <span className="text-[10px] text-[#888888] font-bold mr-2">PAD</span>
                                            <NumericInput
                                                value={selected.props.padding || 0}
                                                onChange={(v) => setProp('padding', v)}
                                                min={0}
                                                className="bg-transparent border-none text-center text-[12px] font-black w-8 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                                    {/* Flex direction toggle */}
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
                                        <NumericInput
                                            value={selected.props.gap || 0}
                                            onChange={(v) => setProp('gap', v)}
                                            min={0}
                                            className="bg-transparent border-none text-center text-[12px] font-black w-8 outline-none"
                                        />
                                    </div>

                                    <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                                    {/* Alignment Controls */}
                                    <div className="flex items-center gap-1">
                                        {(() => {
                                            const isRow = selected.props.flexDirection === 'row';

                                            const mainAxisButtons = isRow
                                                ? [
                                                    { icon: AlignStartVertical, value: 'flex-start', label: 'Esquerda' },
                                                    { icon: AlignCenterVertical, value: 'center', label: 'Centro' },
                                                    { icon: AlignEndVertical, value: 'flex-end', label: 'Direita' },
                                                    { icon: SeparatorHorizontal, value: 'space-between', label: 'Distribuir' },
                                                ]
                                                : [
                                                    { icon: AlignStartHorizontal, value: 'flex-start', label: 'Topo' },
                                                    { icon: AlignCenterHorizontal, value: 'center', label: 'Centro' },
                                                    { icon: AlignEndHorizontal, value: 'flex-end', label: 'Base' },
                                                    { icon: StretchHorizontal, value: 'space-between', label: 'Distribuir' },
                                                ];

                                            const crossAxisButtons = isRow
                                                ? [
                                                    { icon: AlignStartHorizontal, value: 'flex-start', label: 'Topo' },
                                                    { icon: AlignCenterHorizontal, value: 'center', label: 'Centro' },
                                                    { icon: AlignEndHorizontal, value: 'flex-end', label: 'Base' },
                                                    { icon: StretchVertical, value: 'stretch', label: 'Esticar' },
                                                ]
                                                : [
                                                    { icon: AlignStartVertical, value: 'flex-start', label: 'Esquerda' },
                                                    { icon: AlignCenterVertical, value: 'center', label: 'Centro' },
                                                    { icon: AlignEndVertical, value: 'flex-end', label: 'Direita' },
                                                    { icon: StretchHorizontal, value: 'stretch', label: 'Esticar' },
                                                ];

                                            const mainProp = 'justifyContent';
                                            const crossProp = 'alignItems';
                                            const mainAxisLabel = isRow ? 'Horizontal' : 'Vertical';
                                            const crossAxisLabel = isRow ? 'Vertical' : 'Horizontal';

                                            return (
                                                <>
                                                    <div className="flex bg-gray-50 rounded-xl p-0.5 h-9">
                                                        {mainAxisButtons.map((btn) => {
                                                            const isActive = (selected.props[mainProp] || 'center') === btn.value;
                                                            return (
                                                                <button
                                                                    key={`main-${btn.value}`}
                                                                    onClick={() => setProp(mainProp, btn.value)}
                                                                    className={cn(
                                                                        "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                                                        isActive ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                                                    )}
                                                                    title={`${mainAxisLabel}: ${btn.label}`}
                                                                >
                                                                    <btn.icon size={14} />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="flex bg-gray-50 rounded-xl p-0.5 h-9">
                                                        {crossAxisButtons.map((btn) => {
                                                            const isActive = (selected.props[crossProp] || 'center') === btn.value;
                                                            return (
                                                                <button
                                                                    key={`cross-${btn.value}`}
                                                                    onClick={() => setProp(crossProp, btn.value)}
                                                                    className={cn(
                                                                        "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                                                        isActive ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                                                    )}
                                                                    title={`${crossAxisLabel}: ${btn.label}`}
                                                                >
                                                                    <btn.icon size={14} />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                                    {/* Height Mode toggle */}
                                    {(() => {
                                        const h = selected.props.height as string | undefined;
                                        const mode = !h || h === 'auto' ? 'hug' : h === '100%' ? 'fill' : 'fix';
                                        const fixedPx = mode === 'fix' ? (parseInt(h!) || 100) : 100;
                                        return (
                                            <div className="flex items-center gap-1">
                                                <div className="flex bg-gray-50 rounded-xl p-0.5 h-9">
                                                    {(['hug', 'fill', 'fix'] as const).map((m) => (
                                                        <button
                                                            key={m}
                                                            onClick={() => {
                                                                if (m === 'hug') setProp('height', 'auto');
                                                                else if (m === 'fill') setProp('height', '100%');
                                                                else setProp('height', `${fixedPx}px`);
                                                            }}
                                                            className={cn(
                                                                "h-8 px-2 text-[10px] font-bold rounded-lg transition-all uppercase",
                                                                mode === m ? "bg-white shadow-sm text-[#0D99FF]" : "text-[#888888] hover:text-[#333333]"
                                                            )}
                                                            title={m === 'hug' ? 'Hug contents' : m === 'fill' ? 'Fill container' : 'Fixed height'}
                                                        >{m}</button>
                                                    ))}
                                                </div>
                                                {mode === 'fix' && (
                                                    <div className="flex items-center bg-gray-50 rounded-xl px-2 h-9">
                                                        <NumericInput
                                                            value={fixedPx}
                                                            onChange={(v) => setProp('height', `${v}px`)}
                                                            min={1}
                                                            className="bg-transparent border-none text-center text-[12px] font-black w-12 outline-none"
                                                            suffix="px"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* ⚙️ Settings overflow panel button */}
                                    <div className="relative ml-1" ref={settingsRef}>
                                        <button
                                            onClick={() => { setIsSettingsOpen(v => !v); if (isSettingsOpen) { setIsSavingBlock(false); setBlockName(''); } }}
                                            className={cn(
                                                "h-9 w-9 flex items-center justify-center rounded-xl transition-all",
                                                isSettingsOpen ? "bg-blue-50 text-[#0D99FF]" : "text-[#888888] hover:bg-gray-50"
                                            )}
                                            title="Configurações secundárias"
                                        >
                                            <SlidersHorizontal size={16} />
                                        </button>
                                        {isSettingsOpen && <SettingsPanel />}
                                    </div>
                                </>
                            )}

                            {/* Icon Name + Size + Stroke */}
                            {isIcon && (
                                <>
                                    <div className="px-2">
                                        <input
                                            type="text"
                                            value={selected.props.name || 'Star'}
                                            onChange={(e) => setProp('name', e.target.value)}
                                            className="bg-gray-50 border-none rounded-xl px-3 h-9 text-[11px] font-bold outline-none w-[100px]"
                                            placeholder="Nome Icone"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 px-1">
                                        <div className="flex items-center bg-gray-50 rounded-xl px-2 h-9">
                                            <span className="text-[10px] text-[#888888] font-bold mr-2">SZ</span>
                                            <input
                                                type="number"
                                                value={selected.props.size || 24}
                                                onChange={(e) => setProp('size', parseInt(e.target.value) || 24)}
                                                className="bg-transparent border-none text-center text-[12px] font-black w-8 outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center bg-gray-50 rounded-xl px-2 h-9">
                                            <span className="text-[10px] text-[#888888] font-bold mr-2">STK</span>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={selected.props.strokeWidth || 2}
                                                onChange={(e) => setProp('strokeWidth', parseFloat(e.target.value) || 2)}
                                                className="bg-transparent border-none text-center text-[12px] font-black w-8 outline-none"
                                            />
                                        </div>
                                    </div>
                                </>
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
