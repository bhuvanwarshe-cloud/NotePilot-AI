import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface QuizErrorProps {
  message: string;
  onRetry: () => void;
}

export function QuizError({ message, onRetry }: QuizErrorProps) {
  return (
    <div style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 520, width: '100%', borderRadius: 28, background: 'var(--np-surface)',
          border: '1px solid var(--np-border)', padding: '48px 40px',
          boxShadow: 'var(--np-shadow-card)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center'
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: 28, background: '#FEE2E2',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
        }}>
          <AlertCircle size={34} color="#EF4444" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px', color: 'var(--np-text-primary)' }}>
          Couldn't load quiz
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--np-text-secondary)', margin: '0 0 36px', maxWidth: 360 }}>
          {message}
        </p>
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '13px 28px', border: 'none', borderRadius: 999, background: 'var(--np-text-primary)',
            color: 'var(--np-surface)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            transition: 'opacity 0.2s ease', width: '100%', maxWidth: 240
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          <RefreshCw size={17} /> Try Again
        </button>
      </motion.div>
    </div>
  );
}
