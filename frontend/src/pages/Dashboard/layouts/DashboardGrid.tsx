import type { ReactNode } from 'react';

/**
 * DashboardGrid
 * Outer wrapper for the dashboard page content.
 * Responsive padding via .np-dashboard-grid class (defined in index.css).
 */
export function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="np-dashboard-grid">
      {children}
    </div>
  );
}

/**
 * DashboardMainGrid
 * Responsive 12-col → 2-col → 1-col grid.
 * Column spans on children use .np-col-8 / .np-col-4 classes.
 */
export function DashboardMainGrid({ children }: { children: ReactNode }) {
  return (
    <div className="np-main-grid">
      {children}
    </div>
  );
}

/**
 * DashboardCol
 * A grid column child.  colSpan drives the className for desktop;
 * on mobile all columns become full-width via CSS.
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
    <div className={`np-col-${colSpan} ${className}`.trim()}>
      {children}
    </div>
  );
}

