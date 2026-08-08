import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import type { QuizWithQuestions } from '../types';

interface QuizViewerProps {
  quiz: QuizWithQuestions;
  onComplete: (score: number, userAnswers: Record<string, string>) => void;
}

export function QuizViewer({ quiz, onComplete }: QuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const question = quiz.questions[currentIndex];
  const progressPercent = ((currentIndex) / quiz.questions.length) * 100;
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent = !!answers[question.id];

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        score++;
      }
    });
    onComplete(score, answers);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 800, margin: '0 auto', width: '100%' }}>
      {/* Header & Progress */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--np-text-secondary)' }}>
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--np-blue)' }}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div style={{ width: '100%', height: 6, background: 'var(--np-bg-secondary)', borderRadius: 999, overflow: 'hidden' }}>
          <motion.div 
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--np-blue), var(--np-purple))', borderRadius: 999 }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div style={{ position: 'relative', flex: 1, minHeight: 400 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              background: 'var(--np-surface)',
              borderRadius: 24,
              border: '1px solid var(--np-border)',
              padding: '40px',
              boxShadow: 'var(--np-shadow-card)',
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--np-text-primary)', margin: '0 0 32px', lineHeight: 1.5 }}>
              {question.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {question.options.map(option => {
                const isSelected = answers[question.id] === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '20px 24px', borderRadius: 16,
                      border: isSelected ? '2px solid var(--np-blue)' : '2px solid var(--np-border)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'var(--np-surface)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: isSelected ? '7px solid var(--np-blue)' : '2px solid var(--np-border-strong)',
                      transition: 'all 0.15s ease', flexShrink: 0
                    }} />
                    <span style={{ 
                      fontSize: 16, 
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'var(--np-text-primary)' : 'var(--np-text-secondary)',
                      lineHeight: 1.5
                    }}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, padding: '0 12px' }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 999, border: '1px solid var(--np-border)',
            background: 'var(--np-surface)', color: 'var(--np-text-primary)',
            fontSize: 15, fontWeight: 600, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!hasAnsweredCurrent}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 999, border: 'none',
              background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
              color: '#fff', fontSize: 15, fontWeight: 700, 
              cursor: !hasAnsweredCurrent ? 'not-allowed' : 'pointer',
              opacity: !hasAnsweredCurrent ? 0.5 : 1,
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)'
            }}
          >
            Submit Quiz <CheckCircle2 size={18} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 999, border: 'none',
              background: 'var(--np-text-primary)', color: 'var(--np-surface)',
              fontSize: 15, fontWeight: 600, 
              cursor: !hasAnsweredCurrent ? 'not-allowed' : 'pointer',
              opacity: !hasAnsweredCurrent ? 0.5 : 1
            }}
          >
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
