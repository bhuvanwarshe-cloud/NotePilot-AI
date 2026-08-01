import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, BookOpen } from 'lucide-react';
import { useFlashcards } from '@/features/flashcards/hooks/useFlashcards';
import { FlashcardViewer } from '@/features/flashcards/components/FlashcardViewer';
import { FlashcardLoading } from '@/features/flashcards/components/FlashcardLoading';
import { FlashcardEmpty } from '@/features/flashcards/components/FlashcardEmpty';
import { FlashcardError } from '@/features/flashcards/components/FlashcardError';
import { DifficultyBadge } from '@/features/flashcards/components/DifficultyBadge';

/**
 * FlashcardsPage — /dashboard/flashcards
 *
 * Orchestrates data loading and delegates to sub-components.
 * Registers keyboard shortcuts: Space → flip, ←/→ → navigate.
 */
export function FlashcardsPage() {
  const {
    flashcards,
    loading,
    error,
    currentIndex,
    isFlipped,
    flip,
    goNext,
    goPrev,
    setCurrentIndex,
    setFlipped,
    retry,
  } = useFlashcards();

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore when focus is in an input/textarea
      const tag = (event.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (event.key) {
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          flip();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < flashcards.length - 1) goNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (currentIndex > 0) goPrev();
          break;
        default:
          break;
      }
    },
    [flip, goNext, goPrev, currentIndex, flashcards.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── States ───────────────────────────────────────────────────────────────
  if (loading) return <FlashcardLoading />;
  if (error) return <FlashcardError message={error} onRetry={retry} />;
  if (!flashcards.length) return <FlashcardEmpty />;

  const currentCard = flashcards[currentIndex];

  // Compute difficulty breakdown for the stats strip
  const easyCount = flashcards.filter((c) => c.difficulty === 1).length;
  const mediumCount = flashcards.filter((c) => c.difficulty === 2).length;
  const hardCount = flashcards.filter((c) => c.difficulty === 3).length;

  return (
    <div
      style={{
        padding: '28px 20px 48px',
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
      >
        {/* ── Page Header ────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--np-text-muted)',
                margin: 0,
              }}
            >
              Study Tools
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.2)',
                }}
              >
                <BrainCircuit size={18} color="#fff" />
              </div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--np-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Flashcards
              </h1>
            </div>
          </div>

          {/* Difficulty stats strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 14,
              background: 'var(--np-surface)',
              border: '1px solid var(--np-border)',
              boxShadow: 'var(--np-shadow-card)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--np-text-muted)',
                marginRight: 4,
              }}
            >
              <BookOpen
                size={13}
                style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }}
              />
              {flashcards.length} total
            </span>
            <div
              style={{
                width: 1,
                height: 14,
                background: 'var(--np-border-strong)',
              }}
            />
            {easyCount > 0 && (
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                {easyCount} Easy
              </span>
            )}
            {mediumCount > 0 && (
              <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                {mediumCount} Medium
              </span>
            )}
            {hardCount > 0 && (
              <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>
                {hardCount} Hard
              </span>
            )}
          </div>
        </div>

        {/* ── Difficulty badge for current card ─────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 2,
          }}
        >
          <DifficultyBadge difficulty={currentCard.difficulty} />
          {currentCard.generated_by && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--np-text-muted)',
                fontWeight: 500,
              }}
            >
              Generated by {currentCard.generated_by}
            </span>
          )}
        </div>

        {/* ── Viewer ────────────────────────────────────────────────── */}
        <FlashcardViewer
          flashcards={flashcards}
          currentIndex={currentIndex}
          isFlipped={isFlipped}
          onFlip={flip}
          onNext={goNext}
          onPrev={goPrev}
          onJumpTo={(i) => {
            setCurrentIndex(i);
            setFlipped(false);
          }}
        />
      </motion.div>
    </div>
  );
}
