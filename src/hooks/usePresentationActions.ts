import { useCallback } from 'react';
import { Edge, MarkerType, ReactFlowInstance, Viewport } from 'reactflow';
import { PresentationMetadata, PresentationFile, SlideNode } from '../types';
import { THEMES, ThemeType, DEFAULT_BRAND, COLOR_PALETTE } from '../constants';

interface UsePresentationActionsProps {
  nodes: SlideNode[];
  setNodes: React.Dispatch<React.SetStateAction<SlideNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  metadata: PresentationMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<PresentationMetadata>>;
  rfInstance: ReactFlowInstance | null;
  fitView: (options?: any) => void;
  setViewport: (viewport: Viewport) => void;
  setActiveSidebarTab: (tab: string) => void;
  setIsMetadataOpen: (isOpen: boolean) => void;
}

export const usePresentationActions = ({
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
}: UsePresentationActionsProps) => {

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
  }, [rfInstance, metadata, setIsMetadataOpen]);

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
  }, [nodes, setNodes, setEdges, setMetadata, fitView, setActiveSidebarTab]);

  return {
    applyThemeToNodes,
    savePresentation,
    loadPresentation,
    loadPresentationTemplate
  };
};
