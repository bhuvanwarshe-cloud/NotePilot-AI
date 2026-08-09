import { supabase } from '@/lib/supabase';
import type { MindMap, MindMapNode, MindMapEdge, NodeType } from '../types';

/**
 * Fetch the canonical persisted Mind Map for a given lecture.
 * Only fetches the mind map for `lectureId` — does not fetch all mind maps.
 */
export async function fetchMindMapForLecture(lectureId: string): Promise<MindMap | null> {
  const { data: rows, error } = await supabase
    .from('mind_maps')
    .select('*')
    .eq('lecture_id', lectureId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!rows || rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return normalizeMindMap(row);
}

/**
 * Normalizes DB JSONB structure into strict MindMap interface.
 */
function normalizeMindMap(row: any): MindMap {
  const data = row.data && typeof row.data === 'object' ? row.data : {};

  const rawNodes = Array.isArray(data.nodes)
    ? data.nodes
    : Array.isArray(row.nodes)
    ? row.nodes
    : [];

  const rawEdges = Array.isArray(data.edges)
    ? data.edges
    : Array.isArray(row.edges)
    ? row.edges
    : [];

  const title = data.title || row.title || 'Mind Map';

  const nodes: MindMapNode[] = rawNodes.map((n: any, idx: number) => ({
    id: String(n.id || `node-${idx}`),
    label: String(n.label || n.name || n.title || 'Concept'),
    type: (n.type || (idx === 0 ? 'root' : 'concept')) as NodeType,
    description: n.description || n.explanation || n.text || undefined,
    relatedConceptId: n.relatedConceptId || n.related_concept_id || undefined,
    metadata: n.metadata || undefined,
  }));

  const edges: MindMapEdge[] = rawEdges.map((e: any, idx: number) => ({
    id: String(e.id || `edge-${idx}`),
    source: String(e.source || e.from || e.source_id || ''),
    target: String(e.target || e.to || e.target_id || ''),
    relationship: e.relationship || e.label || e.relation || undefined,
    label: e.relationship || e.label || undefined,
  }));

  return {
    id: row.id,
    lectureId: row.lecture_id,
    title,
    nodes,
    edges,
    generated_by: row.generated_by || 'AI',
    status: row.status || 'completed',
    created_at: row.created_at,
    metadata: data.metadata || row.metadata,
  };
}
