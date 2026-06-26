import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  rightElement?: ReactNode;
  className?: string;
}

export function DashboardHeader({ title, subtitle, rightElement, className }: DashboardHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8', className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--np-text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-sm" style={{ color: 'var(--np-text-secondary)' }}>{subtitle}</p>}
      </div>
      {rightElement && (
        <div className="flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
}
