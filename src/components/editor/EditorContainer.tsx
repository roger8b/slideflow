import React from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Container } from './selectors/Container';
import { Title } from './selectors/Title';
import { Text } from './selectors/Text';
import { Image } from './selectors/Image';
import { SidebarPalette } from './SidebarPalette';
import { SettingsPanel } from './SettingsPanel';
import { X, Save, Layers } from 'lucide-react';
import { SlideNodeData } from '../../types';

interface EditorContainerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (layoutJson: string) => void;
    initialLayout?: string;
    nodeLabel?: string;
}

export const EditorContainer = ({
    isOpen,
    onClose,
    onSave,
    initialLayout,
    nodeLabel
}: EditorContainerProps) => {
    const [showGrid, setShowGrid] = React.useState(false);

    // Listen for grid toggle events
    React.useEffect(() => {
        const handleToggleGrid = (event: CustomEvent) => {
            setShowGrid(event.detail);
        };

        window.addEventListener('toggleGrid', handleToggleGrid as EventListener);
        return () => window.removeEventListener('toggleGrid', handleToggleGrid as EventListener);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#F4F4F2] flex flex-col animate-in fade-in duration-300">
            <Editor
                resolver={{
                    Container,
                    Title,
                    Text,
                    Image,
                }}
            >
                {/* Editor Header */}
                <header className="h-16 bg-white border-b border-[#BBBFCA] flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#495464] rounded-xl flex items-center justify-center text-white">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight">Layout Simulator</h2>
                            <p className="text-[10px] text-[#BBBFCA] font-bold uppercase tracking-wider">Editing: {nodeLabel || 'Untitled Slide'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#E8E8E8] text-[#495464] rounded-lg transition-colors font-bold text-sm"
                        >
                            <X size={18} /> Discard changes
                        </button>
                        <SaveButton onSave={onSave} />
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Canvas Area */}
                    <div className="flex-1 overflow-y-auto p-12 bg-[#E8E8E8] flex justify-center items-center">
                        <div
                            className="bg-white shadow-2xl border border-[#BBBFCA] relative flex flex-col overflow-hidden"
                            style={{
                                width: '960px',
                                height: '540px',
                                minWidth: '960px',
                                minHeight: '540px',
                                aspectRatio: '16/9'
                            }}
                        >
                            <Frame json={initialLayout}>
                                <Element is={Container} padding={40} canvas flex={1} height="100%" />
                            </Frame>
                            
                            {/* Grid Overlay */}
                            {showGrid && (
                                <div 
                                    className="absolute inset-0 pointer-events-none z-10"
                                    style={{
                                        backgroundImage: `
                                            linear-gradient(rgba(73, 84, 100, 0.15) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(73, 84, 100, 0.15) 1px, transparent 1px),
                                            linear-gradient(rgba(73, 84, 100, 0.05) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(73, 84, 100, 0.05) 1px, transparent 1px)
                                        `,
                                        backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px'
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="w-80 flex flex-col bg-white border-l border-[#BBBFCA]">
                        <SettingsPanel />
                        <SidebarPalette />
                    </div>
                </div>
            </Editor>
        </div>
    );
};

const SaveButton = ({ onSave }: { onSave: (layout: string) => void }) => {
    const { query } = useEditor();

    return (
        <button
            onClick={() => {
                const json = query.serialize();
                onSave(json);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-[#495464] text-white hover:bg-[#3a4350] rounded-lg transition-all font-bold shadow-md hover:shadow-lg transform active:scale-95"
        >
            <Save size={18} /> Apply modifications
        </button>
    );
};
