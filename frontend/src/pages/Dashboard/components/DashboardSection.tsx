import type { ReactNode } from 'react';
import { section } from '../dashboard';
import { cn } from '@/lib/utils';

interface DashboardSectionProps {
  title?: string;
  description?: string;
  /** Slot for right-side actions (e.g. "View All" link) */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * DashboardSection — wraps a titled content area.
 * Consistent title size, color, spacing, and optional action slot.
 */
export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5 min-w-0">
            {title && (
              <h2
                className={section.titleSize}
                style={section.titleStyle}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className={section.descSize} style={section.descStyle}>
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="shrink-0 pt-0.5">{action}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
