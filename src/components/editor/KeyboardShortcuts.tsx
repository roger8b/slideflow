import React, { useEffect } from 'react';
import { useEditor } from '@craftjs/core';

export const KeyboardShortcuts = () => {
    const { actions, selectedNodeId, query } = useEditor((state) => {
        const selectedNodes = state.events.selected;
        return {
            selectedNodeId: selectedNodes.size > 0 ? Array.from(selectedNodes)[0] : null
        };
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if user is typing in an input, textarea or contentEditable element
            const target = event.target as HTMLElement;
            const isInput =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            if (isInput) return;

            // Handle Delete/Backspace
            if (event.key === 'Delete' || event.key === 'Backspace') {
                if (selectedNodeId && query.node(selectedNodeId).isDeletable()) {
                    actions.delete(selectedNodeId);
                }
            }

            // Handle Undo (Cmd/Ctrl + Z)
            if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
                if (event.shiftKey) {
                    // Cmd+Shift+Z for Redo
                    actions.history?.redo();
                } else {
                    actions.history?.undo();
                }
            }

            // Handle Redo (Cmd/Ctrl + Y)
            if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
                actions.history?.redo();
            }

            // Handle Duplicate (Cmd/Ctrl + D)
            if ((event.metaKey || event.ctrlKey) && event.key === 'd') {
                event.preventDefault();
                if (selectedNodeId) {
                    const node = query.node(selectedNodeId).get();
                    const parentId = node.data.parent;
                    if (parentId) {
                        const tree = query.node(selectedNodeId).toNodeTree();
                        actions.addNodeTree(tree, parentId);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, actions, query]);

    return null;
};
