import { motion } from 'framer-motion';
import type { SourceConfigItem } from '../types';

interface SourceCardProps {
  source: SourceConfigItem;
  onClick: () => void;
}

export function SourceCard({ source, onClick }: SourceCardProps) {
  const { icon: Icon, title, description } = source;
  return (
    <motion.button
      whileHover={{ y: -4, boxShadow: 'var(--np-shadow-elevated)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 24,
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        boxShadow: 'var(--np-shadow-card)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--np-blue)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--np-border)';
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--np-blue-subtle)',
          color: 'var(--np-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={24} />
      </div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: 'var(--np-text-primary)' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--np-text-secondary)', lineHeight: 1.5 }}>
        {description}
      </p>
    </motion.button>
  );
}
