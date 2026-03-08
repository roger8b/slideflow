import React from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { Settings, Image as ImageIcon, Box, Layout, Grid, Trash2 } from 'lucide-react';

export const SettingsPanel = () => {
    const [activeTab, setActiveTab] = React.useState<'layout' | 'style' | 'config'>('layout');
    const [showGrid, setShowGrid] = React.useState(false);

    const { actions, selected } = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
                isDeletable: query.node(currentNodeId).isDeletable(),
                isEnabled: state.options.enabled,
                props: state.nodes[currentNodeId].data.props,
            };
        }

        return {
            selected,
        };
    });

    const applyStylePreset = (preset: 'soft' | 'glass' | 'outlined' | 'none') => {
        if (!selected) return;

        actions.setProp(selected.id, (props: any) => {
            if (preset === 'soft') {
                props.borderRadius = 16;
                props.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                props.borderWidth = 0;
                props.background = '#ffffff';
            } else if (preset === 'glass') {
                props.borderRadius = 16;
                props.background = 'rgba(255, 255, 255, 0.4)';
                props.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.07)';
                props.borderWidth = 1;
                props.borderColor = 'rgba(255, 255, 255, 0.3)';
                props.backdropBlur = 10;
            } else if (preset === 'outlined') {
                props.borderRadius = 8;
                props.borderWidth = 2;
                props.borderColor = '#495464';
                props.boxShadow = 'none';
                props.background = 'transparent';
            } else if (preset === 'none') {
                props.borderRadius = 0;
                props.borderWidth = 0;
                props.boxShadow = 'none';
                props.background = 'transparent';
                props.backgroundImage = '';
                props.backgroundOpacity = 0;
                props.backdropBlur = 0;
            }
        });
    };

    return selected ? (
        <div className="bg-white border-b border-[#BBBFCA] flex flex-col flex-1 overflow-y-auto">
            <div className="flex bg-[#F4F4F2] border-b border-[#BBBFCA] sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('layout')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'layout' ? 'bg-white text-[#495464] border-b-2 border-[#495464]' : 'text-[#BBBFCA] hover:text-[#495464]'}`}
                >
                    Layout
                </button>
                <button
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'style' ? 'bg-white text-[#495464] border-b-2 border-[#495464]' : 'text-[#BBBFCA] hover:text-[#495464]'}`}
                >
                    Estilo
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-white text-[#495464] border-b-2 border-[#495464]' : 'text-[#BBBFCA] hover:text-[#495464]'}`}
                >
                    Configs
                </button>
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-[#495464]">
                        <Settings size={14} className="animate-spin-slow" />
                        <h3 className="font-black text-[11px] uppercase tracking-tighter">{selected.name} Editing</h3>
                    </div>
                    {selected.isDeletable && (
                        <button
                            onClick={() => actions.delete(selected.id)}
                            className="p-2 text-[#BBBFCA] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Component"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {/* --- LAYOUT TAB --- */}
                    {activeTab === 'layout' && (
                        <div className="animate-in slide-in-from-left duration-200">
                            {(selected.name === 'Container') && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                            <Layout size={12} /> Flex Configuration
                                        </h4>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Direction</label>
                                            <select
                                                value={selected.props.flexDirection}
                                                onChange={(e) => actions.setProp(selected.id, (props) => (props.flexDirection = e.target.value))}
                                                className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                            >
                                                <option value="row">Row (Horizontal)</option>
                                                <option value="column">Column (Vertical)</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Horizontal Align</label>
                                            <select
                                                value={selected.props.alignItems}
                                                onChange={(e) => actions.setProp(selected.id, (props) => (props.alignItems = e.target.value))}
                                                className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                            >
                                                <option value="flex-start">Start</option>
                                                <option value="center">Center</option>
                                                <option value="flex-end">End</option>
                                                <option value="stretch">Stretch</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Vertical Align</label>
                                            <select
                                                value={selected.props.justifyContent}
                                                onChange={(e) => actions.setProp(selected.id, (props) => (props.justifyContent = e.target.value))}
                                                className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                            >
                                                <option value="flex-start">Start</option>
                                                <option value="center">Center</option>
                                                <option value="flex-end">End</option>
                                                <option value="space-between">Space Between</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Gap</label>
                                                <input
                                                    type="number"
                                                    value={selected.props.gap}
                                                    onChange={(e) => actions.setProp(selected.id, (props) => (props.gap = parseInt(e.target.value)))}
                                                    className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Padding</label>
                                                <input
                                                    type="number"
                                                    value={selected.props.padding}
                                                    onChange={(e) => actions.setProp(selected.id, (props) => (props.padding = parseInt(e.target.value)))}
                                                    className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Height Mode</label>
                                            <select
                                                value={selected.props.height === 'auto' ? 'auto' : selected.props.height === '100%' ? 'fill' : 'fixed'}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    actions.setProp(selected.id, (props) => {
                                                        if (val === 'auto') props.height = 'auto';
                                                        else if (val === 'fill') props.height = '100%';
                                                        else props.height = '300';
                                                    });
                                                }}
                                                className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                            >
                                                <option value="auto">Auto (Content)</option>
                                                <option value="fill">Fill (100%)</option>
                                                <option value="fixed">Fixed (Pixels)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grid Helper */}
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                    <Grid size={12} /> Grid Helper
                                </h4>
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Show Positioning Grid</label>
                                    <button
                                        onClick={() => {
                                            setShowGrid(!showGrid);
                                            // Dispatch custom event to communicate with EditorContainer
                                            window.dispatchEvent(new CustomEvent('toggleGrid', { detail: !showGrid }));
                                        }}
                                        className={`w-12 h-6 rounded-full transition-all ${showGrid ? 'bg-[#495464]' : 'bg-[#BBBFCA]'} relative`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${showGrid ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-[#BBBFCA] italic leading-relaxed">
                                    Visual grid helps with precise component positioning
                                </p>
                            </div>

                            {(selected.name !== 'Container') && (
                                <div className="p-4 text-center text-[#BBBFCA] text-[10px] uppercase font-bold italic">
                                    Configurável apenas via Layout de Slide
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- STYLE TAB --- */}
                    {activeTab === 'style' && (
                        <div className="animate-in slide-in-from-left duration-200 space-y-6">
                            {(selected.name === 'Title' || selected.name === 'Text') && (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Font Size</label>
                                        <input
                                            type="number"
                                            value={selected.props.fontSize || 18}
                                            onChange={(e) => actions.setProp(selected.id, (props) => (props.fontSize = parseInt(e.target.value)))}
                                            className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Text Alignment</label>
                                        <select
                                            value={selected.props.textAlign || 'left'}
                                            onChange={(e) => actions.setProp(selected.id, (props) => (props.textAlign = e.target.value))}
                                            className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {selected.name === 'Container' && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                            <Box size={12} /> Aesthetics
                                        </h4>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Background Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={selected.props.background === 'transparent' ? '#ffffff' : (selected.props.background && selected.props.background.startsWith('#') ? selected.props.background : '#ffffff')}
                                                    onChange={(e) => actions.setProp(selected.id, (props) => (props.background = e.target.value))}
                                                    className="w-8 h-8 rounded border-none bg-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    value={selected.props.background}
                                                    onChange={(e) => actions.setProp(selected.id, (props) => (props.background = e.target.value))}
                                                    className="flex-1 bg-[#E8E8E8] border-none rounded p-2 text-[10px] uppercase font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Corner Radius</label>
                                                <input
                                                    type="number"
                                                    value={selected.props.borderRadius || 0}
                                                    onChange={(e) => actions.setProp(selected.id, (props) => (props.borderRadius = parseInt(e.target.value)))}
                                                    className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Border Width</label>
                                                <input
                                                    type="number"
                                                    value={selected.props.borderWidth || 0}
                                                    onChange={(e) => actions.setProp(selected.id, (props) => (props.borderWidth = parseInt(e.target.value)))}
                                                    className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase leading-relaxed">
                                                Backdrop Blur (Glass effect) - {selected.props.backdropBlur || 0}px
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="40"
                                                value={selected.props.backdropBlur || 0}
                                                onChange={(e) => actions.setProp(selected.id, (props) => (props.backdropBlur = parseInt(e.target.value)))}
                                                className="w-full h-2 bg-[#E8E8E8] rounded-lg appearance-none cursor-pointer accent-[#495464]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                            <ImageIcon size={12} /> Background Image
                                        </h4>
                                        <input
                                            type="text"
                                            value={selected.props.backgroundImage || ''}
                                            onChange={(e) => actions.setProp(selected.id, (props) => (props.backgroundImage = e.target.value))}
                                            placeholder="URL..."
                                            className="w-full bg-[#E8E8E8] border-none rounded p-2 text-[10px] focus:ring-1 focus:ring-[#495464] outline-none"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase italic">Overlay Strength - {selected.props.backgroundOpacity || 0}%</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selected.props.backgroundOpacity || 0}
                                                onChange={(e) => actions.setProp(selected.id, (props) => (props.backgroundOpacity = parseInt(e.target.value)))}
                                                className="w-full h-2 bg-[#E8E8E8] rounded-lg appearance-none cursor-pointer accent-[#495464]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selected.name === 'Image' && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                        <ImageIcon size={12} /> Source URL
                                    </h4>
                                    <input
                                        type="text"
                                        value={selected.props.src || ''}
                                        onChange={(e) => actions.setProp(selected.id, (props) => (props.src = e.target.value))}
                                        placeholder="Paste image URL..."
                                        className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- CONFIGS TAB --- */}
                    {activeTab === 'config' && (
                        <div className="animate-in slide-in-from-left duration-200 space-y-6">
                            {selected.name === 'Container' && (
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                        Quick Presets
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => applyStylePreset('soft')} className="px-1 py-2 bg-[#F4F4F2] text-[10px] font-extrabold text-[#495464] rounded hover:bg-[#BBBFCA] transition-all uppercase shadow-sm">Soft UI</button>
                                        <button onClick={() => applyStylePreset('glass')} className="px-1 py-2 bg-[#F4F4F2] text-[10px] font-extrabold text-[#495464] rounded hover:bg-[#BBBFCA] transition-all uppercase shadow-sm">Modern Glass</button>
                                        <button onClick={() => applyStylePreset('outlined')} className="px-1 py-2 bg-[#F4F4F2] text-[10px] font-extrabold text-[#495464] rounded hover:bg-[#BBBFCA] transition-all uppercase shadow-sm">Minimal Outlined</button>
                                        <button onClick={() => applyStylePreset('none')} className="px-1 py-2 bg-red-50 text-[10px] font-extrabold text-red-600 rounded hover:bg-red-100 transition-all uppercase shadow-sm">Clear Style</button>
                                    </div>
                                </div>
                            )}

                            {selected.name === 'Text' && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-[#BBBFCA] uppercase mb-1">Markdown Content Editor</label>
                                    <textarea
                                        value={selected.props.text}
                                        onChange={(e) => actions.setProp(selected.id, (props) => (props.text = e.target.value))}
                                        className="w-full bg-[#E8E8E8] border-none rounded p-3 text-sm focus:ring-1 focus:ring-[#495464] outline-none h-48 resize-none font-mono leading-relaxed"
                                        placeholder="Write your content here..."
                                    />
                                </div>
                            )}

                            <div className="pt-4 border-t border-[#E8E8E8]">
                                <p className="text-[10px] text-[#BBBFCA] leading-tight">
                                    Dica: Use atalhos do teclado para deletar (Del/Backspace) ou duplicar elementos no editor.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div className="p-6 text-center text-[#BBBFCA] text-xs italic">
            Select a component to adjust its properties.
        </div>
    );
};
