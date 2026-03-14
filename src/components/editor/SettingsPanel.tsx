import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { AlignLeft, AlignCenter, AlignRight, Box, Trash2, BookmarkPlus, ChevronDown, ChevronRight } from 'lucide-react';
import { saveBlock } from '../../lib/savedBlocks';

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

export const SettingsPanel = () => {
    const [isSavingBlock, setIsSavingBlock] = useState(false);
    const [blockName, setBlockName] = useState('');

    const { actions, selected, query } = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
                isDeletable: query.node(currentNodeId).isDeletable(),
                props: state.nodes[currentNodeId].data.props,
            };
        }

        return {
            selected,
            query
        };
    });

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

    return (
        <div className="bg-white border-l border-[#E5E5E5] flex flex-col w-64 shrink-0 overflow-y-auto z-10">
            {/* Header section (Component Type & Actions) */}
            <div className="flex items-center justify-between p-3 border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                    <Box size={14} className="text-[#888888]" />
                    <h3 className="text-[11px] font-semibold text-[#333333] tracking-wide select-none">{selected.name}</h3>
                </div>
                <div className="flex gap-1">
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

            {/* AUTO LAYOUT (For Containers) */}
            {selected.name === 'Container' && (
                <Section title="Auto Layout">
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
                            label="Align"
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
                </Section>
            )}

            {/* TYPOGRAPHY */}
            {(selected.name === 'Title' || selected.name === 'Text') && (
                <Section title="Typography">
                    <div className="grid grid-cols-2 gap-2 items-end">
                        <PInput label="Size" type="number" value={selected.props.fontSize || 16} onChange={(v: number) => setProp('fontSize', v)} />

                        <div className="flex border border-[#E5E5E5] rounded overflow-hidden">
                            <button
                                onClick={() => setProp('textAlign', 'left')}
                                className={`flex-1 p-1.5 flex justify-center items-center ${selected.props.textAlign === 'left' ? 'bg-[#E5E5E5] text-[#333333]' : 'bg-white text-[#888888] hover:bg-gray-50'}`}
                            >
                                <AlignLeft size={14} />
                            </button>
                            <button
                                onClick={() => setProp('textAlign', 'center')}
                                className={`flex-1 p-1.5 flex justify-center items-center ${selected.props.textAlign === 'center' ? 'bg-[#E5E5E5] text-[#333333]' : 'bg-white text-[#888888] hover:bg-gray-50'}`}
                            >
                                <AlignCenter size={14} />
                            </button>
                            <button
                                onClick={() => setProp('textAlign', 'right')}
                                className={`flex-1 p-1.5 flex justify-center items-center ${selected.props.textAlign === 'right' ? 'bg-[#E5E5E5] text-[#333333]' : 'bg-white text-[#888888] hover:bg-gray-50'}`}
                            >
                                <AlignRight size={14} />
                            </button>
                        </div>
                    </div>
                </Section>
            )}

            {/* FILL & STROKE */}
            {selected.name === 'Container' && (
                <>
                    <Section title="Fill">
                        <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded border border-[#E5E5E5] overflow-hidden shrink-0 shadow-sm cursor-pointer">
                                <input
                                    type="color"
                                    value={selected.props.background === 'transparent' ? '#ffffff' : (selected.props.background && selected.props.background.startsWith('#') ? selected.props.background : '#ffffff')}
                                    onChange={(e) => setProp('background', e.target.value)}
                                    className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={selected.props.background || 'transparent'}
                                onChange={(e) => setProp('background', e.target.value)}
                                className="flex-1 bg-white border border-[#E5E5E5] focus:border-[#0D99FF] rounded p-1.5 text-[11px] font-mono outline-none"
                            />
                        </div>
                    </Section>

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
                </>
            )}

            {/* Quick Presets for Demo */}
            {selected.name === 'Container' && (
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
            )}

        </div>
    );
};
