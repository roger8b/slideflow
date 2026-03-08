import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  MarkerType,
  useReactFlow,
  Panel,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Play,
  Plus,
  Save,
  Upload,
  ChevronRight,
  ChevronLeft,
  Edit3,
  Trash2,
  Monitor,
  X,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { CustomNode } from './components/CustomNodes';
import { EditorContainer } from './components/editor/EditorContainer';
import { MetadataModal } from './components/MetadataModal';
import { ThemeModal } from './components/ThemeModal';
import { AppMode, SlideNode, SlideNodeData, PresentationFile, PresentationMetadata } from './types';
import { COLOR_PALETTE, cn, THEMES, ThemeType } from './constants';

// Node types moved inside component and memoized to avoid React Flow warning

const initialNodes: SlideNode[] = [
  {
    id: 'start',
    type: 'custom',
    position: { x: 250, y: 5 },
    data: {
      type: 'custom',
      label: 'Start'
    },
  },
];

const initialEdges: Edge[] = [];

const SlideFlowContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [mode, setMode] = useState<AppMode>('canvas');
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isPlayerControlsVisible, setIsPlayerControlsVisible] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [metadata, setMetadata] = useState<PresentationMetadata>({
    title: 'New Presentation',
    author: 'Anonymous',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    baseFontSize: 32,
    theme: 'modern',
  });

  const { fitView, setViewport, toObject } = useReactFlow();

  const editingNode = useMemo(() => {
    return editingNodeId ? nodes.find((n) => n.id === editingNodeId) : null;
  }, [editingNodeId, nodes]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  // --- Navigation Logic ---

  const startPresentation = useCallback(() => {
    if (nodes.length === 0) return;

    setMode('player');
    const startNode = nodes[0].id;
    setCurrentNodeId(startNode);
    setNavigationHistory([startNode]);

    // Focus first node
    setTimeout(() => {
      fitView({ nodes: [{ id: startNode }], duration: 800, padding: 0.1 });
      updateNodesFocus(startNode);
    }, 100);
  }, [nodes, fitView]);

  const exitPresentation = useCallback(() => {
    setMode('canvas');
    setCurrentNodeId(null);
    setNavigationHistory([]);
    // Reset focus
    setNodes((nds) => nds.map((node) => ({
      ...node,
      data: { ...node.data, isFocused: undefined }
    })));
  }, [setNodes]);

  const updateNodesFocus = useCallback((focusedId: string) => {
    setNodes((nds) => nds.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isFocused: node.id === focusedId
      }
    })));
  }, [setNodes]);

  const navigateTo = useCallback((nodeId: string) => {
    setCurrentNodeId(nodeId);
    setNavigationHistory((prev) => [...prev, nodeId]);
    fitView({ nodes: [{ id: nodeId }], duration: 800, padding: 0.1 });
    updateNodesFocus(nodeId);
  }, [fitView, updateNodesFocus]);

  const navigateBack = useCallback(() => {
    if (navigationHistory.length <= 1) return;

    const newHistory = [...navigationHistory];
    newHistory.pop(); // Remove current
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

  // --- Graph Management ---

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed, color: COLOR_PALETTE.dark } }, eds)),
    [setEdges]
  );

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
  }, [setNodes]);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const onSaveNode = useCallback((data: any) => {
    if (!editingNodeId) return;
    setNodes((nds) => nds.map((node) => {
      if (node.id === editingNodeId) {
        return { ...node, type: data.type, data: { ...node.data, ...data } };
      }
      return node;
    }));
    setIsEditorOpen(false);
    setEditingNodeId(null);
  }, [editingNodeId, setNodes]);

  // --- Persistence ---

  // --- Presentation Logic ---

  const applyThemeToNodes = useCallback((themeId: string) => {
    const theme = THEMES[themeId as ThemeType];
    if (!theme) return;

    setNodes((nds) => nds.map((node) => {
      // Craft.js layout is stored as a JSON string
      if (!node.data.layout) return node;

      try {
        const layout = JSON.parse(node.data.layout);

        // Update all nodes in the Craft instance
        Object.keys(layout).forEach(key => {
          const item = layout[key];
          if (item.type?.resolvedName === 'Title') {
            item.props.color = theme.colors.title;
            item.props.fontSize = theme.typography.titleSize;
            item.props.fontWeight = theme.typography.titleWeight;
          } else if (item.type?.resolvedName === 'Text') {
            item.props.color = theme.colors.text;
            item.props.fontSize = theme.typography.textSize;
          } else if (item.type?.resolvedName === 'Container' && item.isCanvas) {
            // Main container (the slide itself usually)
            if (key === 'ROOT') {
              item.props.background = theme.colors.background;
              item.props.padding = theme.layout.padding;
              item.props.gap = theme.layout.gap;
              item.props.borderRadius = theme.layout.borderRadius;
            }
          }
        });

        return {
          ...node,
          data: {
            ...node.data,
            layout: JSON.stringify(layout)
          }
        };
      } catch (err) {
        console.error("Failed to apply theme to node:", err);
        return node;
      }
    }));
  }, [setNodes]);

  const savePresentation = useCallback((title: string, author: string, baseFontSize: number) => {
    if (!rfInstance) return;

    const flow = rfInstance.toObject();
    const presentation: PresentationFile = {
      metadata: {
        ...metadata,
        title,
        author,
        baseFontSize,
        createdAt: new Date().toISOString(),
      },
      nodes: flow.nodes as SlideNode[],
      edges: flow.edges,
      viewport: flow.viewport,
    };

    const blob = new Blob([JSON.stringify(presentation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.slideflow.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsMetadataOpen(false);
  }, [rfInstance, metadata]);

  const loadPresentation = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const presentation: PresentationFile = JSON.parse(event.target?.result as string);

        // Basic validation
        if (!presentation.nodes || !presentation.edges) {
          throw new Error('Invalid SlideFlow file format');
        }

        setNodes(presentation.nodes);
        setEdges(presentation.edges);
        setMetadata(presentation.metadata);

        if (presentation.viewport) {
          setViewport(presentation.viewport);
        }
      } catch (err) {
        console.error('Error loading presentation:', err);
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges, setViewport]);

  return (
    <div
      className="w-full h-screen bg-[#F4F4F2] flex flex-col font-sans text-[#495464]"
      style={{ '--slide-font-size': `${metadata.baseFontSize}px` } as React.CSSProperties}
      onMouseMove={(e) => {
        if (mode === 'player') {
          const threshold = window.innerHeight - 100;
          if (e.clientY > threshold) {
            setIsPlayerControlsVisible(true);
          } else if (e.clientY < threshold - 50) {
            setIsPlayerControlsVisible(false);
          }
        }
      }}
    >
      {/* Header / Toolbar */}
      {mode === 'canvas' && (
        <header className="h-16 bg-white border-b border-[#BBBFCA] flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#495464] rounded-xl flex items-center justify-center text-white">
              <Monitor size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{metadata.title}</h1>
              <p className="text-xs text-[#BBBFCA] font-medium uppercase tracking-wider">by {metadata.author}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={addNode}
              className="flex items-center gap-2 px-4 py-2 bg-[#E8E8E8] hover:bg-[#BBBFCA] rounded-lg transition-colors font-semibold text-sm"
            >
              <Plus size={18} /> Add Slide
            </button>
            <div className="w-px h-6 bg-[#BBBFCA] mx-2" />
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#E8E8E8] hover:border-[#495464] text-[#495464] rounded-lg transition-all font-bold text-sm"
              title="Change Global Style"
            >
              <Palette size={18} /> Design
            </button>
            <div className="w-px h-6 bg-[#BBBFCA] mx-1" />
            <button
              onClick={() => setIsMetadataOpen(true)}
              className="p-2 hover:bg-[#E8E8E8] rounded-lg transition-colors text-[#495464]"
              title="Save Presentation"
            >
              <Save size={20} />
            </button>
            <label className="p-2 hover:bg-[#E8E8E8] rounded-lg transition-colors text-[#495464] cursor-pointer" title="Load Presentation">
              <Upload size={20} />
              <input type="file" accept=".json" onChange={loadPresentation} className="hidden" />
            </label>
            <div className="w-px h-6 bg-[#BBBFCA] mx-2" />
            <button
              onClick={startPresentation}
              className="flex items-center gap-2 px-6 py-2 bg-[#495464] text-white hover:bg-[#3a4350] rounded-lg transition-all font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Play size={18} fill="currentColor" /> Present
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={setRfInstance}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          nodesDraggable={mode === 'canvas'}
          nodesConnectable={mode === 'canvas'}
          elementsSelectable={mode === 'canvas'}
          panOnDrag={true}
          selectionOnDrag={mode === 'canvas'}
          className="bg-[#F4F4F2]"
          minZoom={0.1}
          maxZoom={10}
        >
          <Background color="#BBBFCA" gap={20} />
          {mode === 'canvas' && (
            <>
              <Controls className="bg-white border-[#BBBFCA] shadow-md" />
              <MiniMap
                nodeColor={() => '#BBBFCA'}
                className="bg-white border-[#BBBFCA] shadow-md"
              />
            </>
          )}

          {/* Player Navigation Overlay */}
          <AnimatePresence>
            {mode === 'player' && isPlayerControlsVisible && (
              <Panel position="bottom-center" className="mb-8">
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl border border-[#BBBFCA] flex items-center gap-8"
                >
                  <button
                    onClick={navigateBack}
                    disabled={navigationHistory.length <= 1}
                    className="p-3 rounded-xl hover:bg-[#E8E8E8] disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-[#495464]"
                  >
                    <ChevronLeft size={32} />
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-[#BBBFCA] uppercase tracking-widest mb-1">Slide</span>
                    <span className="text-xl font-black text-[#495464]">
                      {nodes.findIndex(n => n.id === currentNodeId) + 1} / {nodes.length}
                    </span>
                  </div>

                  <button
                    onClick={() => nextNodeId && navigateTo(nextNodeId)}
                    disabled={!nextNodeId || isBifurcation}
                    className="p-3 rounded-xl hover:bg-[#E8E8E8] disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-[#495464]"
                  >
                    <ChevronRight size={32} />
                  </button>

                  <div className="w-px h-10 bg-[#BBBFCA] mx-2" />

                  <button
                    onClick={exitPresentation}
                    className="flex items-center gap-2 px-4 py-2 bg-[#BBBFCA] text-[#495464] hover:bg-[#a0a4b0] rounded-lg transition-all font-bold text-sm"
                  >
                    <X size={18} /> Exit
                  </button>
                </motion.div>
              </Panel>
            )}
          </AnimatePresence>

          {/* Bifurcation Overlay */}
          <AnimatePresence>
            {mode === 'player' && isBifurcation && (
              <Panel position="top-center" className="mt-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#495464] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4"
                >
                  <span className="font-bold">Choose your path:</span>
                  <div className="flex gap-2">
                    {outgoingEdges.map((edge, idx) => (
                      <button
                        key={edge.id}
                        onClick={() => navigateTo(edge.target)}
                        className="px-4 py-1 bg-white text-[#495464] rounded-full text-sm font-bold hover:bg-[#E8E8E8] transition-colors"
                      >
                        Path {idx + 1}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </Panel>
            )}
          </AnimatePresence>

          {/* Node Actions (Canvas Mode) */}
          {mode === 'canvas' && (
            <Panel position="top-right" className="mr-4 mt-4">
              <div className="bg-white p-2 rounded-xl shadow-lg border border-[#BBBFCA] flex flex-col gap-2">
                <button
                  onClick={() => {
                    const selected = nodes.find(n => n.selected);
                    if (selected) {
                      setEditingNodeId(selected.id);
                      setIsEditorOpen(true);
                    }
                  }}
                  className={cn(
                    "p-3 rounded-lg transition-colors",
                    nodes.some(n => n.selected) ? "hover:bg-[#E8E8E8] text-[#495464]" : "opacity-30 cursor-not-allowed text-[#BBBFCA]"
                  )}
                  title="Edit Selected Node"
                >
                  <Edit3 size={20} />
                </button>
                <button
                  onClick={() => {
                    const selected = nodes.find(n => n.selected);
                    if (selected) {
                      deleteNode(selected.id);
                    }
                  }}
                  className={cn(
                    "p-3 rounded-lg transition-colors",
                    nodes.some(n => n.selected) ? "hover:bg-red-50 text-red-500" : "opacity-30 cursor-not-allowed text-[#BBBFCA]"
                  )}
                  title="Delete Selected Node"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </main>

      {/* Modals */}
      {editingNode && (
        <EditorContainer
          isOpen={isEditorOpen}
          onClose={() => { setIsEditorOpen(false); setEditingNodeId(null); }}
          onSave={(layout) => {
            onSaveNode({ type: 'custom', layout });
          }}
          initialLayout={editingNode.data.layout}
          nodeLabel={editingNode.data.label}
        />
      )}

      <MetadataModal
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
        onSave={savePresentation}
        initialTitle={metadata.title}
        initialAuthor={metadata.author}
        initialBaseFontSize={metadata.baseFontSize}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(true)} // Keep open or just for visual
        onApply={(theme) => {
          applyThemeToNodes(theme);
          setMetadata(prev => ({ ...prev, theme }));
          setIsThemeModalOpen(false);
        }}
        currentTheme={metadata.theme}
      />
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <SlideFlowContent />
    </ReactFlowProvider>
  );
}
