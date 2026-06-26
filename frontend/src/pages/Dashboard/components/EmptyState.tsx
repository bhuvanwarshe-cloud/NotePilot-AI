import type { ReactNode } from 'react';
import { DashboardCard } from './DashboardCard';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** SVG or icon node rendered above the title */
  illustration?: ReactNode;
  title: string;
  description?: string;
  /** List of benefit strings rendered with ✓ checkmarks */
  benefits?: string[];
  /** CTA button or link */
  action?: ReactNode;
  className?: string;
  /** Make the card dashed-border style */
  dashed?: boolean;
}

/**
 * EmptyState — onboarding-style empty state.
 * Feels intentional, not blank. Guides the user toward their next action.
 */
export function EmptyState({
  illustration,
  title,
  description,
  benefits,
  action,
  className,
  dashed,
}: EmptyStateProps) {
  return (
    <DashboardCard
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-8',
        dashed && 'border-dashed',
        className
      )}
      style={
        dashed
          ? {
              background: 'transparent',
              borderColor: 'var(--np-border-strong)',
              boxShadow: 'none',
            }
          : undefined
      }
    >
      {illustration && (
        <div className="mb-6 flex items-center justify-center">
          {illustration}
        </div>
      )}

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--np-text-primary)' }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="text-sm max-w-xs mx-auto leading-relaxed"
          style={{ color: 'var(--np-text-secondary)' }}
        >
          {description}
        </p>
      )}

      {benefits && benefits.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2 text-left">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--np-text-secondary)' }}>
              <span className="text-green-500 font-bold shrink-0">✓</span>
              {b}
            </li>
          ))}
        </ul>
      )}

      {action && <div className="mt-8">{action}</div>}
    </DashboardCard>
  );
}
