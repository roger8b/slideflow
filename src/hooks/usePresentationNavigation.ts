import { useState, useCallback, useMemo, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { Edge } from 'reactflow';
import { AppMode, SlideNode } from '../types';

export const usePresentationNavigation = (
  nodes: SlideNode[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<SlideNode[]>>,
  mode: AppMode,
  setMode: (mode: AppMode) => void
) => {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState(0);

  const { fitView } = useReactFlow();

  const updateNodesFocus = useCallback((focusedId: string) => {
    setNodes((nds) => nds.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isFocused: node.id === focusedId
      }
    })));
  }, [setNodes]);

  const startPresentation = useCallback(() => {
    if (nodes.length === 0) return;

    setMode('player');
    const startNode = nodes[0].id;
    setCurrentNodeId(startNode);
    setNavigationHistory([startNode]);

    setTimeout(() => {
      fitView({ nodes: [{ id: startNode }], duration: 800, padding: 0.1 });
      updateNodesFocus(startNode);
    }, 100);
  }, [nodes, fitView, setMode, updateNodesFocus]);

  const exitPresentation = useCallback(() => {
    setMode('canvas');
    setCurrentNodeId(null);
    setNavigationHistory([]);
    setNodes((nds) => nds.map((node) => ({
      ...node,
      data: { ...node.data, isFocused: undefined }
    })));
  }, [setNodes, setMode]);

  const navigateTo = useCallback((nodeId: string) => {
    setCurrentNodeId(nodeId);
    setNavigationHistory((prev) => [...prev, nodeId]);
    fitView({ nodes: [{ id: nodeId }], duration: 800, padding: 0.1 });
    updateNodesFocus(nodeId);
  }, [fitView, updateNodesFocus]);

  const navigateBack = useCallback(() => {
    if (navigationHistory.length <= 1) return;

    const newHistory = [...navigationHistory];
    newHistory.pop();
    const prevNodeId = newHistory[newHistory.length - 1];

    setCurrentNodeId(prevNodeId);
    setNavigationHistory(newHistory);
    fitView({ nodes: [{ id: prevNodeId }], duration: 800, padding: 0.1 });
    updateNodesFocus(prevNodeId);
  }, [navigationHistory, fitView, updateNodesFocus]);

  const outgoingEdges = useMemo(() => {
    if (!currentNodeId) return [];
    return edges.filter((edge) => edge.source === currentNodeId);
  }, [edges, currentNodeId]);

  const nextNodeId = outgoingEdges.length === 1 ? outgoingEdges[0].target : null;
  const isBifurcation = outgoingEdges.length > 1;

  useEffect(() => {
    if (mode !== 'player') return;
    setSelectedBranchIndex(0);
  }, [mode, currentNodeId, outgoingEdges.length]);

  return {
    currentNodeId,
    navigationHistory,
    selectedBranchIndex,
    setSelectedBranchIndex,
    startPresentation,
    exitPresentation,
    navigateTo,
    navigateBack,
    outgoingEdges,
    nextNodeId,
    isBifurcation
  };
};
