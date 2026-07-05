import { RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 560, width: '100%', borderRadius: 24, background: 'var(--np-surface)', border: '1px solid var(--np-border)', padding: 28, boxShadow: 'var(--np-shadow-card)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--np-text-primary)' }}>Unable to load your study workspace</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--np-text-secondary)', margin: '0 0 16px' }}>{message}</p>
        <button onClick={onRetry} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    </div>
  );
}
