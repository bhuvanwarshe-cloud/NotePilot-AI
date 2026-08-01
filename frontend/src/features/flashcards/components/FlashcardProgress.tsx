interface FlashcardProgressProps {
  current: number; // 1-based
  total: number;
}

/**
 * FlashcardProgress — thin bar + counter showing study progress.
 */
export function FlashcardProgress({ current, total }: FlashcardProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Counter row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--np-text-secondary)',
          }}
        >
          Card{' '}
          <span style={{ color: 'var(--np-text-primary)', fontWeight: 700 }}>
            {current}
          </span>{' '}
          of{' '}
          <span style={{ color: 'var(--np-text-primary)', fontWeight: 700 }}>
            {total}
          </span>
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--np-text-muted)',
          }}
        >
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress track */}
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: 'var(--np-surface-raised)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            borderRadius: 999,
            background: 'linear-gradient(90deg, var(--np-blue), var(--np-purple))',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}
