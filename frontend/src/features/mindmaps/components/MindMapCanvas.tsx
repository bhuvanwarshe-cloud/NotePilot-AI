import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { MindMapNode, MindMapEdge, LayoutedNode } from '../types';
import { MindMapToolbar } from './MindMapToolbar';
import { MindMapNodeDetails } from './MindMapNodeDetails';
import { useIsCompact } from '@/hooks/useMediaQuery';

interface MindMapCanvasProps {
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic Tree Layout Algorithm
// ─────────────────────────────────────────────────────────────────────────────
function calculateLayout(nodes: MindMapNode[], edges: MindMapEdge[]): {
  layoutedNodes: LayoutedNode[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
} {
  if (!nodes || nodes.length === 0) {
    return { layoutedNodes: [], bounds: { minX: 0, maxX: 800, minY: 0, maxY: 600 } };
  }

  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Find root node
  let rootId = nodes.find(n => n.type === 'root')?.id;

  // Fallback 1: node with 0 incoming edges
  if (!rootId) {
    const targets = new Set(edges.map(e => e.target));
    const noIncoming = nodes.find(n => !targets.has(n.id));
    if (noIncoming) rootId = noIncoming.id;
  }

  // Fallback 2: first node
  if (!rootId) rootId = nodes[0].id;

  // Build adjacency tree (parent -> children)
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  edges.forEach(e => {
    if (!childrenMap.has(e.source)) childrenMap.set(e.source, []);
    childrenMap.get(e.source)!.push(e.target);
    parentMap.set(e.target, e.source);
  });

  // Assign levels (BFS from root)
  const levels = new Map<string, number>();
  const queue: Array<{ id: string; level: number }> = [{ id: rootId, level: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    levels.set(id, level);

    const children = childrenMap.get(id) || [];
    children.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, level: level + 1 });
      }
    });
  }

  // Any unvisited nodes (disconnected components) gets level 1
  nodes.forEach(n => {
    if (!levels.has(n.id)) levels.set(n.id, 1);
  });

  // Group nodes by level
  const levelGroups = new Map<number, MindMapNode[]>();
  nodes.forEach(n => {
    const l = levels.get(n.id) || 0;
    if (!levelGroups.has(l)) levelGroups.set(l, []);
    levelGroups.get(l)!.push(n);
  });

  const layoutedNodes: LayoutedNode[] = [];
  const levelYGap = 160;
  const nodeXGap = 240;

  // Compute (x, y) for each node
  const sortedLevelKeys = Array.from(levelGroups.keys()).sort((a, b) => a - b);

  sortedLevelKeys.forEach(level => {
    const group = levelGroups.get(level)!;
    const count = group.length;
    const totalWidth = (count - 1) * nodeXGap;
    const startX = -totalWidth / 2;

    group.forEach((node, idx) => {
      const x = startX + idx * nodeXGap;
      const y = level * levelYGap + 60;
      
      const width = node.type === 'root' ? 220 : node.type === 'topic' ? 190 : 170;
      const height = node.type === 'root' ? 70 : 54;

      layoutedNodes.push({
        ...node,
        x,
        y,
        width,
        height,
      });
    });
  });

  // Compute graph bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  layoutedNodes.forEach(n => {
    if (n.x < minX) minX = n.x;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y < minY) minY = n.y;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  });

  return {
    layoutedNodes,
    bounds: {
      minX: isFinite(minX) ? minX : -400,
      maxX: isFinite(maxX) ? maxX : 400,
      minY: isFinite(minY) ? minY : 0,
      maxY: isFinite(maxY) ? maxY : 600,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas Component
// ─────────────────────────────────────────────────────────────────────────────
export function MindMapCanvas({
  title,
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}: MindMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isCompact = useIsCompact();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate layout
  const { layoutedNodes, bounds } = useMemo(() => calculateLayout(nodes, edges), [nodes, edges]);
  const nodePositionMap = useMemo(() => {
    const map = new Map<string, LayoutedNode>();
    layoutedNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [layoutedNodes]);

  // Fit graph to viewport
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const vw = rect.width || 800;
    const vh = rect.height || 500;

    const graphW = Math.max(bounds.maxX - bounds.minX + 160, 400);
    const graphH = Math.max(bounds.maxY - bounds.minY + 160, 300);

    const scaleX = vw / graphW;
    const scaleY = vh / graphH;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.9, 0.35), 1.4);

    const graphCenterX = (bounds.minX + bounds.maxX) / 2;
    const graphCenterY = (bounds.minY + bounds.maxY) / 2;

    const newPanX = vw / 2 - graphCenterX * newZoom;
    const newPanY = vh / 2 - graphCenterY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [bounds]);

  // Fit on initial mount or layoutedNodes change
  useEffect(() => {
    fitToScreen();
  }, [nodes.length, fitToScreen]);

  // Center on selected node when search result is picked
  useEffect(() => {
    if (!selectedNodeId || !containerRef.current) return;
    const target = nodePositionMap.get(selectedNodeId);
    if (!target) return;

    const rect = containerRef.current.getBoundingClientRect();
    const targetX = target.x + target.width / 2;
    const targetY = target.y + target.height / 2;

    const newPanX = rect.width / 2 - targetX * zoom;
    const newPanY = rect.height / 2 - targetY * zoom;

    setPan({ x: newPanX, y: newPanY });
  }, [selectedNodeId, zoom, nodePositionMap]);

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(z * 1.25, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z * 0.8, 0.25));
  const handleReset = () => {
    setZoom(1);
    fitToScreen();
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.min(Math.max(z * delta, 0.25), 2.5));
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.mindmap-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Selected node object
  const selectedNode = selectedNodeId ? nodePositionMap.get(selectedNodeId) || null : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', height: '100%' }}>
      {/* ── Toolbar ── */}
      <MindMapToolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToScreen={fitToScreen}
        onReset={handleReset}
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onSelectNode={(id) => onSelectNode(id)}
        isCompact={isCompact}
      />

      {/* ── Lecture Title ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--np-text-muted)', margin: 0 }}>
          Studying Mind Map for: <strong style={{ color: 'var(--np-text-primary)' }}>{title}</strong>
        </p>
        <span style={{ fontSize: 11, color: 'var(--np-text-muted)', fontStyle: 'italic' }}>
          Drag canvas to pan • Scroll to zoom • Click node for details
        </span>
      </div>

      {/* ── Canvas Viewport ── */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: 'relative',
          width: '100%',
          height: isCompact ? 'calc(100vh - 260px)' : '600px',
          minHeight: 420,
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          borderRadius: 20,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          boxShadow: 'var(--np-shadow-card)',
        }}
      >
        {/* Background Grid Pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(var(--np-border-strong) 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />

        {/* Scaled & Translated Layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
          }}
        >
          {/* SVG Connection Edges Layer */}
          <svg
            style={{
              position: 'absolute',
              overflow: 'visible',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <linearGradient id="edgeGradientActive" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--np-blue)" />
                <stop offset="100%" stopColor="var(--np-purple)" />
              </linearGradient>
            </defs>

            {edges.map((edge) => {
              const src = nodePositionMap.get(edge.source);
              const tgt = nodePositionMap.get(edge.target);
              if (!src || !tgt) return null;

              const x1 = src.x + src.width / 2;
              const y1 = src.y + src.height;
              const x2 = tgt.x + tgt.width / 2;
              const y2 = tgt.y;

              // Smooth Bézier curve path
              const pathD = `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`;

              const isHighlighted = selectedNodeId === edge.source || selectedNodeId === edge.target;

              return (
                <g key={edge.id || `${edge.source}-${edge.target}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHighlighted ? 'url(#edgeGradientActive)' : 'var(--np-border-strong)'}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeDasharray={edge.relationship ? '4 4' : 'none'}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />

                  {/* Optional Edge Relationship Label */}
                  {edge.relationship && (
                    <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                      <rect
                        x="-36"
                        y="-10"
                        width="72"
                        height="20"
                        rx="10"
                        fill="var(--np-surface)"
                        stroke="var(--np-border)"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="var(--np-text-muted)"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {edge.relationship}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* HTML Nodes Layer */}
          {layoutedNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const nodeStyle = getNodeStyle(node.type, isSelected);

            return (
              <motion.div
                key={node.id}
                className="mindmap-node"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  minHeight: node.height,
                  padding: node.type === 'root' ? '14px 18px' : '10px 14px',
                  borderRadius: node.type === 'root' ? 18 : 14,
                  background: nodeStyle.bg,
                  border: nodeStyle.border,
                  boxShadow: nodeStyle.shadow,
                  color: nodeStyle.color,
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  zIndex: isSelected ? 20 : 10,
                }}
              >
                {/* Node Type Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: nodeStyle.badgeColor,
                    }}
                  >
                    {node.type || 'Concept'}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: 'var(--np-blue)',
                        boxShadow: '0 0 8px var(--np-blue)',
                      }}
                    />
                  )}
                </div>

                {/* Node Label */}
                <span
                  style={{
                    fontSize: node.type === 'root' ? 16 : 13.5,
                    fontWeight: node.type === 'root' ? 750 : 650,
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  {node.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Node Details Panel */}
        <MindMapNodeDetails
          node={selectedNode}
          allNodes={nodes}
          edges={edges}
          onClose={() => onSelectNode(null)}
          onSelectNode={(id) => onSelectNode(id)}
          isCompact={isCompact}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Node Visual Styles Matrix
// ─────────────────────────────────────────────────────────────────────────────
function getNodeStyle(type?: string, isSelected?: boolean) {
  const t = type?.toLowerCase() || 'concept';

  if (isSelected) {
    return {
      bg: 'var(--np-surface)',
      border: '2px solid var(--np-blue)',
      shadow: '0 0 24px rgba(59, 130, 246, 0.4), var(--np-shadow-card)',
      color: 'var(--np-text-primary)',
      badgeColor: 'var(--np-blue)',
    };
  }

  switch (t) {
    case 'root':
      return {
        bg: 'linear-gradient(135deg, var(--np-surface), var(--np-surface-raised))',
        border: '2px solid rgba(59, 130, 246, 0.5)',
        shadow: '0 8px 30px rgba(59, 130, 246, 0.2), var(--np-shadow-card)',
        color: 'var(--np-text-primary)',
        badgeColor: 'var(--np-blue)',
      };
    case 'topic':
      return {
        bg: 'var(--np-surface)',
        border: '1.5px solid rgba(139, 92, 246, 0.35)',
        shadow: 'var(--np-shadow-card)',
        color: 'var(--np-text-primary)',
        badgeColor: 'var(--np-purple)',
      };
    case 'concept':
      return {
        bg: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        shadow: 'var(--np-shadow-card)',
        color: 'var(--np-text-primary)',
        badgeColor: 'var(--np-pink)',
      };
    default:
      return {
        bg: 'var(--np-bg-secondary)',
        border: '1px solid var(--np-border)',
        shadow: 'none',
        color: 'var(--np-text-secondary)',
        badgeColor: 'var(--np-text-muted)',
      };
  }
}
