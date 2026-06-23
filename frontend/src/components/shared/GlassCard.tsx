import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * GlassCard — fully theme-aware using CSS variable tokens.
 * Reads --np-* vars so it adapts to dark/light mode automatically.
 */
export function GlassCard({ children, className, style, ...props }: GlassCardProps) {
  return (
    <div
      className={cn('relative overflow-hidden backdrop-blur-xl', className)}
      style={{
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: '1rem',
        boxShadow: 'var(--np-shadow-card)',
        ...style,
      }}
      {...props}
    >
      {/* Subtle inner highlight — adapts per theme */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{ background: 'linear-gradient(135deg, var(--np-blue-subtle) 0%, transparent 60%)' }}
      />
      {children}
    </div>
  );
}
