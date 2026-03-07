import { Node, Edge, Viewport } from 'reactflow';

export type NodeType = 'text' | 'image' | 'video' | 'custom';

export interface SlideNodeData {
  label?: string;
  type: NodeType;
  content?: string; // For text nodes (Markdown)
  mediaBase64?: string; // For image/video nodes
  mediaName?: string;
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
}

export interface PresentationFile {
  metadata: PresentationMetadata;
  nodes: SlideNode[];
  edges: Edge[];
  viewport: Viewport;
}

export type AppMode = 'canvas' | 'player';
