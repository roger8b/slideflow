import React, { useState, useEffect } from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Layout, BookmarkPlus, Trash2, Layers } from 'lucide-react';
import { Container } from './selectors/Container';
import { LayersTree } from './LayersTree';
import { getSavedBlocks, deleteSavedBlock, SavedBlock } from '../../lib/savedBlocks';

export const SidebarPalette = () => {
    const { connectors: { create } } = useEditor();
    const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
    const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>([]);

    useEffect(() => {
        const loadBlocks = () => setSavedBlocks(getSavedBlocks());
        loadBlocks();
        window.addEventListener('savedBlocksUpdated', loadBlocks);
        return () => window.removeEventListener('savedBlocksUpdated', loadBlocks);
    }, []);

    const handleDeleteBlock = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteSavedBlock(id);
    };

    return (
        <div className="flex-col w-64 shrink-0 overflow-y-auto bg-white border-r border-[#E5E5E5] flex z-10">
            {/* Tabs */}
            <div className="flex sticky top-0 bg-white z-10 w-full shrink-0 px-2 pt-2 gap-1 border-b border-[#E5E5E5]">
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-1.5 px-2 text-[10px] font-semibold tracking-wide transition-all rounded-t-md flex justify-center items-center gap-1.5 ${activeTab === 'layers' ? 'text-[#333333] bg-white border-b-2 border-b-[#0D99FF]' : 'text-[#888888] hover:text-[#333333] hover:bg-gray-50'}`}
                >
                    <Layers size={12} strokeWidth={2} /> Layers
                </button>
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`flex-1 py-1.5 px-2 text-[10px] font-semibold tracking-wide transition-all rounded-t-md flex justify-center items-center gap-1.5 ${activeTab === 'assets' ? 'text-[#333333] bg-white border-b-2 border-b-[#0D99FF]' : 'text-[#888888] hover:text-[#333333] hover:bg-gray-50'}`}
                >
                    <BookmarkPlus size={12} strokeWidth={2} /> Assets
                </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full">
                {activeTab === 'layers' && (
                    <div className="animate-in fade-in duration-200 w-full h-full flex flex-col">
                        <LayersTree />
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div className="p-4 space-y-3 animate-in fade-in duration-200 w-full">
                        <h3 className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-2">Saved Components</h3>

                        {savedBlocks.length === 0 ? (
                            <div className="text-center py-6">
                                <BookmarkPlus size={20} className="mx-auto text-[#BBBFCA] mb-2" strokeWidth={1.5} />
                                <p className="text-[10px] text-[#888888]">No saved blocks yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {savedBlocks.map((block) => (
                                    <div
                                        key={block.id}
                                        className="bg-white p-2 rounded-lg flex items-center justify-between group border border-[#E5E5E5] hover:border-[#BBBFCA] transition-all cursor-grab shadow-sm"
                                        ref={(ref: any) => ref && create(ref, <Element canvas is={Container} custom={{ savedBlockTree: block.tree, isSavedBlockTemplate: true }} />)}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <Layout size={14} className="text-[#888888] shrink-0" strokeWidth={1.5} />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-medium text-[#333333] truncate leading-tight">{block.name}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteBlock(e, block.id)}
                                            className="p-1 px-1.5 text-[#BBBFCA] hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
