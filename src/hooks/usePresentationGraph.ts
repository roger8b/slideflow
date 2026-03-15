import { useCallback } from 'react';
import { Edge, Connection, MarkerType, addEdge } from 'reactflow';
import { SlideNode } from '../types';
import { COLOR_PALETTE } from '../constants';

export const usePresentationGraph = (
  nodes: SlideNode[],
  setNodes: React.Dispatch<React.SetStateAction<SlideNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  setActiveSidebarTab: (tab: string) => void,
  setEditingNodeId: (id: string | null) => void,
  setIsEditorOpen: (isOpen: boolean) => void
) => {
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed, color: COLOR_PALETTE.dark } }, eds)),
    [setEdges]
  );

  const addNodeWithTemplate = useCallback((layout: string) => {
    const id = `node_${Date.now()}`;
    const newNode: SlideNode = {
      id,
      type: 'custom',
      position: { x: nodes.length * 100, y: nodes.length * 100 },
      data: { type: 'custom', label: 'Slide Template', layout },
    };
    setNodes((nds) => nds.concat(newNode));
    setActiveSidebarTab('');
  }, [nodes, setNodes, setActiveSidebarTab]);

  const addNode = useCallback(() => {
    const id = `node_${Date.now()}`;
    const newNode: SlideNode = {
      id,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { type: 'custom', label: 'Custom Slide' },
    };
    setNodes((nds) => nds.concat(newNode));
    setEditingNodeId(id);
    setIsEditorOpen(true);
  }, [setNodes, setEditingNodeId, setIsEditorOpen]);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const onSaveNode = useCallback((editingNodeId: string | null, data: any) => {
    if (!editingNodeId) return;
    setNodes((nds) => nds.map((node) => {
      if (node.id === editingNodeId) {
        return { ...node, type: data.type, data: { ...node.data, ...data } };
      }
      return node;
    }));
    setIsEditorOpen(false);
    setEditingNodeId(null);
  }, [setNodes, setIsEditorOpen, setEditingNodeId]);

  return {
    onConnect,
    addNodeWithTemplate,
    addNode,
    deleteNode,
    onSaveNode
  };
};
