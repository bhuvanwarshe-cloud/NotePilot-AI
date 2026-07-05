export function LoadingState() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(4)].map((_, index) => (
            <div key={index} style={{ height: 92, borderRadius: 16, background: 'var(--np-surface)', border: '1px solid var(--np-border)' }} />
          ))}
        </div>
        <div style={{ height: 560, borderRadius: 24, background: 'var(--np-surface)', border: '1px solid var(--np-border)' }} />
      </div>
    </div>
  );
}
