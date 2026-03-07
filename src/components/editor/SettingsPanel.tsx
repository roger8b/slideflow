import React from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { Settings } from 'lucide-react';

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

    return selected ? (
        <div className="bg-white p-6 border-b border-[#BBBFCA]">
            <div className="flex items-center gap-2 mb-4 text-[#495464]">
                <Settings size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">{selected.name} Settings</h3>
            </div>

            <div className="space-y-4">
                {/* Simple logic: if text-based, show alignment and size */}
                {(selected.name === 'Title' || selected.name === 'Text') && (
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Font Size</label>
                            <input
                                type="number"
                                value={selected.props.fontSize}
                                onChange={(e) => actions.setProp(selected.id, (props) => (props.fontSize = parseInt(e.target.value)))}
                                className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Alignment</label>
                            <select
                                value={selected.props.textAlign}
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
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Flex Direction</label>
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
                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Align Items</label>
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
                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Justify Content</label>
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
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Height</label>
                            <input
                                type="text"
                                value={selected.props.height}
                                onChange={(e) => actions.setProp(selected.id, (props) => (props.height = e.target.value))}
                                placeholder="100%, auto or 400"
                                className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#BBBFCA] uppercase">Flex Grow</label>
                            <select
                                value={selected.props.flex}
                                onChange={(e) => actions.setProp(selected.id, (props) => (props.flex = e.target.value))}
                                className="w-full bg-[#E8E8E8] border-none rounded p-2 text-sm focus:ring-1 focus:ring-[#495464] outline-none"
                            >
                                <option value="0">Fixed (0)</option>
                                <option value="1">Fill Space (1)</option>
                            </select>
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
    ) : (
        <div className="p-6 text-center text-[#BBBFCA] text-xs italic">
            Select a component to adjust its properties.
        </div>
    );
};
