import type { ReactNode, CSSProperties } from 'react';
import { card } from '../dashboard';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** If true, adds hover elevation and cursor pointer */
  interactive?: boolean;
  /** Remove inner padding (e.g. for cards with full-bleed content) */
  noPadding?: boolean;
  onClick?: () => void;
}

/**
 * DashboardCard — the single card primitive for the entire dashboard.
 * All cards share identical border-radius, border color, background,
 * shadow, and padding. Never deviate from this.
 */
export function DashboardCard({
  children,
  className,
  style,
  interactive,
  noPadding,
  onClick,
}: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        card.base,
        !noPadding && card.padding,
        interactive && 'cursor-pointer ' + card.hoverTransition,
        className
      )}
      style={{ ...card.style, ...style }}
    >
      {children}
    </div>
  );
}
