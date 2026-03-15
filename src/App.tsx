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
import { LeftSidebar } from './components/editor/LeftSidebar';
import { BrandKitPanel } from './components/editor/BrandKitPanel';
import { TemplatesPanel } from './components/editor/TemplatesPanel';
import brandKits from './data/brandKits.json';
import { AppMode, SlideNode, SlideNodeData, PresentationFile, PresentationMetadata } from './types';
import { COLOR_PALETTE, cn, THEMES, ThemeType, DEFAULT_BRAND } from './constants';

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
  const [activeSidebarTab, setActiveSidebarTab] = useState('');
  const [metadata, setMetadata] = useState<PresentationMetadata>(() => {
    const saved = localStorage.getItem('slideflow-metadata');
    const base = {
      title: 'New Presentation',
      author: 'Anonymous',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      baseFontSize: 32,
      theme: 'modern',
      brand: DEFAULT_BRAND,
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...base, ...parsed };
      } catch (e) {
        return base;
      }
    }
    return base;
  });

  const [savedBrandKits, setSavedBrandKits] = useState<any[]>(() => {
    const saved = localStorage.getItem('slideflow-brand-kits');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('slideflow-brand-kits', JSON.stringify(savedBrandKits));
  }, [savedBrandKits]);

  const handleSaveBrandKit = useCallback((kit: any) => {
    const newKit = {
      ...kit,
      id: `custom_${Date.now()}`,
      name: `Meu Estilo ${savedBrandKits.length + 1}`
    };
    setSavedBrandKits(prev => [newKit, ...prev]);
  }, [savedBrandKits]);

  useEffect(() => {
    localStorage.setItem('slideflow-metadata', JSON.stringify(metadata));
  }, [metadata]);

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
  }, [nodes, setNodes]);

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
            item.props.fontFamily = theme.typography.fontFamily;
          } else if (item.type?.resolvedName === 'Text') {
            item.props.color = theme.colors.text;
            item.props.fontSize = theme.typography.textSize;
            item.props.fontFamily = theme.typography.fontFamily;
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

  const loadPresentation = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const presentation = JSON.parse(e.target?.result as string) as PresentationFile;
        setMetadata(presentation.metadata);
        setNodes(presentation.nodes);
        setEdges(presentation.edges);
        if (presentation.viewport) {
          setViewport(presentation.viewport);
        }
      } catch (err) {
        console.error("Failed to load presentation:", err);
        alert("Falha ao carregar a apresentação. Verifique se o arquivo é válido.");
      }
    };
    reader.readAsText(file);
    // Reset the input value to allow loading the same file again
    event.target.value = '';
  }, [setMetadata, setNodes, setEdges, setViewport]);

  const loadPresentationTemplate = useCallback((template: any) => {
    if (nodes.length > 0) {
      const confirm = window.confirm("Isso irá reescrever sua apresentação atual com o novo modelo. Deseja continuar?");
      if (!confirm) return;
    }

    const brand = template.brand;
    const templateSlides = template.slides;

    // Create nodes from template slides
    const newNodes: SlideNode[] = templateSlides.map((slide: any, index: number) => ({
      id: `node_${Date.now()}_${index}`,
      type: 'custom',
      position: { x: index * 1000, y: 0 }, // Linear horizontal progression
      data: {
        type: 'custom',
        label: slide.label,
        layout: slide.layout
      },
    }));

    // Create linear edges between nodes
    const newEdges: Edge[] = [];
    for (let i = 0; i < newNodes.length - 1; i++) {
      newEdges.push({
        id: `edge_${newNodes[i].id}_${newNodes[i + 1].id}`,
        source: newNodes[i].id,
        target: newNodes[i + 1].id,
        markerEnd: { type: MarkerType.ArrowClosed, color: COLOR_PALETTE.dark }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);

    // Deep merge template brand with DEFAULT_BRAND for resilience
    const mergedBrand = {
      colors: { ...DEFAULT_BRAND.colors, ...template.brand?.colors },
      fonts: { ...DEFAULT_BRAND.fonts, ...template.brand?.fonts },
      fontSizes: { ...DEFAULT_BRAND.fontSizes, ...template.brand?.fontSizes },
      fontWeights: { ...DEFAULT_BRAND.fontWeights, ...template.brand?.fontWeights },
      logoUrl: template.brand?.logoUrl
    };

    setMetadata(prev => ({
      ...prev,
      title: template.name,
      brand: mergedBrand
    }));

    // Reset view to first slide
    setTimeout(() => {
      fitView({ nodes: [{ id: newNodes[0].id }], duration: 800, padding: 0.1 });
    }, 100);

    setActiveSidebarTab('');
  }, [nodes, setNodes, setEdges, setMetadata, fitView]);

  return (
    <div
      className="w-full h-screen bg-[#E5E5E5] flex flex-col font-sans text-[#333333]"
      style={{
        '--slide-font-size': `${metadata.baseFontSize}px`,
        '--brand-primary': metadata.brand?.colors?.primary || DEFAULT_BRAND.colors.primary,
        '--brand-secondary': metadata.brand?.colors?.secondary || DEFAULT_BRAND.colors.secondary,
        '--brand-background': metadata.brand?.colors?.background || DEFAULT_BRAND.colors.background,
        '--brand-surface': metadata.brand?.colors?.surface || DEFAULT_BRAND.colors.surface,
        '--brand-text': metadata.brand?.colors?.text || DEFAULT_BRAND.colors.text,
        '--brand-font-title': metadata.brand?.fonts?.title || DEFAULT_BRAND.fonts.title,
        '--brand-font-header': metadata.brand?.fonts?.header || DEFAULT_BRAND.fonts.header,
        '--brand-font-subheader': metadata.brand?.fonts?.subheader || DEFAULT_BRAND.fonts.subheader,
        '--brand-font-body': metadata.brand?.fonts?.body || DEFAULT_BRAND.fonts.body,
        '--brand-size-title': `${metadata.brand?.fontSizes?.title || DEFAULT_BRAND.fontSizes.title}px`,
        '--brand-size-header': `${metadata.brand?.fontSizes?.header || DEFAULT_BRAND.fontSizes.header}px`,
        '--brand-size-subheader': `${metadata.brand?.fontSizes?.subheader || DEFAULT_BRAND.fontSizes.subheader}px`,
        '--brand-size-body': `${metadata.brand?.fontSizes?.body || DEFAULT_BRAND.fontSizes.body}px`,
        '--brand-weight-title': metadata.brand?.fontWeights?.title || DEFAULT_BRAND.fontWeights.title,
        '--brand-weight-header': metadata.brand?.fontWeights?.header || DEFAULT_BRAND.fontWeights.header,
        '--brand-weight-subheader': metadata.brand?.fontWeights?.subheader || DEFAULT_BRAND.fontWeights.subheader,
        '--brand-weight-body': metadata.brand?.fontWeights?.body || DEFAULT_BRAND.fontWeights.body,
      } as React.CSSProperties}
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
        <header className="h-14 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 z-10 transition-all shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0D99FF] to-[#007ACC] shadow-md border border-white/20">
              {metadata.brand?.logoUrl ? (
                <img src={metadata.brand.logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5 bg-white" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <span className="font-black text-xs">SF</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-[13px] leading-tight text-[#333333] tracking-tight">{metadata.title}</h1>
                <div className="px-1.5 py-0.5 bg-blue-50 text-[#0D99FF] text-[9px] font-bold rounded uppercase tracking-wider">Draft</div>
              </div>
              <p className="text-[10px] text-[#888888] font-medium tracking-wide">Publicado por {metadata.author}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMetadataOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 text-[#333333] rounded-xl transition-all text-xs font-bold active:scale-95 border border-transparent hover:border-[#E5E5E5]"
              title="Configurações da Apresentação"
            >
              <Save size={16} className="text-[#888888]" /> Salvar
            </button>
            <label className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 text-[#333333] rounded-xl transition-all text-xs font-bold cursor-pointer active:scale-95 border border-transparent hover:border-[#E5E5E5]" title="Carregar Projeto">
              <Upload size={16} className="text-[#888888]" /> Carregar
              <input type="file" accept=".json" onChange={loadPresentation} className="hidden" />
            </label>
            <div className="w-px h-8 bg-[#E5E5E5] mx-2" />
            <button
              onClick={startPresentation}
              className="flex items-center gap-2 px-6 py-2 bg-[#0D99FF] text-white hover:bg-blue-600 rounded-xl transition-all font-bold text-xs shadow-[0_4px_12px_rgba(13,153,255,0.3)] active:scale-95"
            >
              <Play size={14} fill="currentColor" /> Apresentar
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {mode === 'canvas' && (
          <LeftSidebar
            activeTab={activeSidebarTab}
            setActiveTab={setActiveSidebarTab}
          />
        )}

        <AnimatePresence>
          {mode === 'canvas' && activeSidebarTab === 'brand' && (
            <BrandKitPanel
              metadata={metadata}
              savedBrandKits={savedBrandKits}
              onUpdate={(brand) => setMetadata(prev => ({ ...prev, brand }))}
              onSaveBrandKit={() => handleSaveBrandKit(metadata.brand)}
              onClose={() => setActiveSidebarTab('')}
            />
          )}

          {mode === 'canvas' && activeSidebarTab === 'templates' && (
            <TemplatesPanel
              onSelectTemplate={addNodeWithTemplate}
              onSelectPresentationTemplate={loadPresentationTemplate}
              onClose={() => setActiveSidebarTab('')}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 relative overflow-hidden">
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
            className="bg-[#E5E5E5]"
            minZoom={0.1}
            maxZoom={10}
          >
            <Background color="#BBBFCA" gap={20} />
            {mode === 'canvas' && (
              <>
                <Controls className="bg-white border-[#E5E5E5] shadow-sm rounded-lg overflow-hidden" />
                <MiniMap
                  nodeColor={() => '#E5E5E5'}
                  maskColor="rgba(229, 229, 229, 0.6)"
                  className="bg-white border-[#E5E5E5] shadow-sm rounded-lg overflow-hidden"
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
                    className="bg-white px-3 py-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#E5E5E5] flex items-center gap-4"
                  >
                    <button
                      onClick={navigateBack}
                      disabled={navigationHistory.length <= 1}
                      className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 text-[#333333]"
                    >
                      <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>

                    <div className="flex flex-col items-center px-4">
                      <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-0.5">Slide</span>
                      <span className="text-lg font-black text-[#333333] tabular-nums">
                        {nodes.findIndex(n => n.id === currentNodeId) + 1} <span className="text-[#BBBFCA] font-medium mx-1">/</span> {nodes.length}
                      </span>
                    </div>

                    <button
                      onClick={() => nextNodeId && navigateTo(nextNodeId)}
                      disabled={!nextNodeId || isBifurcation}
                      className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 text-[#333333]"
                    >
                      <ChevronRight size={24} strokeWidth={2.5} />
                    </button>

                    <div className="w-px h-8 bg-[#E5E5E5] mx-2" />

                    <button
                      onClick={exitPresentation}
                      className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#333333] hover:bg-[#E5E5E5] rounded-xl transition-all font-bold text-xs active:scale-95"
                    >
                      <X size={16} strokeWidth={2.5} /> Sair
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
                    className="bg-white px-6 py-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#E5E5E5] flex items-center gap-4"
                  >
                    <span className="text-xs font-bold text-[#888888] uppercase tracking-wider">Escolha seu caminho:</span>
                    <div className="flex gap-2">
                      {outgoingEdges.map((edge, idx) => (
                        <button
                          key={edge.id}
                          onClick={() => navigateTo(edge.target)}
                          className="px-4 py-1.5 bg-[#0D99FF] text-white rounded-xl text-[11px] font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-sm"
                        >
                          Caminho {idx + 1}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </Panel>
              )}
            </AnimatePresence>

            {/* Dashboard Floating Toolbar (Canvas Mode) */}
            {mode === 'canvas' && (
              <Panel position="bottom-center" className="mb-6">
                <div className="bg-white px-2 py-1.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#E5E5E5] flex items-center gap-1">
                  <button
                    onClick={addNode}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-[#333333] rounded-xl transition-all text-xs font-bold active:scale-95"
                  >
                    <Plus size={18} className="text-[#0D99FF]" strokeWidth={2.5} /> Adicionar Slide
                  </button>

                  <div className="w-px h-6 bg-[#E5E5E5] mx-1" />

                  <button
                    onClick={() => {
                      const selected = nodes.find(n => n.selected);
                      if (selected) {
                        setEditingNodeId(selected.id);
                        setIsEditorOpen(true);
                      }
                    }}
                    disabled={!nodes.some(n => n.selected)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-xs font-bold",
                      nodes.some(n => n.selected) ? "hover:bg-gray-100 text-[#333333]" : "opacity-30 cursor-not-allowed text-[#BBBFCA]"
                    )}
                    title="Edit Selected Slide"
                  >
                    <Edit3 size={18} strokeWidth={2} /> Editar
                  </button>
                  <button
                    onClick={() => {
                      const selected = nodes.find(n => n.selected);
                      if (selected) {
                        deleteNode(selected.id);
                      }
                    }}
                    disabled={!nodes.some(n => n.selected)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-xs font-bold",
                      nodes.some(n => n.selected) ? "hover:bg-red-50 text-red-500" : "opacity-30 cursor-not-allowed text-[#BBBFCA]"
                    )}
                    title="Delete Selected Slide"
                  >
                    <Trash2 size={18} strokeWidth={2} /> Excluir
                  </button>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
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
          metadata={metadata}
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
        onClose={() => setIsThemeModalOpen(false)}
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
