import React, { useState, useMemo, useEffect } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AnimatePresence } from 'motion/react';

import { CustomNode } from './components/CustomNodes';
import { LeftSidebar } from './components/editor/LeftSidebar';
import { Header } from './components/layout/Header';
import { usePresentationState } from './hooks/usePresentationState';
import { usePresentationActions } from './hooks/usePresentationActions';

// Lazy loaded heavy components
const EditorContainer = React.lazy(() => import('./components/editor/EditorContainer').then(m => ({ default: m.EditorContainer })));
const MetadataModal = React.lazy(() => import('./components/MetadataModal').then(m => ({ default: m.MetadataModal })));
const ThemeModal = React.lazy(() => import('./components/ThemeModal').then(m => ({ default: m.ThemeModal })));
const BrandKitPanel = React.lazy(() => import('./components/editor/BrandKitPanel').then(m => ({ default: m.BrandKitPanel })));
const TemplatesPanel = React.lazy(() => import('./components/editor/TemplatesPanel').then(m => ({ default: m.TemplatesPanel })));
const StorytellingsPanel = React.lazy(() => import('./components/editor/StorytellingsPanel').then(m => ({ default: m.StorytellingsPanel })));

import { PlayerNavigation } from './components/canvas/PlayerNavigation';
import { BifurcationOverlay } from './components/canvas/BifurcationOverlay';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';

import { usePresentationNavigation } from './hooks/usePresentationNavigation';
import { usePresentationGraph } from './hooks/usePresentationGraph';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { AppMode, SlideNode } from './types';
import { DEFAULT_BRAND } from './constants';

// Defined outside component to prevent ReactFlow nodeTypes warning (#002)
const nodeTypes = { custom: CustomNode };

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

  const {
    metadata,
    setMetadata,
    savedBrandKits,
    handleSaveBrandKit
  } = usePresentationState();

  const { fitView, setViewport } = useReactFlow();

  const editingNode = useMemo(() => {
    return editingNodeId ? nodes.find((n) => n.id === editingNodeId) : null;
  }, [editingNodeId, nodes]);

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

  // Listen for brand kit panel open requests from AILayoutGenerator
  useEffect(() => {
    const handleOpenBrandKitPanel = () => {
      setActiveSidebarTab('brand');
    };

    window.addEventListener('openBrandKitPanel', handleOpenBrandKitPanel);
    return () => window.removeEventListener('openBrandKitPanel', handleOpenBrandKitPanel);
  }, []);

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

  const {
    applyThemeToNodes,
    savePresentation,
    loadPresentation,
    loadPresentationTemplate
  } = usePresentationActions({
    nodes,
    setNodes,
    setEdges,
    metadata,
    setMetadata,
    rfInstance,
    fitView,
    setViewport,
    setActiveSidebarTab,
    setIsMetadataOpen
  });


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
        <Header
          metadata={metadata}
          setIsMetadataOpen={setIsMetadataOpen}
          loadPresentation={loadPresentation}
          startPresentation={startPresentation}
        />
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

          {mode === 'canvas' && activeSidebarTab === 'storytellings' && (
            <React.Suspense fallback={<div className="w-[300px] h-full bg-white border-r border-[#E5E5E5] flex items-center justify-center text-sm text-[#888]">Loading...</div>}>
              <StorytellingsPanel
                onClose={() => setActiveSidebarTab('')}
                addNode={(node) => setNodes((nds) => nds.concat(node))}
                rfInstance={rfInstance}
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
