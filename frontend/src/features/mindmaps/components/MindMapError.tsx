import { AlertCircle, RefreshCw } from 'lucide-react';

interface MindMapErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function MindMapError({ message = "Couldn't load this mind map.", onRetry }: MindMapErrorProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 380,
        height: '100%',
        width: '100%',
        padding: '40px 24px',
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 20,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <AlertCircle size={26} color="#EF4444" />
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--np-text-primary)', margin: '0 0 6px 0' }}>
        Couldn't load mind map
      </h3>
      <p style={{ fontSize: 13.5, color: 'var(--np-text-secondary)', maxWidth: 360, margin: '0 0 20px 0', lineHeight: 1.5 }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
            color: '#ffffff',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px var(--np-blue-glow)',
          }}
        >
          <RefreshCw size={15} />
          Retry
        </button>
      )}
    </div>
  );
}
