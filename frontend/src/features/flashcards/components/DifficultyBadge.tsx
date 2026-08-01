import type { DifficultyLevel } from '@/features/flashcards/types';
import { getDifficultyLabel } from '@/features/flashcards/types';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
}

const DIFFICULTY_STYLES: Record<
  DifficultyLevel,
  { bg: string; color: string; border: string; dot: string }
> = {
  1: {
    bg: 'rgba(16, 185, 129, 0.1)',
    color: '#10B981',
    border: 'rgba(16, 185, 129, 0.25)',
    dot: '#10B981',
  },
  2: {
    bg: 'rgba(245, 158, 11, 0.1)',
    color: '#F59E0B',
    border: 'rgba(245, 158, 11, 0.25)',
    dot: '#F59E0B',
  },
  3: {
    bg: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
    border: 'rgba(239, 68, 68, 0.25)',
    dot: '#EF4444',
  },
};

/**
 * DifficultyBadge — pill showing Easy / Medium / Hard with color-coded styling.
 */
export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const styles = DIFFICULTY_STYLES[difficulty];
  const label = getDifficultyLabel(difficulty);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: styles.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
