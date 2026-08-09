import { Network, Sparkles } from 'lucide-react';

export function MindMapEmpty() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        height: '100%',
        width: '100%',
        padding: '48px 24px',
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 20,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'rgba(236, 72, 153, 0.08)',
          border: '1px solid rgba(236, 72, 153, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <Network size={28} color="#EC4899" />
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--np-text-primary)', margin: '0 0 8px 0' }}>
        Mind Map Not Available Yet
      </h3>

      <p style={{ fontSize: 14, color: 'var(--np-text-secondary)', maxWidth: 420, margin: '0 0 16px 0', lineHeight: 1.5 }}>
        This lecture doesn't have a generated mind map yet. AI generates mind maps automatically when processing new lecture content.
      </p>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 999,
          background: 'var(--np-bg-secondary)',
          border: '1px solid var(--np-border)',
          fontSize: 12,
          color: 'var(--np-text-muted)',
        }}
      >
        <Sparkles size={13} color="var(--np-purple)" />
        Select another lecture from the library to view its mind map
      </div>
    </div>
  );
}
