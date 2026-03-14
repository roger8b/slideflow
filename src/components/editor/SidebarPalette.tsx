import React, { useState, useEffect } from 'react';
import { useEditor, Element } from '@craftjs/core';
import {
    Type,
    Image as ImageIcon,
    Square,
    Layout,
    Columns2,
    Columns3,
    BookOpen,
    User,
    StretchVertical,
    BookmarkPlus,
    Trash2
} from 'lucide-react';
import { Container } from './selectors/Container';
import { Title } from './selectors/Title';
import { Text } from './selectors/Text';
import { Image } from './selectors/Image';

import { AILayoutGenerator } from './AILayoutGenerator';
import { getSavedBlocks, deleteSavedBlock, SavedBlock } from '../../lib/savedBlocks';

export const SidebarPalette = () => {
    const { connectors: { create }, actions } = useEditor();
    const [activeTab, setActiveTab] = useState<'basic' | 'saved'>('basic');
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
        <div className="flex-col flex-1 overflow-y-auto bg-white flex">
            <div className="flex bg-[#F4F4F2] border-b border-[#BBBFCA] sticky top-0 z-10 w-full shrink-0">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'basic' ? 'bg-white text-[#495464] border-b-2 border-[#495464]' : 'text-[#BBBFCA] hover:text-[#495464]'}`}
                >
                    Basic & Layouts
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'saved' ? 'bg-white text-[#495464] border-b-2 border-[#495464]' : 'text-[#BBBFCA] hover:text-[#495464]'}`}
                >
                    Saved Blocks
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <AILayoutGenerator />

                {activeTab === 'basic' && (
                    <div className="p-6 space-y-8 animate-in slide-in-from-left duration-200">
                        {/* Basic Elements */}
                        <section>
                            <h3 className="text-[10px] font-black text-[#BBBFCA] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Square size={10} /> Basic Elements
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    ref={(ref: any) => ref && create(ref, <Title text="New Title" />)}
                                    className="bg-[#F4F4F2] p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-grab hover:bg-[#E8E8E8] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-sm"
                                >
                                    <Type size={20} className="text-[#495464] group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-[#495464] uppercase">Title</span>
                                </div>
                                <div
                                    ref={(ref: any) => ref && create(ref, <Text text="Your markdown text here..." />)}
                                    className="bg-[#F4F4F2] p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-grab hover:bg-[#E8E8E8] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-sm"
                                >
                                    <StretchVertical size={20} className="text-[#495464] group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-[#495464] uppercase">Text</span>
                                </div>
                                <div
                                    ref={(ref: any) => ref && create(ref, <Image src="https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=960&h=540" />)}
                                    className="bg-[#F4F4F2] p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-grab hover:bg-[#E8E8E8] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-sm"
                                >
                                    <ImageIcon size={20} className="text-[#495464] group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-[#495464] uppercase">Image</span>
                                </div>
                                <div
                                    ref={(ref: any) => ref && create(ref, <Element is={Container} padding={20} canvas />)}
                                    className="bg-[#F4F4F2] p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-grab hover:bg-[#E8E8E8] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-sm"
                                >
                                    <Layout size={20} className="text-[#495464] group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-[#495464] uppercase">Grid</span>
                                </div>
                            </div>
                        </section>

                        {/* Layout Templates */}
                        <section>
                            <h3 className="text-[10px] font-black text-[#BBBFCA] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BookOpen size={10} /> Slide Templates
                            </h3>
                            <div className="space-y-3">
                                {/* Cover Template */}
                                <div
                                    ref={(ref: any) => ref && create(ref,
                                        <Element is={Container} canvas padding={40} background="#495464" height="100%" justifyContent="center" alignItems="center">
                                            <Title text="PRESENTATION TITLE" fontSize={56} color="#ffffff" textAlign="center" />
                                            <Text text="Main Topic or Subject" color="rgba(255,255,255,0.7)" textAlign="center" fontSize={24} />
                                            <Element is={Container} canvas height="40" padding={0} />
                                            <Text text="Author Name" color="#ffffff" textAlign="center" fontSize={16} />
                                        </Element>
                                    )}
                                    className="bg-[#F4F4F2] p-3 rounded-xl flex items-center gap-3 cursor-grab hover:bg-[#E8E8E8] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-sm"
                                >
                                    <User size={18} className="text-[#495464]" />
                                    <span className="text-[10px] font-bold text-[#495464] uppercase">Slide Capa (Cover)</span>
                                </div>

                                {/* 2 Columns Template */}
                                <div
                                    ref={(ref: any) => ref && create(ref,
                                        <Element is={Container} canvas padding={30} height="100%" flexDirection="column">
                                            <Title text="Title with 2 Columns" fontSize={32} />
                                            <Element is={Container} canvas flexDirection="row" gap={20} height="auto" flex={1} padding={0}>
                                                <Element is={Container} canvas flex={1} padding={20} background="#ffffff" borderRadius={8} height="auto">
                                                    <Text text="Column 1 content..." />
                                                </Element>
                                                <Element is={Container} canvas flex={1} padding={20} background="#ffffff" borderRadius={8} height="auto">
                                                    <Text text="Column 2 content..." />
                                                </Element>
                                            </Element>
                                        </Element>
                                    )}
                                    className="bg-[#F4F4F2] p-3 rounded-xl flex items-center gap-3 cursor-grab hover:bg-[#E8E8E8] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-sm"
                                >
                                    <Columns2 size={18} className="text-[#495464]" />
                                    <span className="text-[10px] font-bold text-[#495464] uppercase">Title + 2 Columns</span>
                                </div>

                                {/* 3 Columns Template */}
                                <div
                                    ref={(ref: any) => ref && create(ref,
                                        <Element is={Container} canvas padding={30} height="100%" flexDirection="column">
                                            <Title text="Title with 3 Columns" fontSize={30} />
                                            <Element is={Container} canvas flexDirection="row" gap={15} height="auto" flex={1} padding={0}>
                                                <Element is={Container} canvas flex={1} padding={15} background="#ffffff" borderRadius={8} height="auto">
                                                    <Text text="Col 1" />
                                                </Element>
                                                <Element is={Container} canvas flex={1} padding={15} background="#ffffff" borderRadius={8} height="auto">
                                                    <Text text="Col 2" />
                                                </Element>
                                                <Element is={Container} canvas flex={1} padding={15} background="#ffffff" borderRadius={8} height="auto">
                                                    <Text text="Col 3" />
                                                </Element>
                                            </Element>
                                        </Element>
                                    )}
                                    className="bg-[#F4F4F2] p-3 rounded-xl flex items-center gap-3 cursor-grab hover:bg-[#E8E8E8] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-sm"
                                >
                                    <Columns3 size={18} className="text-[#495464]" />
                                    <span className="text-[10px] font-bold text-[#495464] uppercase">Title + 3 Columns</span>
                                </div>

                                {/* Index Template */}
                                <div
                                    ref={(ref: any) => ref && create(ref,
                                        <Element is={Container} canvas padding={40} height="100%" alignItems="flex-start" justifyContent="flex-start">
                                            <Title text="Índice (Index)" fontSize={40} textAlign="left" />
                                            <Element is={Container} canvas height="20" padding={0} />
                                            <Text text="1. **Introdução**\n2. **Contexto Atual**\n3. **Nova Solução**\n4. **Próximos Passos**" fontSize={24} textAlign="left" />
                                        </Element>
                                    )}
                                    className="bg-[#F4F4F2] p-3 rounded-xl flex items-center gap-3 cursor-grab hover:bg-[#E8E8E8] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-sm"
                                >
                                    <BookOpen size={18} className="text-[#495464]" />
                                    <span className="text-[10px] font-bold text-[#495464] uppercase">Slide de Índice</span>
                                </div>

                                {/* Modern Glass Hero Template */}
                                <div
                                    ref={(ref: any) => ref && create(ref,
                                        <Element is={Container} canvas padding={60} height="100%" background="#F4F4F2" backgroundImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop" alignItems="center" justifyContent="center">
                                            <Element is={Container} canvas padding={40} background="rgba(255, 255, 255, 0.4)" backdropBlur={12} borderRadius={24} borderWidth={1} borderColor="rgba(255,255,255,0.4)" alignItems="center" justifyContent="center" height="auto" width="80%" boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)">
                                                <Title text="MODERN GLASS DESIGN" fontSize={48} color="#1a1a1a" textAlign="center" />
                                                <Text text="Create stunning presentations with professional visuals." color="#495464" textAlign="center" fontSize={18} />
                                            </Element>
                                        </Element>
                                    )}
                                    className="bg-[#495464] p-3 rounded-xl flex items-center gap-3 cursor-grab hover:bg-[#3a4350] transition-colors border border-transparent hover:border-[#BBBFCA] group shadow-lg"
                                >
                                    <Layout size={18} className="text-white" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Hero Glass (Modern)</span>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="p-6 space-y-4 animate-in slide-in-from-right duration-200">
                        <h3 className="text-[10px] font-black text-[#BBBFCA] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <BookmarkPlus size={10} /> Your Templates
                        </h3>

                        {savedBlocks.length === 0 ? (
                            <div className="text-center p-6 bg-[#F4F4F2] rounded-xl border border-dashed border-[#BBBFCA]">
                                <BookmarkPlus size={24} className="mx-auto text-[#BBBFCA] mb-2" />
                                <p className="text-[10px] text-[#495464] font-bold uppercase">No templates saved</p>
                                <p className="text-[9px] text-[#BBBFCA] mt-1">Select a Container and click Save in the Settings panel.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {savedBlocks.map((block) => (
                                    <div
                                        key={block.id}
                                        className="bg-[#F4F4F2] p-3 rounded-xl flex items-center justify-between group shadow-sm border border-transparent hover:border-[#495464] transition-all cursor-grab"
                                        ref={(ref: any) => ref && create(ref, <Element canvas is={Container} custom={{ savedBlockTree: block.tree, isSavedBlockTemplate: true }} />)}
                                        onClick={() => {
                                            // Handle direct click injection if needed in future
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Layout size={16} className="text-[#495464]" />
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-[#495464] truncate w-32">{block.name}</span>
                                                <span className="text-[8px] text-[#BBBFCA] uppercase">{new Date(block.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteBlock(e, block.id)}
                                            className="p-1.5 text-[#BBBFCA] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={14} />
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
