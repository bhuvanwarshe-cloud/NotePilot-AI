/* ─────────────────────────────────────────────────────────────
   Dashboard Design Tokens
   Single source of truth for all spacing, card styles, and
   typography inside the Dashboard. Maps to --np-* CSS vars.
   ───────────────────────────────────────────────────────────── */

// Card — every card in the dashboard shares these exact values
export const card = {
  base: [
    'rounded-2xl',
    'border',
    'overflow-hidden',
  ].join(' '),
  // Applied via inline style so CSS vars resolve correctly
  style: {
    background: 'var(--np-surface)',
    borderColor: 'var(--np-border)',
    boxShadow: 'var(--np-shadow-card)',
  } as React.CSSProperties,
  padding: 'p-6',
  hoverTransition: 'transition-shadow duration-200 hover:shadow-lg',
};

// Section spacing — every section in the main content area
export const section = {
  gap: 'gap-6',
  titleSize: 'text-xl font-semibold',
  titleStyle: { color: 'var(--np-text-primary)' } as React.CSSProperties,
  descSize: 'text-sm',
  descStyle: { color: 'var(--np-text-muted)' } as React.CSSProperties,
};

// Grid — main content container
export const grid = {
  maxWidth: 'max-w-[1600px]',
  padding: 'p-8',
  gap: 'gap-8',
};

// Icon sizes (px) — standardized across the entire dashboard
export const iconSize = {
  nav: 20,        // Sidebar nav icons
  section: 20,    // Section header icons
  card: 18,       // Inside cards
  status: 16,     // Status indicators, tags
  xs: 14,         // Very small labels
} as const;

// Typography scale
export const type = {
  pageHeading: 'text-4xl font-bold tracking-tight',
  sectionHeading: 'text-xl font-semibold',
  cardHeading: 'text-base font-semibold',
  body: 'text-sm leading-relaxed',
  caption: 'text-xs',
} as const;

// We need React for CSSProperties type
import type React from 'react';
