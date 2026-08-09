import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import type { MindMapNode, MindMapEdge } from '../types';

interface MindMapNodeDetailsProps {
  node: MindMapNode | null;
  allNodes: MindMapNode[];
  edges: MindMapEdge[];
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  isCompact?: boolean;
}

export function MindMapNodeDetails({
  node,
  allNodes,
  edges,
  onClose,
  onSelectNode,
  isCompact = false,
}: MindMapNodeDetailsProps) {
  if (!node) return null;

  // Find connected nodes
  const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
  const connectedNodeIds = new Set<string>();
  connectedEdges.forEach(e => {
    if (e.source !== node.id) connectedNodeIds.add(e.source);
    if (e.target !== node.id) connectedNodeIds.add(e.target);
  });

  const connectedNodes = allNodes.filter(n => connectedNodeIds.has(n.id));

  // Source references
  const srcRef = node.metadata?.sourceReference;
  const timestampStr = srcRef?.timestampSeconds !== undefined
    ? `${Math.floor(srcRef.timestampSeconds / 60)}:${String(srcRef.timestampSeconds % 60).padStart(2, '0')}`
    : null;

  const typeColorMap: Record<string, { bg: string; color: string; border: string }> = {
    root:    { bg: 'rgba(59,130,246,0.12)', color: 'var(--np-blue)', border: 'rgba(59,130,246,0.3)' },
    topic:   { bg: 'rgba(139,92,246,0.12)', color: 'var(--np-purple)', border: 'rgba(139,92,246,0.3)' },
    concept: { bg: 'rgba(236,72,153,0.12)', color: 'var(--np-pink)', border: 'rgba(236,72,153,0.3)' },
    detail:  { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.3)' },
  };

  const badgeStyle = typeColorMap[node.type?.toLowerCase()] || typeColorMap.concept;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: isCompact ? 30 : 0, x: isCompact ? 0 : 30 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: isCompact ? 30 : 0, x: isCompact ? 0 : 30 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        style={{
          position: isCompact ? 'fixed' : 'absolute',
          bottom: isCompact ? 16 : 20,
          right: isCompact ? 16 : 20,
          left: isCompact ? 16 : 'auto',
          width: isCompact ? 'calc(100% - 32px)' : 360,
          maxHeight: isCompact ? '60vh' : '75vh',
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          borderRadius: 18,
          boxShadow: 'var(--np-shadow-elevated)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '16px 20px 14px',
            borderBottom: '1px solid var(--np-border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            background: 'var(--np-bg-secondary)',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 999,
                background: badgeStyle.bg,
                color: badgeStyle.color,
                border: `1px solid ${badgeStyle.border}`,
                marginBottom: 6,
              }}
            >
              {node.type || 'Concept'}
            </span>
            <h3
              style={{
                fontSize: 17,
                fontWeight: 750,
                color: 'var(--np-text-primary)',
                margin: 0,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              {node.label}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--np-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Description */}
          {node.description && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--np-text-muted)',
                  margin: '0 0 6px 0',
                }}
              >
                Overview
              </p>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: 'var(--np-text-secondary)',
                  margin: 0,
                }}
              >
                {node.description}
              </p>
            </div>
          )}

          {/* Source Reference */}
          {srcRef && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                background: 'var(--np-bg-secondary)',
                border: '1px solid var(--np-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--np-text-secondary)',
              }}
            >
              {srcRef.timestampSeconds !== undefined ? (
                <>
                  <Clock size={14} color="var(--np-blue)" />
                  <span>Timestamp: <strong>{timestampStr}</strong></span>
                </>
              ) : srcRef.pageNumber !== undefined ? (
                <>
                  <BookOpen size={14} color="var(--np-purple)" />
                  <span>Page: <strong>{srcRef.pageNumber}</strong></span>
                </>
              ) : srcRef.label ? (
                <>
                  <ExternalLink size={14} color="var(--np-pink)" />
                  <span>Section: <strong>{srcRef.label}</strong></span>
                </>
              ) : null}
            </div>
          )}

          {/* Related Concepts */}
          {connectedNodes.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--np-text-muted)',
                  margin: '0 0 8px 0',
                }}
              >
                Connected Concepts ({connectedNodes.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {connectedNodes.map((cn) => (
                  <button
                    key={cn.id}
                    onClick={() => onSelectNode(cn.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--np-border)',
                      background: 'var(--np-bg-secondary)',
                      color: 'var(--np-text-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--np-surface-raised)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--np-bg-secondary)')}
                  >
                    <span>{cn.label}</span>
                    <ArrowRight size={13} color="var(--np-text-muted)" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
