import React, { useEffect, useRef } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { setClipboard, getClipboard, cloneNodeTree } from '../../lib/clipboard';
import { Container } from './selectors/Container';
import { Title } from './selectors/Title';
import { Text } from './selectors/Text';
import { Image } from './selectors/Image';
import { Icon } from './selectors/Icon';
import { SidebarPalette } from './SidebarPalette';
import { SettingsPanel } from './SettingsPanel';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { FloatingToolbar } from './FloatingToolbar';
import { X, Save, Box, Grid3X3 } from 'lucide-react';
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
                    Icon,
                }}
            >
                <KeyboardShortcuts />
                <ClipboardShortcuts />

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
                            className="artboard-container bg-white shadow-sm ring-1 ring-[#BBBFCA] relative flex flex-col overflow-hidden my-16 mx-16"
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

                            {/* Global Grid Overlay Support - Controlled via FloatingToolbar status via CSS variable injected in FloatingToolbar or globally here if we use a shared state. But since user wants it in toolbar, I'll use a CSS var trick or shared state. Let's use a simpler approach: always active if var is set. */}
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                .artboard-container {
                                    --show-grid-overlay: var(--grid-visible, 0);
                                }
                            `}} />
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

const ClipboardShortcuts = () => {
    const { actions, query, selectedId } = useEditor((state) => {
        const [id] = state.events.selected;
        return { selectedId: id ?? null };
    });

    // Ref keeps the keydown handler stable (empty deps) while always reading latest values
    const stateRef = useRef({ actions, query, selectedId });
    stateRef.current = { actions, query, selectedId };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

            const isCtrl = e.ctrlKey || e.metaKey;
            const { actions, query, selectedId } = stateRef.current;

            // Ctrl+C — copy selected node
            if (isCtrl && e.key === 'c' && selectedId) {
                e.preventDefault();
                try {
                    const tree = query.node(selectedId).toNodeTree();
                    setClipboard(tree);
                } catch (err) { console.warn('[Ctrl+C]', err); }
            }

            // Ctrl+V — paste after / inside selected node
            if (isCtrl && e.key === 'v') {
                e.preventDefault();
                const tree = getClipboard();
                if (!tree) return;
                try {
                    if (selectedId) {
                        const node = query.node(selectedId).get();
                        if (node.data.isCanvas) {
                            actions.addNodeTree(tree, selectedId);
                        } else {
                            const parentId = node.data.parent;
                            if (parentId) {
                                const siblings: string[] = query.node(parentId).get().data.nodes ?? [];
                                const idx = siblings.indexOf(selectedId);
                                actions.addNodeTree(tree, parentId, idx + 1);
                            }
                        }
                    } else {
                        actions.addNodeTree(tree, 'ROOT');
                    }
                } catch (err) { console.warn('[Ctrl+V]', err); }
            }

            // Ctrl+D — duplicate selected node in place
            if (isCtrl && e.key === 'd' && selectedId) {
                e.preventDefault();
                try {
                    const node = query.node(selectedId).get();
                    const parentId = node.data.parent;
                    if (parentId) {
                        const tree = cloneNodeTree(query.node(selectedId).toNodeTree());
                        const siblings: string[] = query.node(parentId).get().data.nodes ?? [];
                        const idx = siblings.indexOf(selectedId);
                        actions.addNodeTree(tree, parentId, idx + 1);
                    }
                } catch (err) { console.warn('[Ctrl+D]', err); }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []); // empty — reads latest values via ref

    return null;
};
