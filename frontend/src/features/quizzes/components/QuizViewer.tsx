import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ChevronRight, CheckCircle2, XCircle, Sparkles, Lightbulb } from 'lucide-react';
import type { QuizWithQuestions, QuizQuestion } from '../types';

interface QuizViewerProps {
  quiz: QuizWithQuestions;
  onComplete: (score: number, userAnswers: Record<string, string>) => void;
}

function getCorrectOptionId(q: QuizQuestion): string {
  const matchingById = q.options.find((o) => o.id === q.answer);
  if (matchingById) return matchingById.id;
  const matchingByText = q.options.find(
    (o) => o.text.trim().toLowerCase() === (q.answer || '').trim().toLowerCase()
  );
  if (matchingByText) return matchingByText.id;
  return q.answer;
}

export function QuizViewer({ quiz, onComplete }: QuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);

  const question = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const selectedOptionId = userAnswers[question.id];
  const isLocked = !!selectedOptionId;

  const correctOptionId = useMemo(() => getCorrectOptionId(question), [question]);
  const correctOption = useMemo(
    () => question.options.find((o) => o.id === correctOptionId),
    [question, correctOptionId]
  );
  const isUserCorrect = isLocked && selectedOptionId === correctOptionId;

  // Calculate progress percent: (answered questions / total) * 100
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (optionId: string) => {
    if (isLocked) return;

    const isCorrect = optionId === correctOptionId;
    setUserAnswers((prev) => ({ ...prev, [question.id]: optionId }));

    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    onComplete(score, userAnswers);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', maxWidth: 820, margin: '0 auto', width: '100%', paddingBottom: 40, boxSizing: 'border-box' }}>
      {/* Header & Progress Bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--np-text-primary)' }}>
              Question {currentIndex + 1}
            </span>
            <span style={{ fontSize: 14, color: 'var(--np-text-muted)' }}>
              of {totalQuestions}
            </span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--np-blue)' }}>
            {progressPercent}%
          </span>
        </div>

        <div style={{ width: '100%', height: 8, background: 'var(--np-bg-secondary)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--np-border)' }}>
          <motion.div
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--np-blue), var(--np-purple))', borderRadius: 999 }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div style={{ position: 'relative', flex: 1 }}>
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
              padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)',
              boxShadow: 'var(--np-shadow-card)',
            }}
          >
            {/* Question Text */}
            <h2 style={{ fontSize: 21, fontWeight: 700, color: 'var(--np-text-primary)', margin: '0 0 28px', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
              {question.question}
            </h2>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {question.options.map((option, idx) => {
                const letter = optionLetters[idx % 4];
                const isSelected = selectedOptionId === option.id;
                const isThisOptionCorrect = option.id === correctOptionId;

                let btnBg = 'var(--np-surface)';
                let btnBorder = '1px solid var(--np-border)';
                let btnColor = 'var(--np-text-primary)';
                let badgeBg = 'var(--np-bg-secondary)';
                let badgeColor = 'var(--np-text-secondary)';
                let icon = null;

                if (isLocked) {
                  if (isSelected && isThisOptionCorrect) {
                    // Selected & Correct -> GREEN
                    btnBg = 'rgba(16, 185, 129, 0.08)';
                    btnBorder = '2px solid #10B981';
                    badgeBg = '#10B981';
                    badgeColor = '#ffffff';
                    icon = <CheckCircle2 size={20} color="#10B981" />;
                  } else if (isSelected && !isThisOptionCorrect) {
                    // Selected & Incorrect -> RED
                    btnBg = 'rgba(239, 68, 68, 0.08)';
                    btnBorder = '2px solid #EF4444';
                    badgeBg = '#EF4444';
                    badgeColor = '#ffffff';
                    icon = <XCircle size={20} color="#EF4444" />;
                  } else if (!isSelected && isThisOptionCorrect) {
                    // Not selected, but is the correct answer -> GREEN OUTLINE REVEAL
                    btnBg = 'rgba(16, 185, 129, 0.05)';
                    btnBorder = '2px dashed #10B981';
                    badgeBg = 'rgba(16, 185, 129, 0.2)';
                    badgeColor = '#059669';
                    icon = <CheckCircle2 size={20} color="#10B981" />;
                  } else {
                    // Muted unselected option
                    btnBg = 'var(--np-surface)';
                    btnBorder = '1px solid var(--np-border)';
                    btnColor = 'var(--np-text-muted)';
                    badgeBg = 'var(--np-bg-secondary)';
                    badgeColor = 'var(--np-text-muted)';
                  }
                }

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    disabled={isLocked}
                    whileHover={!isLocked ? { scale: 1.01, translateY: -1 } : {}}
                    whileTap={!isLocked ? { scale: 0.99 } : {}}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 'clamp(12px, 3vw, 18px) clamp(12px, 3vw, 20px)',
                      borderRadius: 16,
                      background: btnBg,
                      border: btnBorder,
                      color: btnColor,
                      cursor: isLocked ? 'default' : 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                      width: '100%',
                      boxSizing: 'border-box',
                      minHeight: 52,
                    }}
                  >
                    {/* Option Badge A, B, C, D */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: badgeBg,
                        color: badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {letter}
                    </div>

                    {/* Option Text */}
                    <span
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: isSelected || (isLocked && isThisOptionCorrect) ? 600 : 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {option.text}
                    </span>

                    {/* Status Icon */}
                    {icon && <div style={{ flexShrink: 0 }}>{icon}</div>}
                  </motion.button>
                );
              })}
            </div>

            {/* KBC-Style Feedback & Explanation Panel */}
            <AnimatePresence>
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, y: 15, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ marginTop: 28, overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: 18,
                      background: isUserCorrect
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.03))'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.03))',
                      border: `1.5px solid ${isUserCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    {/* Header: Correct vs Incorrect */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {isUserCorrect ? (
                        <>
                          <CheckCircle2 size={22} color="#10B981" />
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>
                            Correct Answer!
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={22} color="#EF4444" />
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#DC2626' }}>
                            Incorrect Answer
                          </span>
                        </>
                      )}
                    </div>

                    {/* Subtext */}
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--np-text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
                      {isUserCorrect ? (
                        "Great job! You got this one right."
                      ) : (
                        <>
                          The correct answer is:{' '}
                          <strong style={{ color: '#059669' }}>
                            {correctOption?.text || question.answer}
                          </strong>
                        </>
                      )}
                    </p>

                    {/* Explanation section if present */}
                    {question.explanation && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: '14px 16px',
                          borderRadius: 12,
                          background: 'var(--np-surface)',
                          border: '1px solid var(--np-border)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <Lightbulb size={15} color="#F59E0B" />
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--np-text-muted)' }}>
                            Explanation
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--np-text-secondary)' }}>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Continue Button Section */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, flexWrap: 'wrap', gap: 8 }}>
                    {isLastQuestion ? (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '14px 32px',
                          borderRadius: 999,
                          border: 'none',
                          background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                          color: '#ffffff',
                          fontSize: 16,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = 'none';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        Submit Quiz <Sparkles size={18} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '14px 28px',
                          borderRadius: 999,
                          border: 'none',
                          background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                          color: '#ffffff',
                          fontSize: 15,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 6px 20px rgba(59, 130, 246, 0.25)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 24px rgba(59, 130, 246, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = 'none';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.25)';
                        }}
                      >
                        Next Question <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

