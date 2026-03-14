import { Node, Edge, Viewport } from 'reactflow';

export type NodeType = 'custom';

export interface SlideNodeData {
  label?: string;
  type: NodeType;
  isFocused?: boolean;
  layout?: string; // Craft.js serialized state (JSON string)
}

export type SlideNode = Node<SlideNodeData>;

export interface PresentationMetadata {
  title: string;
  author: string;
  version: string;
  createdAt: string;
  baseFontSize: number;
  theme?: string;
  useThemeDefaults?: boolean;
  brand?: {
    logoUrl?: string;
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
    };
    fonts: {
      title: string;
      header: string;
      subheader: string;
      body: string;
    };
    fontSizes: {
      title: number;
      header: number;
      subheader: number;
      body: number;
    };
    fontWeights: {
      title: string;
      header: string;
      subheader: string;
      body: string;
    };
  };
}

export interface PresentationFile {
  metadata: PresentationMetadata;
  nodes: SlideNode[];
  edges: Edge[];
  viewport: Viewport;
}

export type AppMode = 'canvas' | 'player';
