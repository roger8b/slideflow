import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowInstance,
  Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Save, Upload } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

import { CustomNode } from './components/CustomNodes';
import { LeftSidebar } from './components/editor/LeftSidebar';

// Lazy loaded heavy components
const EditorContainer = React.lazy(() => import('./components/editor/EditorContainer').then(m => ({ default: m.EditorContainer })));
const MetadataModal = React.lazy(() => import('./components/MetadataModal').then(m => ({ default: m.MetadataModal })));
const ThemeModal = React.lazy(() => import('./components/ThemeModal').then(m => ({ default: m.ThemeModal })));
const BrandKitPanel = React.lazy(() => import('./components/editor/BrandKitPanel').then(m => ({ default: m.BrandKitPanel })));
const TemplatesPanel = React.lazy(() => import('./components/editor/TemplatesPanel').then(m => ({ default: m.TemplatesPanel })));

import { PlayerNavigation } from './components/canvas/PlayerNavigation';
import { BifurcationOverlay } from './components/canvas/BifurcationOverlay';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';

import { usePresentationNavigation } from './hooks/usePresentationNavigation';
import { usePresentationGraph } from './hooks/usePresentationGraph';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { AppMode, SlideNode, PresentationFile, PresentationMetadata } from './types';
import { THEMES, ThemeType, DEFAULT_BRAND, COLOR_PALETTE } from './constants';

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

  const { fitView, setViewport } = useReactFlow();

  const editingNode = useMemo(() => {
    return editingNodeId ? nodes.find((n) => n.id === editingNodeId) : null;
  }, [editingNodeId, nodes]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  // --- Hooks ---
  const {
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
  } = usePresentationNavigation(nodes, edges, setNodes, mode, setMode);

  const {
    onConnect,
    addNodeWithTemplate,
    addNode,
    deleteNode,
    onSaveNode
  } = usePresentationGraph(nodes, setNodes, setEdges, setActiveSidebarTab, setEditingNodeId, setIsEditorOpen);

  useKeyboardShortcuts(
    mode,
    nodes,
    addNode,
    deleteNode,
    startPresentation,
    setIsMetadataOpen,
    isEditorOpen
  );

  useEffect(() => {
    if (mode !== 'player') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        exitPresentation();
        return;
      }

      if (isBifurcation) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedBranchIndex((prev) => (prev - 1 + outgoingEdges.length) % outgoingEdges.length);
          return;
        }

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedBranchIndex((prev) => (prev + 1) % outgoingEdges.length);
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const selectedEdge = outgoingEdges[selectedBranchIndex];
          if (selectedEdge) {
            navigateTo(selectedEdge.target);
          }
        }

        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        navigateBack();
        return;
      }

      if ((event.key === 'ArrowRight' || event.key === 'ArrowDown') && nextNodeId) {
        event.preventDefault();
        navigateTo(nextNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isBifurcation, outgoingEdges, selectedBranchIndex, nextNodeId, navigateBack, navigateTo, exitPresentation, setSelectedBranchIndex]);


  const applyThemeToNodes = useCallback((themeId: string) => {
    const theme = THEMES[themeId as ThemeType];
    if (!theme) return;

    setNodes((nds) => nds.map((node) => {
      if (!node.data.layout) return node;

      try {
        const layout = JSON.parse(node.data.layout);

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
    link.download = `${title.replace(/\\s+/g, '_')}.slideflow.json`;
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
    event.target.value = '';
  }, [setMetadata, setNodes, setEdges, setViewport]);

  const loadPresentationTemplate = useCallback((template: any) => {
    if (nodes.length > 0) {
      const confirm = window.confirm("Isso irá reescrever sua apresentação atual com o novo modelo. Deseja continuar?");
      if (!confirm) return;
    }

    const templateSlides = template.slides;

    const newNodes: SlideNode[] = templateSlides.map((slide: any, index: number) => ({
      id: `node_${Date.now()}_${index}`,
      type: 'custom',
      position: { x: index * 1000, y: 0 },
      data: {
        type: 'custom',
        label: slide.label,
        layout: slide.layout
      },
    }));

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
            <React.Suspense fallback={<div className="w-[300px] h-full bg-white border-r border-[#E5E5E5] flex items-center justify-center text-sm text-[#888]">Loading...</div>}>
              <BrandKitPanel
                metadata={metadata}
                savedBrandKits={savedBrandKits}
                onUpdate={(brand) => setMetadata(prev => ({ ...prev, brand }))}
                onSaveBrandKit={() => handleSaveBrandKit(metadata.brand)}
                onClose={() => setActiveSidebarTab('')}
              />
            </React.Suspense>
          )}

          {mode === 'canvas' && activeSidebarTab === 'templates' && (
            <React.Suspense fallback={<div className="w-[300px] h-full bg-white border-r border-[#E5E5E5] flex items-center justify-center text-sm text-[#888]">Loading...</div>}>
              <TemplatesPanel
                onSelectTemplate={addNodeWithTemplate}
                onSelectPresentationTemplate={loadPresentationTemplate}
                onClose={() => setActiveSidebarTab('')}
              />
            </React.Suspense>
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
                <PlayerNavigation
                  nodes={nodes}
                  currentNodeId={currentNodeId}
                  navigationHistory={navigationHistory}
                  nextNodeId={nextNodeId}
                  isBifurcation={isBifurcation}
                  navigateBack={navigateBack}
                  navigateTo={navigateTo}
                  exitPresentation={exitPresentation}
                />
              )}
            </AnimatePresence>

            {/* Bifurcation Overlay */}
            <AnimatePresence>
              {mode === 'player' && isBifurcation && (
                <BifurcationOverlay
                  outgoingEdges={outgoingEdges}
                  selectedBranchIndex={selectedBranchIndex}
                  navigateTo={navigateTo}
                />
              )}
            </AnimatePresence>

            {/* Dashboard Floating Toolbar (Canvas Mode) */}
            {mode === 'canvas' && (
              <CanvasToolbar
                nodes={nodes}
                addNode={addNode}
                deleteNode={deleteNode}
                onEditNode={(id) => {
                  setEditingNodeId(id);
                  setIsEditorOpen(true);
                }}
              />
            )}
          </ReactFlow>
        </div>
      </main>

      {/* Modals */}
      <React.Suspense fallback={null}>
        {editingNode && (
          <EditorContainer
            isOpen={isEditorOpen}
            onClose={() => { setIsEditorOpen(false); setEditingNodeId(null); }}
            onSave={(layout) => {
              onSaveNode(editingNodeId, { type: 'custom', layout });
            }}
            initialLayout={editingNode.data.layout}
            nodeLabel={editingNode.data.label}
            metadata={metadata}
          />
        )}

        {isMetadataOpen && (
          <MetadataModal
            isOpen={isMetadataOpen}
            onClose={() => setIsMetadataOpen(false)}
            onSave={savePresentation}
            initialTitle={metadata.title}
            initialAuthor={metadata.author}
            initialBaseFontSize={metadata.baseFontSize}
          />
        )}

        {isThemeModalOpen && (
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
        )}
      </React.Suspense>
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
