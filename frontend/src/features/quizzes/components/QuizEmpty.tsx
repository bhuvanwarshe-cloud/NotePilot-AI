import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export function QuizEmpty() {
  return (
    <div style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 520,
          width: '100%',
          borderRadius: 28,
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          padding: '48px 40px',
          boxShadow: 'var(--np-shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: 28,
          background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          boxShadow: '0 12px 28px rgba(59, 130, 246, 0.22)'
        }}>
          <HelpCircle size={34} color="#fff" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px', color: 'var(--np-text-primary)' }}>
          No Quiz Available
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--np-text-secondary)', margin: '0', maxWidth: 360 }}>
          This lecture does not have an active quiz generated yet. Upload a new lecture to generate quizzes automatically.
        </p>
      </motion.div>
    </div>
  );
}
