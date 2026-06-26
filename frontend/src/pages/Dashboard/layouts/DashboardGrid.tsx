import type { ReactNode } from 'react';

/**
 * DashboardGrid
 * The outermost content wrapper.
 * max-width: 1600px, centered, padding: 32px on all sides.
 * All children are stacked in a column with 32px gap.
 */
export function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 1600,
        margin: '0 auto',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {children}
    </div>
  );
}

/**
 * DashboardMainGrid
 * A strict 12-column CSS grid for the main content area.
 * Use col-span utilities on children.
 */
export function DashboardMainGrid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 24,
        alignItems: 'start',
      }}
    >
      {children}
    </div>
  );
}

/**
 * DashboardCol
 * A grid column child. Specify colSpan for desktop, colSpanMd for tablet.
 * Falls back to full-width on mobile.
 */
export function DashboardCol({
  children,
  colSpan,
  className = '',
}: {
  children: ReactNode;
  colSpan: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ gridColumn: `span ${colSpan}` }}
    >
      {children}
    </div>
  );
}
