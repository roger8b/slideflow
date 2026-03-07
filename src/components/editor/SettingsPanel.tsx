import React from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { Settings, Image as ImageIcon, Box, Layout } from 'lucide-react';

export const SettingsPanel = () => {
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

        actions.setProp(selected.id, (props) => {
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
            }
        });
    };

    return selected ? (
        <div className="bg-white border-b border-[#BBBFCA] flex flex-col h-full overflow-y-auto max-h-[60vh]">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-[#495464]">
                    <Settings size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">{selected.name} Settings</h3>
                </div>

                <div className="space-y-6">
                    {/* Common Text Controls */}
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
                                <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Alignment</label>
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
                            {selected.name === 'Text' && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Markdown Content</label>
                                    <textarea
                                        value={selected.props.text}
                                        onChange={(e) => actions.setProp(selected.id, (props) => (props.text = e.target.value))}
                                        className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none h-32 resize-none font-mono"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {selected.name === 'Container' && (
                        <div className="space-y-6 pb-6">
                            {/* Layout Group */}
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                    <Layout size={12} /> Layout
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

                            {/* Aesthetics Group */}
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                    <Box size={12} /> Aesthetics
                                </h4>

                                {/* Presets */}
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button onClick={() => applyStylePreset('soft')} className="px-1 py-1 bg-[#F4F4F2] text-[10px] font-bold text-[#495464] rounded hover:bg-[#BBBFCA] transition-colors uppercase">Soft</button>
                                    <button onClick={() => applyStylePreset('glass')} className="px-1 py-1 bg-[#F4F4F2] text-[10px] font-bold text-[#495464] rounded hover:bg-[#BBBFCA] transition-colors uppercase">Glass</button>
                                    <button onClick={() => applyStylePreset('outlined')} className="px-1 py-1 bg-[#F4F4F2] text-[10px] font-bold text-[#495464] rounded hover:bg-[#BBBFCA] transition-colors uppercase">Outline</button>
                                    <button onClick={() => applyStylePreset('none')} className="px-1 py-1 bg-red-50 text-[10px] font-bold text-red-600 rounded hover:bg-red-100 transition-colors uppercase">None (Reset)</button>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Background Color</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={selected.props.background === 'transparent' ? '#ffffff' : selected.props.background}
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
                            </div>

                            {/* Background Image Group */}
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-1">
                                    <ImageIcon size={12} /> Background Image
                                </h4>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Image URL</label>
                                    <input
                                        type="text"
                                        value={selected.props.backgroundImage || ''}
                                        onChange={(e) => actions.setProp(selected.id, (props) => (props.backgroundImage = e.target.value))}
                                        placeholder="External image URL..."
                                        className="w-full bg-[#E8E8E8] border-none rounded p-2 text-[10px] focus:ring-1 focus:ring-[#495464] outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Overlay Darkness ({selected.props.backgroundOpacity || 0}%)</label>
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
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Image Source URL</label>
                            <input
                                type="text"
                                value={selected.props.src}
                                onChange={(e) => actions.setProp(selected.id, (props) => (props.src = e.target.value))}
                                placeholder="Paste URL here..."
                                className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                            />
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
