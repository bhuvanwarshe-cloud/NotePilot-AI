import type { ReactNode } from 'react';
import { DashboardCard } from './DashboardCard';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  /** Optional badge element (e.g. "Upgrade" button) */
  badge?: ReactNode;
  className?: string;
}

/**
 * StatCard — one of four cards in the Quick Stats row.
 * Shows a metric with an icon. Never shows fake data.
 */
export function StatCard({ label, value, icon, badge, className }: StatCardProps) {
  return (
    <DashboardCard className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--np-blue-subtle)' }}
        >
          <span style={{ color: 'var(--np-blue)' }}>{icon}</span>
        </div>
        {badge && <div>{badge}</div>}
      </div>

      <div>
        <p
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--np-text-primary)' }}
        >
          {value}
        </p>
        <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--np-text-muted)' }}>
          {label}
        </p>
      </div>
    </DashboardCard>
  );
}
