import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DesignSystem } from '@/styles/design-system';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border backdrop-blur-xl",
        className
      )}
      style={{
        backgroundColor: `${DesignSystem.colors.surface}80`, // 80 hex is 50% opacity
        borderColor: `${DesignSystem.colors.border}80`,
        borderRadius: DesignSystem.borderRadius.card,
        boxShadow: DesignSystem.shadows.md,
      }}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
