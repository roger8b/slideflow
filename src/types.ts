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
}

export interface PresentationFile {
  metadata: PresentationMetadata;
  nodes: SlideNode[];
  edges: Edge[];
  viewport: Viewport;
}

export type AppMode = 'canvas' | 'player';
