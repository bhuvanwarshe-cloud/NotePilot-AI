import { motion } from 'framer-motion';
import { Network } from 'lucide-react';

export function MindMapLoading() {
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
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))',
          border: '1px solid rgba(236,72,153,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Network size={28} color="#EC4899" />
      </motion.div>

      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--np-text-primary)', margin: '0 0 6px 0' }}>
        Building Mind Map...
      </p>
      <p style={{ fontSize: 13, color: 'var(--np-text-muted)', margin: 0, textAlign: 'center' }}>
        Structuring knowledge concepts & connections
      </p>
    </div>
  );
}
