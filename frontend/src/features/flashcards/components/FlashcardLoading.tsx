/**
 * FlashcardLoading — skeleton loading state matching the flashcard viewer shape.
 */
export function FlashcardLoading() {
  return (
    <div
      style={{
        padding: '32px 20px 40px',
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            height: 14,
            width: 120,
            borderRadius: 7,
            background: 'var(--np-surface-raised)',
            animation: 'pulse 1.8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 28,
            width: 260,
            borderRadius: 7,
            background: 'var(--np-surface-raised)',
            animation: 'pulse 1.8s ease-in-out infinite',
            animationDelay: '0.1s',
          }}
        />
      </div>

      {/* Progress bar skeleton */}
      <div style={{ maxWidth: 780, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ height: 12, width: 80, borderRadius: 6, background: 'var(--np-surface-raised)', animation: 'pulse 1.8s ease-in-out infinite' }} />
          <div style={{ height: 12, width: 30, borderRadius: 6, background: 'var(--np-surface-raised)', animation: 'pulse 1.8s ease-in-out infinite' }} />
        </div>
        <div style={{ height: 4, borderRadius: 999, background: 'var(--np-surface-raised)', animation: 'pulse 1.8s ease-in-out infinite' }} />
      </div>

      {/* Card skeleton */}
      <div
        style={{
          maxWidth: 680,
          margin: '0 auto',
          width: '100%',
          height: 340,
          borderRadius: 24,
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          boxShadow: 'var(--np-shadow-card)',
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animation: 'pulse 1.8s ease-in-out infinite',
          animationDelay: '0.15s',
        }}
      >
        <div style={{ height: 12, width: 80, borderRadius: 6, background: 'var(--np-surface-raised)' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ height: 20, width: '70%', borderRadius: 8, background: 'var(--np-surface-raised)' }} />
          <div style={{ height: 20, width: '50%', borderRadius: 8, background: 'var(--np-surface-raised)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ height: 22, width: 60, borderRadius: 999, background: 'var(--np-surface-raised)' }} />
          <div style={{ height: 14, width: 80, borderRadius: 6, background: 'var(--np-surface-raised)' }} />
        </div>
      </div>

      {/* Navigation skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--np-surface)', border: '1px solid var(--np-border)', animation: 'pulse 1.8s ease-in-out infinite' }} />
        <div style={{ width: 140, height: 44, borderRadius: 999, background: 'var(--np-surface-raised)', animation: 'pulse 1.8s ease-in-out infinite', animationDelay: '0.1s' }} />
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--np-surface)', border: '1px solid var(--np-border)', animation: 'pulse 1.8s ease-in-out infinite' }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
