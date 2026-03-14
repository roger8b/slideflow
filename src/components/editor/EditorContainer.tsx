import React from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Container } from './selectors/Container';
import { Title } from './selectors/Title';
import { Text } from './selectors/Text';
import { Image } from './selectors/Image';
import { SidebarPalette } from './SidebarPalette';
import { SettingsPanel } from './SettingsPanel';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { FloatingToolbar } from './FloatingToolbar';
import { X, Save, Box } from 'lucide-react';
import { SlideNodeData } from '../../types';

interface EditorContainerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (layoutJson: string) => void;
    initialLayout?: string;
    nodeLabel?: string;
    metadata: any;
}

export const EditorContainer = ({
    isOpen,
    onClose,
    onSave,
    initialLayout,
    nodeLabel,
    metadata
}: EditorContainerProps) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
            <Editor
                resolver={{
                    Container,
                    Title,
                    Text,
                    Image,
                }}
            >
                <KeyboardShortcuts />

                {/* Editor Header - Figma Style Slim */}
                <header className="h-12 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-4 z-20">
                    <div className="flex items-center gap-3">
                        <div className="text-[#333333] flex items-center justify-center">
                            <Box size={16} strokeWidth={2} className="text-[#0D99FF]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-[#333333] tracking-wide">Slideflow Editor</span>
                            <span className="text-[#E5E5E5]">/</span>
                            <span className="text-[11px] text-[#888888]">{nodeLabel || 'Untitled Slide'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 text-[#333333] rounded-md transition-colors text-[11px] font-medium"
                        >
                            <X size={14} /> Discard
                        </button>
                        <SaveButton onSave={onSave} />
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left Navigation: Layers & Assets */}
                    <SidebarPalette />

                    {/* Main Canvas Area */}
                    <div className="flex-1 overflow-auto bg-[#E5E5E5] relative flex justify-center items-center">
                        <FloatingToolbar />

                        {/* The "Artboard" */}
                        <div
                            className="bg-white shadow-sm ring-1 ring-[#BBBFCA] relative flex flex-col overflow-hidden my-16 mx-16"
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
                        </div>
                    </div>

                    {/* Right Property Inspector: Contextual Settings */}
                    <SettingsPanel metadata={metadata} />
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D99FF] text-white hover:bg-blue-600 rounded-md transition-colors text-[11px] font-medium shadow-sm"
        >
            <Save size={14} /> Save
        </button>
    );
};
