import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface FlashcardNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  onFlip: () => void;
  canPrev: boolean;
  canNext: boolean;
  isFlipped: boolean;
}

/**
 * FlashcardNavigation — Previous / Flip / Next controls.
 * Keyboard shortcuts are handled at the page level via useEffect.
 */
export function FlashcardNavigation({
  onPrev,
  onNext,
  onFlip,
  canPrev,
  canNext,
  isFlipped,
}: FlashcardNavigationProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      {/* Previous */}
      <NavButton
        id="flashcard-prev-btn"
        onClick={onPrev}
        disabled={!canPrev}
        title="Previous card (←)"
      >
        <ChevronLeft size={20} />
      </NavButton>

      {/* Flip */}
      <button
        id="flashcard-flip-btn"
        onClick={onFlip}
        title="Flip card (Space)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 24px',
          borderRadius: 999,
          border: 'none',
          background: isFlipped
            ? 'linear-gradient(135deg, var(--np-purple), var(--np-blue))'
            : 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 8px 24px rgba(59, 130, 246, 0.35)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 4px 16px rgba(59, 130, 246, 0.25)';
        }}
      >
        <RotateCcw size={15} />
        {isFlipped ? 'Show Front' : 'Flip Card'}
      </button>

      {/* Next */}
      <NavButton
        id="flashcard-next-btn"
        onClick={onNext}
        disabled={!canNext}
        title="Next card (→)"
      >
        <ChevronRight size={20} />
      </NavButton>
    </div>
  );
}

// ─── Internal button ──────────────────────────────────────────────────────────
function NavButton({
  id,
  children,
  onClick,
  disabled,
  title,
}: {
  id: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: '1px solid var(--np-border)',
        background: 'var(--np-surface)',
        color: disabled ? 'var(--np-text-muted)' : 'var(--np-text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background =
            'var(--np-surface-raised)';
          (e.currentTarget as HTMLElement).style.borderColor =
            'var(--np-border-strong)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--np-surface)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--np-border)';
      }}
    >
      {children}
    </button>
  );
}

import type React from 'react';
