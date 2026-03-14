import React, { useState, useRef, useEffect } from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Layout, Type, Image as ImageIcon, StretchVertical, Columns2, Columns3, BookOpen, User, GripVertical } from 'lucide-react';
import { Container } from './selectors/Container';
import { Title } from './selectors/Title';
import { Text } from './selectors/Text';
import { Image } from './selectors/Image';
import { AILayoutGenerator } from './AILayoutGenerator';

export const FloatingToolbar = () => {
    const { connectors: { create } } = useEditor();
    const [isLayoutsOpen, setIsLayoutsOpen] = useState(false);

    // Dragging state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialPosition = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!isDragging.current) return;
            e.preventDefault();
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setPosition({
                x: initialPosition.current.x + dx,
                y: initialPosition.current.y + dy
            });
        };

        const handlePointerUp = () => {
            isDragging.current = false;
            document.body.style.cursor = 'default';
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        initialPosition.current = { ...position };
        document.body.style.cursor = 'move';
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    return (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50">
            <div
                className="pointer-events-auto flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#E5E5E5] transition-shadow"
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            >

                {/* Primitive Tools */}
                <div
                    ref={(ref: any) => ref && create(ref, <Element is={Container} canvas padding={40} height="auto" />)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl cursor-grab hover:bg-gray-100 text-[#333333] transition-colors"
                    title="Container/Frame"
                >
                    <Layout size={18} strokeWidth={1.5} />
                </div>
                <div
                    ref={(ref: any) => ref && create(ref, <Title text="New Title" />)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl cursor-grab hover:bg-gray-100 text-[#333333] transition-colors"
                    title="Title"
                >
                    <Type size={18} strokeWidth={1.5} />
                </div>
                <div
                    ref={(ref: any) => ref && create(ref, <Text text="New text block" />)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl cursor-grab hover:bg-gray-100 text-[#333333] transition-colors"
                    title="Text Block"
                >
                    <StretchVertical size={18} strokeWidth={1.5} />
                </div>
                <div
                    ref={(ref: any) => ref && create(ref, <Image />)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl cursor-grab hover:bg-gray-100 text-[#333333] transition-colors"
                    title="Image"
                >
                    <ImageIcon size={18} strokeWidth={1.5} />
                </div>

                <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                {/* AI Custom Generator */}
                <div className="flex items-center">
                    <AILayoutGenerator variant="icon" />
                </div>

                <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>

                {/* Standard Layouts Menu */}
                <div className="relative flex items-center">
                    <button
                        onClick={() => setIsLayoutsOpen(!isLayoutsOpen)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isLayoutsOpen ? 'bg-gray-100 text-[#333333]' : 'text-[#888888] hover:text-[#333333] hover:bg-gray-50'}`}
                        title="Standard Layouts"
                    >
                        <Layout size={18} strokeWidth={1.5} />
                    </button>

                    {isLayoutsOpen && (
                        <div className="absolute bottom-[120%] -right-10 w-64 bg-white border border-[#E5E5E5] rounded-xl shadow-xl p-2 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                            <div className="px-2 py-1.5 border-b border-[#E5E5E5] mb-2">
                                <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Pre-built Layouts</span>
                            </div>

                            <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto">
                                {/* Slide Cover */}
                                <div
                                    ref={(ref: any) => ref && create(ref,
                                        <Element is={Container} canvas padding={40} background="#495464" height="100%" justifyContent="center" alignItems="center">
                                            <Title text="PRESENTATION TITLE" fontSize={56} color="#ffffff" textAlign="center" />
                                            <Text text="Main Topic or Subject" color="rgba(255,255,255,0.7)" textAlign="center" fontSize={24} />
                                            <Element is={Container} canvas height="40" padding={0} />
                                            <Text text="Author Name" color="#ffffff" textAlign="center" fontSize={16} />
                                        </Element>
                                    )}
                                    className="flex items-center gap-3 p-2 hover:bg-[#F5F5F5] rounded-lg cursor-grab transition-colors"
                                >
                                    <div className="bg-[#E5E5E5] p-1.5 rounded flex items-center justify-center text-[#333333]">
                                        <User size={14} />
                                    </div>
                                    <span className="text-[11px] font-medium text-[#333333]">Cover Slide</span>
                                </div>

                                {/* 2 Columns */}
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
                                    className="flex items-center gap-3 p-2 hover:bg-[#F5F5F5] rounded-lg cursor-grab transition-colors"
                                >
                                    <div className="bg-[#E5E5E5] p-1.5 rounded flex items-center justify-center text-[#333333]">
                                        <Columns2 size={14} />
                                    </div>
                                    <span className="text-[11px] font-medium text-[#333333]">2 Columns</span>
                                </div>

                                {/* 3 Columns */}
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
                                    className="flex items-center gap-3 p-2 hover:bg-[#F5F5F5] rounded-lg cursor-grab transition-colors"
                                >
                                    <div className="bg-[#E5E5E5] p-1.5 rounded flex items-center justify-center text-[#333333]">
                                        <Columns3 size={14} />
                                    </div>
                                    <span className="text-[11px] font-medium text-[#333333]">3 Columns</span>
                                </div>

                                {/* Index Slide */}
                                <div
                                    ref={(ref: any) => ref && create(ref,
                                        <Element is={Container} canvas padding={40} height="100%" alignItems="flex-start" justifyContent="flex-start">
                                            <Title text="Índice (Index)" fontSize={40} textAlign="left" />
                                            <Element is={Container} canvas height="20" padding={0} />
                                            <Text text={`1. **Introdução**\n2. **Contexto Atual**\n3. **Nova Solução**\n4. **Próximos Passos**`} fontSize={24} textAlign="left" />
                                        </Element>
                                    )}
                                    className="flex items-center gap-3 p-2 hover:bg-[#F5F5F5] rounded-lg cursor-grab transition-colors"
                                >
                                    <div className="bg-[#E5E5E5] p-1.5 rounded flex items-center justify-center text-[#333333]">
                                        <BookOpen size={14} />
                                    </div>
                                    <span className="text-[11px] font-medium text-[#333333]">Index Slide</span>
                                </div>

                                {/* Glass Hero */}
                                <div
                                    ref={(ref: any) => ref && create(ref,
                                        <Element is={Container} canvas padding={60} height="100%" background="#F4F4F2" backgroundImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop" alignItems="center" justifyContent="center">
                                            <Element is={Container} canvas padding={40} background="rgba(255, 255, 255, 0.4)" backdropBlur={12} borderRadius={24} borderWidth={1} borderColor="rgba(255,255,255,0.4)" alignItems="center" justifyContent="center" height="auto" width="80%" boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)">
                                                <Title text="MODERN HERO" fontSize={48} color="#1a1a1a" textAlign="center" />
                                                <Text text="Create stunning presentations with professional visuals." color="#495464" textAlign="center" fontSize={18} />
                                            </Element>
                                        </Element>
                                    )}
                                    className="flex items-center gap-3 p-2 hover:bg-[#F5F5F5] rounded-lg cursor-grab transition-colors mt-1 border-t border-[#E5E5E5]"
                                >
                                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-1.5 rounded flex items-center justify-center text-indigo-500">
                                        <Layout size={14} />
                                    </div>
                                    <span className="text-[11px] font-medium text-[#333333]">Modern Glass Hero</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Drag Handle */}
                <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1"></div>
                <div
                    onPointerDown={handlePointerDown}
                    className="w-8 h-10 flex items-center justify-center text-[#BBBFCA] cursor-move hover:bg-gray-50 rounded-lg transition-colors"
                    title="Drag Toolbar"
                >
                    <GripVertical size={16} />
                </div>

            </div>
        </div>
    );
};
