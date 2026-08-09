import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Search, X } from 'lucide-react';
import type { MindMapNode } from '../types';

interface MindMapToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onReset: () => void;
  nodes: MindMapNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  isCompact?: boolean;
}

export function MindMapToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onReset,
  nodes,
  selectedNodeId,
  onSelectNode,
  isCompact = false,
}: MindMapToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter matching nodes based on searchQuery
  const filteredNodes = searchQuery.trim()
    ? nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (nodeId: string) => {
    onSelectNode(nodeId);
    setDropdownOpen(false);
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: isCompact ? '8px 12px' : '10px 16px',
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 14,
        boxShadow: 'var(--np-shadow-card)',
        width: '100%',
        boxSizing: 'border-box',
        flexWrap: 'wrap',
      }}
    >
      {/* ── Search Input with Dropdown Suggestions ── */}
      <div ref={dropdownRef} style={{ position: 'relative', flex: '1 1 200px', minWidth: 160, maxWidth: isCompact ? '100%' : 320 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'var(--np-bg-secondary)',
            border: '1px solid var(--np-border)',
            borderRadius: 10,
          }}
        >
          <Search size={15} color="var(--np-text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setDropdownOpen(true);
            }}
            placeholder="Search concepts in graph..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13,
              color: 'var(--np-text-primary)',
              fontFamily: 'inherit',
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDropdownOpen(false);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 2,
                cursor: 'pointer',
                color: 'var(--np-text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {dropdownOpen && filteredNodes.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              maxHeight: 220,
              overflowY: 'auto',
              background: 'var(--np-surface)',
              border: '1px solid var(--np-border)',
              borderRadius: 12,
              boxShadow: 'var(--np-shadow-elevated)',
              zIndex: 50,
              padding: 4,
            }}
          >
            {filteredNodes.map((n) => (
              <button
                key={n.id}
                onClick={() => handleSelect(n.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: selectedNodeId === n.id ? 'var(--np-blue-subtle)' : 'transparent',
                  color: 'var(--np-text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--np-surface-raised)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = selectedNodeId === n.id ? 'var(--np-blue-subtle)' : 'transparent')
                }
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</span>
                {n.type && (
                  <span style={{ fontSize: 10, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {n.type}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Zoom Controls & Fit ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset View"
          aria-label="Reset View"
          style={{
            height: 36,
            padding: '0 10px',
            borderRadius: 9,
            border: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            color: 'var(--np-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          <RotateCcw size={14} />
          {!isCompact && 'Reset'}
        </button>

        {/* Fit to screen */}
        <button
          onClick={onFitToScreen}
          title="Fit to Screen"
          aria-label="Fit to Screen"
          style={{
            height: 36,
            padding: '0 12px',
            borderRadius: 9,
            border: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            color: 'var(--np-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          <Maximize2 size={14} />
          Fit
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--np-border)', margin: '0 2px' }} />

        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            border: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            color: 'var(--np-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ZoomOut size={16} />
        </button>

        {/* Zoom Level Indicator */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--np-text-primary)',
            minWidth: 42,
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          {zoomPercent}%
        </span>

        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            border: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            color: 'var(--np-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ZoomIn size={16} />
        </button>
      </div>
    </div>
  );
}
