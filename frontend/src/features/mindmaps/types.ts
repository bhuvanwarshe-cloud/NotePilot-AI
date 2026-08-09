export type NodeType = 'root' | 'topic' | 'concept' | 'detail' | string;

export interface SourceReference {
  timestampSeconds?: number;
  pageNumber?: number;
  section?: string;
  label?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: NodeType;
  description?: string;
  relatedConceptId?: string;
  metadata?: {
    sourceReference?: SourceReference;
    [key: string]: any;
  };
  // Coordinates assigned by layout engine
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  relationship?: string;
  label?: string;
}

export interface MindMap {
  id: string;
  lectureId: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  generated_by?: string;
  status: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface LayoutedNode extends MindMapNode {
  x: number;
  y: number;
  width: number;
  height: number;
}
