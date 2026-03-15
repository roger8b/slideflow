import { useEffect } from 'react';
import { SlideNode } from '../types';

export const useKeyboardShortcuts = (
  mode: string,
  nodes: SlideNode[],
  addNode: () => void,
  deleteNode: (id: string) => void,
  startPresentation: () => void,
  setIsMetadataOpen: (isOpen: boolean) => void,
  isEditorOpen: boolean
) => {
  useEffect(() => {
    // Apenas ativamos os atalhos globais se não estiver no editor (para não conflitar com atalhos do craftjs) e estiver no modo canvas
    if (mode !== 'canvas' || isEditorOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) {
        return;
      }

      // Cmd/Ctrl + P: Iniciar apresentação
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        startPresentation();
      }

      // Cmd/Ctrl + S: Abrir modal de salvamento (Metadata)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setIsMetadataOpen(true);
      }

      // N: Novo Slide
      if (event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        addNode();
      }

      // Backspace / Delete: Deletar slide selecionado
      if (event.key === 'Backspace' || event.key === 'Delete') {
        const selectedNode = nodes.find(n => n.selected);
        if (selectedNode) {
          event.preventDefault();
          deleteNode(selectedNode.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, nodes, addNode, deleteNode, startPresentation, setIsMetadataOpen, isEditorOpen]);
};
