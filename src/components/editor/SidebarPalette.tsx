import React from 'react';
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
    StretchVertical
} from 'lucide-react';
import { Container } from './selectors/Container';
import { Title } from './selectors/Title';
import { Text } from './selectors/Text';
import { Image } from './selectors/Image';

export const SidebarPalette = () => {
    const { connectors: { create } } = useEditor();

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-white border-t border-[#BBBFCA]">
            <div className="space-y-8">
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
                    </div>
                </section>
            </div>
        </div>
    );
};
