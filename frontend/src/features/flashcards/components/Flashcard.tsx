import { motion } from 'framer-motion';
import type { Flashcard } from '@/features/flashcards/types';
import { DifficultyBadge } from './DifficultyBadge';

interface FlashcardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}

/**
 * Flashcard — the single flippable card with 3D perspective transform.
 * Click anywhere on the card to flip. The front shows the question;
 * the back shows the answer.
 */
export function Flashcard({ card, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div
      onClick={onFlip}
      id="flashcard-card"
      title="Click to flip (Space)"
      style={{
        width: '100%',
        maxWidth: 680,
        margin: '0 auto',
        cursor: 'pointer',
        perspective: 1200,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <motion.div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 340,
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.55,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {/* ── FRONT ──────────────────────────────────────────────────── */}
        <CardFace side="front" active={!isFlipped}>
          <CardSideLabel />
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 8px',
            }}
          >
            <p
              style={{
                fontSize: card.front.length > 120 ? 18 : 22,
                fontWeight: 700,
                color: 'var(--np-text-primary)',
                lineHeight: 1.5,
                textAlign: 'center',
                margin: 0,
              }}
            >
              {card.front}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <DifficultyBadge difficulty={card.difficulty} />
            <FlipHint />
          </div>
        </CardFace>

        {/* ── BACK ───────────────────────────────────────────────────── */}
        <CardFace side="back" active={isFlipped}>
          <CardSideLabel variant="answer" />
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 8px',
            }}
          >
            <p
              style={{
                fontSize: card.back.length > 180 ? 16 : 20,
                fontWeight: 500,
                color: 'var(--np-text-primary)',
                lineHeight: 1.65,
                textAlign: 'center',
                margin: 0,
              }}
            >
              {card.back}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <DifficultyBadge difficulty={card.difficulty} />
            <span
              style={{
                fontSize: 11,
                color: 'var(--np-text-muted)',
                fontWeight: 500,
              }}
            >
              Click to see question
            </span>
          </div>
        </CardFace>
      </motion.div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardFace({
  side,
  active,
  children,
}: {
  side: 'front' | 'back';
  active: boolean;
  children: React.ReactNode;
}) {
  const isBack = side === 'back';

  return (
    <div
      style={{
        position: isBack ? 'absolute' : 'relative',
        inset: isBack ? 0 : undefined,
        width: '100%',
        minHeight: 340,
        padding: 36,
        borderRadius: 24,
        background: 'var(--np-surface)',
        border: `1px solid ${active ? 'rgba(59,130,246,0.22)' : 'var(--np-border)'}`,
        boxShadow: active
          ? '0 8px 32px rgba(59, 130, 246, 0.12), var(--np-shadow-card)'
          : 'var(--np-shadow-card)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isBack ? 'rotateY(180deg)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        // Accent strip at top
        backgroundImage: isBack
          ? 'linear-gradient(to bottom, rgba(139,92,246,0.04) 0%, transparent 80px)'
          : 'linear-gradient(to bottom, rgba(59,130,246,0.04) 0%, transparent 80px)',
      }}
    >
      {children}
    </div>
  );
}

function CardSideLabel({
  variant = 'question',
}: {
  variant?: 'question' | 'answer';
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color:
            variant === 'answer' ? 'var(--np-purple)' : 'var(--np-blue)',
          padding: '4px 10px',
          borderRadius: 999,
          background:
            variant === 'answer'
              ? 'var(--np-purple-subtle)'
              : 'var(--np-blue-subtle)',
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background:
              variant === 'answer' ? 'var(--np-purple)' : 'var(--np-blue)',
            flexShrink: 0,
          }}
        />
        {variant === 'answer' ? 'Answer' : 'Question'}
      </span>
    </div>
  );
}

function FlipHint() {
  return (
    <span
      style={{
        fontSize: 11,
        color: 'var(--np-text-muted)',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <KbdKey>Space</KbdKey> to flip
    </span>
  );
}

function KbdKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 4,
        background: 'var(--np-surface-raised)',
        border: '1px solid var(--np-border-strong)',
        color: 'var(--np-text-secondary)',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </kbd>
  );
}

import type React from 'react';
