import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { AlignLeft, AlignCenter, AlignRight, Box, Trash2, BookmarkPlus, ChevronDown, ChevronRight, Pencil, Copy, StretchHorizontal, Minimize2 } from 'lucide-react';
import { saveBlock } from '../../lib/savedBlocks';
import { setClipboard } from '../../lib/clipboard';

const Section = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-[#E5E5E5]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
                <span className="text-[10px] font-semibold tracking-wide uppercase text-[#333333] select-none">{title}</span>
                {isOpen ? <ChevronDown size={14} className="text-[#888888]" /> : <ChevronRight size={14} className="text-[#888888]" />}
            </button>
            {isOpen && (
                <div className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-1 fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

// Basic components for the panel
const PInput = ({ label, value, onChange, type = "text", placeholder = "", min, max }: any) => (
    <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-[10px] text-[#888888]">{label}</label>}
        <input
            type={type}
            value={value ?? ''}
            onChange={(e) => onChange(type === 'number' || type === 'range' ? Number(e.target.value) : e.target.value)}
            placeholder={placeholder}
            min={min} max={max}
            className="w-full bg-white border border-[#E5E5E5] hover:border-[#BBBFCA] focus:border-[#0D99FF] focus:ring-1 focus:ring-[#0D99FF] rounded p-1.5 text-[11px] text-[#333333] outline-none transition-colors"
        />
    </div>
);

const PSelect = ({ label, value, onChange, options }: any) => (
    <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-[10px] text-[#888888]">{label}</label>}
        <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] hover:border-[#BBBFCA] focus:border-[#0D99FF] focus:ring-1 focus:ring-[#0D99FF] rounded p-1.5 text-[11px] text-[#333333] outline-none transition-colors appearance-none"
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export const SettingsPanel = ({ metadata }: { metadata: any }) => {
    const brand = metadata?.brand || {
        colors: { primary: '#0D99FF', secondary: '#495464', background: '#FFFFFF', surface: '#F8F9FA', text: '#333333' },
        fonts: { title: 'Inter', header: 'Inter', subheader: 'Inter', body: 'Inter' }
    };

    const [isSavingBlock, setIsSavingBlock] = useState(false);
    const [blockName, setBlockName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const renameInputRef = useRef<HTMLInputElement>(null);

    const { actions, selected, query } = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId) {
            const node = state.nodes[currentNodeId];
            const name = node.data.displayName || node.data.name;
            selected = {
                id: currentNodeId,
                name: name,
                customLabel: (node.data.custom?.label as string | undefined) || null,
                isDeletable: query.node(currentNodeId).isDeletable(),
                props: node.data.props,
            };
        }

        return { selected, query };
    });

    // Fecha rename se mudar o nó selecionado
    useEffect(() => { setIsRenaming(false); }, [selected?.id]);

    // Foca o input ao entrar em modo rename
    useEffect(() => {
        if (isRenaming) renameInputRef.current?.select();
    }, [isRenaming]);

    const handleCopy = () => {
        if (!selected) return;
        try {
            const tree = query.node(selected.id).toNodeTree();
            setClipboard(tree);
        } catch (err) {
            console.warn('[SettingsPanel] Copy failed:', err);
        }
    };

    const commitRename = (value: string) => {
        if (!selected) return;
        const newLabel = value.trim() || selected.name;
        actions.setCustom(selected.id, (c: Record<string, any>) => { c.label = newLabel; });
        setIsRenaming(false);
    };

    const handleSaveBlock = () => {
        if (!selected || !blockName.trim()) return;
        try {
            const tree = query.node(selected.id).toNodeTree();
            saveBlock(blockName, tree);
            setIsSavingBlock(false);
            setBlockName('');
        } catch (err) {
            console.error("Failed to save block", err);
        }
    };

    const setProp = (key: string, value: any) => {
        if (selected) {
            console.log(`Setting prop ${key} to:`, value, 'on node:', selected.id);
            actions.setProp(selected.id, (props) => {
                props[key] = value;
            });
        }
    };

    if (!selected) {
        return (
            <div className="w-64 shrink-0 bg-[#F5F5F5] border-l border-[#E5E5E5] flex items-center justify-center">
                <p className="text-[11px] text-[#BBBFCA] select-none">No layer selected</p>
            </div>
        );
    }

    return (
        <div className="bg-white border-l border-[#E5E5E5] flex flex-col w-64 shrink-0 overflow-y-auto z-10">
            {/* Header section (Component Type & Actions) */}
            <div className="flex items-center justify-between p-3 border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <Box size={14} className="text-[#888888] shrink-0" />
                    {isRenaming ? (
                        <input
                            ref={renameInputRef}
                            className="flex-1 min-w-0 bg-white border border-[#0D99FF] rounded px-1.5 py-0.5 text-[11px] font-semibold text-[#333333] outline-none"
                            defaultValue={selected.customLabel || selected.name}
                            onBlur={(e) => commitRename(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename(e.currentTarget.value);
                                if (e.key === 'Escape') setIsRenaming(false);
                            }}
                        />
                    ) : (
                        <button
                            className="flex items-center gap-1.5 min-w-0 group/rename"
                            title="Clique para renomear"
                            onClick={() => setIsRenaming(true)}
                        >
                            <h3 className="text-[11px] font-semibold text-[#333333] tracking-wide truncate">
                                {selected.customLabel || selected.name}
                            </h3>
                            <Pencil size={10} className="text-[#BBBFCA] opacity-0 group-hover/rename:opacity-100 transition-opacity shrink-0" />
                        </button>
                    )}
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-[#F5F5F5] text-[#888888] hover:text-[#333333] rounded transition-colors"
                        title="Copy Component (Ctrl+C)"
                    >
                        <Copy size={14} />
                    </button>
                    {selected.name === 'Container' && (
                        <button
                            onClick={() => setIsSavingBlock(!isSavingBlock)}
                            className="p-1 hover:bg-[#F5F5F5] text-[#888888] hover:text-[#333333] rounded transition-colors"
                            title="Save as Component"
                        >
                            <BookmarkPlus size={14} />
                        </button>
                    )}
                    {selected.isDeletable && (
                        <button
                            onClick={() => actions.delete(selected.id)}
                            className="p-1 hover:bg-red-50 text-[#888888] hover:text-red-500 rounded transition-colors"
                            title="Delete Layer"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Template Save Area */}
            {isSavingBlock && selected.name === 'Container' && (
                <div className="p-3 bg-indigo-50/50 border-b border-[#E5E5E5] flex flex-col gap-2">
                    <label className="text-[10px] font-semibold text-indigo-600">Save Component</label>
                    <div className="flex gap-1.5">
                        <input
                            autoFocus
                            type="text"
                            value={blockName}
                            onChange={(e) => setBlockName(e.target.value)}
                            placeholder="Hero Card"
                            className="flex-1 bg-white border border-[#E5E5E5] focus:border-indigo-500 rounded p-1.5 text-[11px] outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveBlock();
                                if (e.key === 'Escape') setIsSavingBlock(false);
                            }}
                        />
                        <button
                            onClick={handleSaveBlock}
                            disabled={!blockName.trim()}
                            className="px-2.5 bg-indigo-600 text-white rounded text-[11px] font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            {/* --- PROPERTIES ACCORDIONS --- */}

            {/* CONTENT (For Text/Title) */}
            {(selected.name === 'Text' || selected.name === 'Title') && (
                <>
                    <Section title="Layout do texto">
                        <div className="space-y-2">
                            <label className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Largura da linha</label>
                            <div className="flex bg-[#F5F5F5] rounded-lg p-1">
                                <button
                                    onClick={() => setProp('widthMode', 'fill')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-md text-[10px] font-bold transition-all ${selected.props.widthMode === 'fill' || !selected.props.widthMode ? 'bg-white shadow-sm text-[#0D99FF]' : 'text-[#888888] hover:text-[#333333]'}`}
                                >
                                    <StretchHorizontal size={12} />
                                    <span>Ocupar tudo</span>
                                </button>
                                <button
                                    onClick={() => setProp('widthMode', 'hug')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-md text-[10px] font-bold transition-all ${selected.props.widthMode === 'hug' ? 'bg-white shadow-sm text-[#0D99FF]' : 'text-[#888888] hover:text-[#333333]'}`}
                                >
                                    <Minimize2 size={12} />
                                    <span>Ajustar conteúdo</span>
                                </button>
                            </div>
                            <p className="text-[9px] text-[#BBBFCA] leading-tight mt-1">
                                Use "Ajustar ao conteúdo" para usar ícones ou outros itens na mesma linha.
                            </p>
                        </div>
                    </Section>

                    {selected.name === 'Text' && (
                        <Section title="Text Content">
                            <textarea
                                value={selected.props.text}
                                onChange={(e) => setProp('text', e.target.value)}
                                className="w-full bg-white border border-[#E5E5E5] focus:border-[#0D99FF] rounded p-2 text-[11px] font-mono outline-none min-h-[100px] resize-y"
                                placeholder="Content..."
                            />
                        </Section>
                    )}
                </>
            )}

            {selected.name === 'Image' && (
                <Section title="Image Source">
                    <PInput value={selected.props.src} onChange={(v: string) => setProp('src', v)} placeholder="https://..." />
                </Section>
            )}

            {/* ICON SETTINGS */}
            {selected.name === 'Icon' && (
                <Section title="Icon Settings">
                    <PInput label="Icon Name (Lucide)" value={selected.props.name} onChange={(v: string) => setProp('name', v)} placeholder="e.g. Star" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <PInput label="Size" type="number" value={selected.props.size || 24} onChange={(v: number) => setProp('size', v)} />
                        <PInput label="Stroke Width" type="number" value={selected.props.strokeWidth || 2} onChange={(v: number) => setProp('strokeWidth', v)} />
                    </div>
                </Section>
            )}

            {/* Height Fixed input (Container only, shown when height is a fixed px value) */}
            {selected.name === 'Container' && typeof selected.props.height === 'string' && selected.props.height.endsWith('px') && (
                <Section title="Height">
                    <PInput label="Fixed Height (px)" type="number" value={parseInt(selected.props.height) || 100} onChange={(v: number) => setProp('height', `${v}px`)} />
                </Section>
            )}

            {selected.name === 'Container' && (
                <>
                    <Section title="Stroke & Corners" defaultOpen={false}>
                        <div className="grid grid-cols-2 gap-2">
                            <PInput label="Radius" type="number" value={selected.props.borderRadius || 0} onChange={(v: number) => setProp('borderRadius', v)} />
                            <PInput label="Border W" type="number" value={selected.props.borderWidth || 0} onChange={(v: number) => setProp('borderWidth', v)} />
                        </div>
                    </Section>

                    <Section title="Presets" defaultOpen={false}>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={() => {
                                setProp('borderRadius', 16);
                                setProp('borderWidth', 0);
                                setProp('background', '#ffffff');
                                setProp('boxShadow', '0 10px 25px -5px rgba(0, 0, 0, 0.1)');
                            }} className="p-1.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#333333] rounded text-[10px] font-medium transition-colors">Surface</button>

                            <button onClick={() => {
                                setProp('borderRadius', 16);
                                setProp('background', 'rgba(255,255,255,0.4)');
                                setProp('borderWidth', 1);
                                setProp('borderColor', 'rgba(255,255,255,0.3)');
                                setProp('backdropBlur', 10);
                            }} className="p-1.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#333333] rounded text-[10px] font-medium transition-colors">Glass</button>
                        </div>
                    </Section>
                </>
            )}
        </div>
    );
};
