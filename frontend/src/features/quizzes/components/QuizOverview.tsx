import { motion } from 'framer-motion';
import { PlayCircle, Clock, ListChecks } from 'lucide-react';
import type { QuizWithQuestions } from '../types';

interface QuizOverviewProps {
  quiz: QuizWithQuestions;
  onStart: () => void;
}

export function QuizOverview({ quiz, onStart }: QuizOverviewProps) {
  const estimatedTime = Math.ceil(quiz.questions.length * 1.5); // Rough estimate of 1.5 mins per question

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '48px 40px',
        borderRadius: 24,
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        boxShadow: 'var(--np-shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 24,
        background: 'linear-gradient(135deg, var(--np-purple), var(--np-blue))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)'
      }}>
        <ListChecks size={32} color="#fff" />
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--np-text-primary)', margin: '0 0 12px' }}>
        {quiz.title || 'Knowledge Check'}
      </h1>
      
      <p style={{ fontSize: 16, color: 'var(--np-text-secondary)', margin: '0 0 32px', maxWidth: 400, lineHeight: 1.6 }}>
        Test your understanding of the key concepts covered in this lecture.
      </p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--np-text-primary)' }}>{quiz.questions.length}</span>
        </div>
        <div style={{ width: 1, background: 'var(--np-border)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Time</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--np-text-primary)', fontWeight: 700, fontSize: 20 }}>
            <Clock size={20} color="var(--np-text-muted)" /> ~{estimatedTime} min
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '16px 36px', border: 'none', borderRadius: 999,
          background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
          color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          width: '100%', maxWidth: 300
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px rgba(59, 130, 246, 0.35)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'none';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.25)';
        }}
      >
        <PlayCircle size={20} />
        Start Quiz
      </button>
    </motion.div>
  );
}
