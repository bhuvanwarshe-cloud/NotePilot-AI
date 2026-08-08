import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import type { QuizWithQuestions } from '../types';

interface QuizResultsProps {
  quiz: QuizWithQuestions;
  score: number;
  userAnswers: Record<string, string>;
  onRetry: () => void;
}

export function QuizResults({ quiz, score, userAnswers, onRetry }: QuizResultsProps) {
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  
  let message = "Keep studying, you'll get it!";
  if (percentage >= 90) message = "Outstanding! Perfect understanding.";
  else if (percentage >= 70) message = "Great job! Solid grasp of the concepts.";
  else if (percentage >= 50) message = "Good effort! A little more review needed.";

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', paddingBottom: 60 }}>
      {/* Score Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--np-surface)',
          borderRadius: 24,
          border: '1px solid var(--np-border)',
          padding: '48px',
          boxShadow: 'var(--np-shadow-card)',
          textAlign: 'center',
          marginBottom: 40
        }}
      >
        <div style={{
          width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
          border: '4px solid var(--np-surface)',
          boxShadow: '0 0 0 2px var(--np-blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 800, color: 'var(--np-text-primary)'
        }}>
          {percentage}%
        </div>
        
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--np-text-primary)', margin: '0 0 8px' }}>
          {score} out of {total} correct
        </h2>
        
        <p style={{ fontSize: 16, color: 'var(--np-text-secondary)', margin: '0 0 32px' }}>
          {message}
        </p>

        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 32px', borderRadius: 999, border: 'none',
            background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
            color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)'
          }}
        >
          <RefreshCw size={18} /> Retry Quiz
        </button>
      </motion.div>

      {/* Question Review */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--np-text-primary)', margin: '0 0 8px', paddingLeft: 8 }}>
          Review Answers
        </h3>

        {quiz.questions.map((q, index) => {
          const userAnswerId = userAnswers[q.id];
          const isCorrect = userAnswerId === q.answer;
          const selectedOption = q.options.find(o => o.id === userAnswerId);
          const correctOption = q.options.find(o => o.id === q.answer);

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                background: 'var(--np-surface)', borderRadius: 20,
                border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                padding: '32px', overflow: 'hidden', position: 'relative'
              }}
            >
              {/* Top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: isCorrect ? '#10B981' : '#EF4444'
              }} />

              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ marginTop: 2 }}>
                  {isCorrect ? <CheckCircle2 size={24} color="#10B981" /> : <XCircle size={24} color="#EF4444" />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--np-text-primary)', margin: '0 0 24px', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--np-text-muted)', marginRight: 8 }}>{index + 1}.</span>
                    {q.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    <div style={{ 
                      display: 'flex', gap: 12, padding: '16px', borderRadius: 12,
                      background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? '#059669' : '#DC2626', textTransform: 'uppercase', flexShrink: 0, width: 80 }}>
                        Your Answer
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--np-text-primary)' }}>
                        {selectedOption?.text || 'No answer'}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div style={{ 
                        display: 'flex', gap: 12, padding: '16px', borderRadius: 12,
                        background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#059669', textTransform: 'uppercase', flexShrink: 0, width: 80 }}>
                          Correct
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--np-text-primary)' }}>
                          {correctOption?.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div style={{ 
                      padding: '16px 20px', borderRadius: 12, background: 'var(--np-bg-secondary)',
                      border: '1px solid var(--np-border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <ArrowRight size={14} color="var(--np-text-muted)" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--np-text-muted)', textTransform: 'uppercase' }}>Explanation</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--np-text-secondary)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
