import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { AlignLeft, AlignCenter, AlignRight, Box, Trash2, BookmarkPlus, ChevronDown, ChevronRight, Pencil, Copy } from 'lucide-react';
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

            {/* CONTENT (For Text/Image) */}
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

            {/* AUTO LAYOUT (For Containers) */}
            {selected.name === 'Container' && (
                <Section title="Layout & Spacing">
                    <div className="grid grid-cols-2 gap-2">
                        <PSelect
                            label="Direction"
                            value={selected.props.flexDirection || "column"}
                            onChange={(v: string) => setProp('flexDirection', v)}
                            options={[
                                { label: "↓ Vertical", value: "column" },
                                { label: "→ Horizontal", value: "row" }
                            ]}
                        />
                        <PSelect
                            label="Height Mode"
                            value={selected.props.height === 'auto' ? 'auto' : selected.props.height === '100%' ? 'fill' : 'fixed'}
                            onChange={(v: string) => {
                                if (v === 'auto') setProp('height', 'auto');
                                else if (v === 'fill') setProp('height', '100%');
                                else setProp('height', '300px');
                            }}
                            options={[
                                { label: "Hug contents", value: "auto" },
                                { label: "Fill container", value: "fill" },
                                { label: "Fixed", value: "fixed" }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <PSelect
                            label="AlignItems"
                            value={selected.props.alignItems || "flex-start"}
                            onChange={(v: string) => setProp('alignItems', v)}
                            options={[
                                { label: "Start", value: "flex-start" },
                                { label: "Center", value: "center" },
                                { label: "End", value: "flex-end" },
                                { label: "Stretch", value: "stretch" }
                            ]}
                        />
                        <PSelect
                            label="Justify"
                            value={selected.props.justifyContent || "flex-start"}
                            onChange={(v: string) => setProp('justifyContent', v)}
                            options={[
                                { label: "Start", value: "flex-start" },
                                { label: "Center", value: "center" },
                                { label: "End", value: "flex-end" },
                                { label: "Space Btwn", value: "space-between" }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <PInput label="Gap" type="number" value={selected.props.gap || 0} onChange={(v: number) => setProp('gap', v)} />
                        <PInput label="Padding" type="number" value={selected.props.padding || 0} onChange={(v: number) => setProp('padding', v)} />
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E5E5E5]">
                        <label className="text-[10px] text-[#888888] font-semibold mb-2 block text-center">GRID SETTINGS</label>
                        <div className="flex bg-[#F5F5F5] rounded-md p-0.5 mb-3">
                            <button
                                onClick={() => setProp('display', 'flex')}
                                className={`flex-1 text-[11px] font-bold py-1 rounded transition-colors ${(!selected.props.display || selected.props.display === 'flex') ? 'bg-white shadow-sm text-[#0D99FF]' : 'text-[#888888]'}`}
                            >
                                Flex
                            </button>
                            <button
                                onClick={() => setProp('display', 'grid')}
                                className={`flex-1 text-[11px] font-bold py-1 rounded transition-colors ${selected.props.display === 'grid' ? 'bg-white shadow-sm text-[#0D99FF]' : 'text-[#888888]'}`}
                            >
                                Grid
                            </button>
                        </div>

                        {selected.props.display === 'grid' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider text-center block">Columns</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="1"
                                            max="6"
                                            step="1"
                                            value={(() => {
                                                const cols = selected.props.gridTemplateColumns || '';
                                                if (cols.includes('repeat')) {
                                                    const match = cols.match(/repeat\((\d+)/);
                                                    return match ? match[1] : '2';
                                                }
                                                return cols.split(' ').filter(Boolean).length || '2';
                                            })()}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setProp('gridTemplateColumns', `repeat(${val}, 1fr)`);
                                            }}
                                            className="flex-1 accent-[#0D99FF]"
                                        />
                                        <span className="text-[11px] font-bold text-[#333333] w-4 text-center">
                                            {(() => {
                                                const cols = selected.props.gridTemplateColumns || '';
                                                if (cols.includes('repeat')) {
                                                    const match = cols.match(/repeat\((\d+)/);
                                                    return match ? match[1] : '2';
                                                }
                                                return cols.split(' ').filter(Boolean).length || '2';
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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

                    <Section title="Effects" defaultOpen={false}>
                        <PInput label={`Background Blur: ${selected.props.backdropBlur || 0}px`} type="range" min={0} max={40} value={selected.props.backdropBlur || 0} onChange={(v: number) => setProp('backdropBlur', v)} />

                        <div className="pt-2 border-t border-[#E5E5E5] mt-2">
                            <label className="text-[10px] text-[#888888] block mb-1">Image Overlay</label>
                            <input
                                type="text"
                                value={selected.props.backgroundImage || ''}
                                onChange={(e) => setProp('backgroundImage', e.target.value)}
                                placeholder="Image URL..."
                                className="w-full bg-white border border-[#E5E5E5] focus:border-[#0D99FF] rounded p-1.5 text-[11px] outline-none mb-2"
                            />
                            <PInput label={`Overlay Opacity: ${selected.props.backgroundOpacity || 0}%`} type="range" min={0} max={100} value={selected.props.backgroundOpacity || 0} onChange={(v: number) => setProp('backgroundOpacity', v)} />
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
