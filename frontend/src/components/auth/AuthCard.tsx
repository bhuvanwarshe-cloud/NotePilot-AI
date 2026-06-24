import * as React from 'react';
import { motion } from 'framer-motion';

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ width: '100%', position: 'relative' }}
    >
      {/* Subtle outer glow */}
      <div
        style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))',
          filter: 'blur(16px)',
          zIndex: 0,
        }}
      />

      {/* Card body */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          borderRadius: '24px',
          padding: '40px',
          background: 'var(--np-surface-overlay)',
          border: '1px solid var(--np-border)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
