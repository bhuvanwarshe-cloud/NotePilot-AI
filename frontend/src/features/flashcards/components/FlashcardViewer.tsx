import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from './Flashcard';
import { FlashcardNavigation } from './FlashcardNavigation';
import { FlashcardProgress } from './FlashcardProgress';
import type { Flashcard as FlashcardType } from '@/features/flashcards/types';

interface FlashcardViewerProps {
  flashcards: FlashcardType[];
  currentIndex: number;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
  onJumpTo: (index: number) => void;
}

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

/**
 * FlashcardViewer — the central study area containing:
 * - Progress bar
 * - Animated (sliding) flashcard
 * - Navigation controls
 * - Dot indicators (up to 20 dots)
 */
export function FlashcardViewer({
  flashcards,
  currentIndex,
  isFlipped,
  onFlip,
  onNext,
  onPrev,
  onJumpTo,
}: FlashcardViewerProps) {
  const card = flashcards[currentIndex];
  const total = flashcards.length;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < total - 1;

  // We store direction as a ref-like value on the card key change
  // Simple: direction = +1 for next, -1 for prev
  // Use a custom key to drive the AnimatePresence slide direction
  const slideKey = `${currentIndex}`;

  if (!card) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        width: '100%',
        maxWidth: 780,
        margin: '0 auto',
      }}
    >
      {/* Progress */}
      <FlashcardProgress current={currentIndex + 1} total={total} />

      {/* Card with slide animation */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24 }}>
        <AnimatePresence mode="wait" initial={false} custom={1}>
          <motion.div
            key={slideKey}
            custom={1}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2 },
            }}
          >
            <Flashcard
              card={card}
              isFlipped={isFlipped}
              onFlip={onFlip}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard shortcuts hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {[
          { key: '←', label: 'Previous' },
          { key: 'Space', label: 'Flip' },
          { key: '→', label: 'Next' },
        ].map(({ key, label }) => (
          <span
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'var(--np-text-muted)',
              fontWeight: 500,
            }}
          >
            <kbd
              style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 5,
                background: 'var(--np-surface)',
                border: '1px solid var(--np-border-strong)',
                color: 'var(--np-text-secondary)',
                fontFamily: 'inherit',
              }}
            >
              {key}
            </kbd>
            {label}
          </span>
        ))}
      </div>

      {/* Navigation controls */}
      <FlashcardNavigation
        onPrev={onPrev}
        onNext={onNext}
        onFlip={onFlip}
        canPrev={canPrev}
        canNext={canNext}
        isFlipped={isFlipped}
      />

      {/* Dot indicators — show up to 20 */}
      {total <= 40 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            flexWrap: 'wrap',
            paddingTop: 4,
          }}
        >
          {flashcards.map((_, i) => (
            <button
              key={i}
              id={`flashcard-dot-${i}`}
              onClick={() => onJumpTo(i)}
              title={`Jump to card ${i + 1}`}
              style={{
                width: i === currentIndex ? 20 : 7,
                height: 7,
                borderRadius: 999,
                border: 'none',
                background:
                  i === currentIndex
                    ? 'linear-gradient(90deg, var(--np-blue), var(--np-purple))'
                    : 'var(--np-surface-raised)',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.25s ease, background 0.2s ease',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
