import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlashcardErrorProps {
  message: string;
  onRetry: () => void;
}

/**
 * FlashcardError — error state with retry action.
 */
export function FlashcardError({ message, onRetry }: FlashcardErrorProps) {
  return (
    <div
      style={{
        padding: '40px 24px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          maxWidth: 520,
          width: '100%',
          borderRadius: 24,
          background: 'var(--np-surface)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '36px 32px',
          boxShadow: 'var(--np-shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
        }}
      >
        {/* Error icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={26} color="var(--np-error)" />
        </div>

        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: '0 0 8px',
              color: 'var(--np-text-primary)',
            }}
          >
            Unable to load flashcards
          </h2>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--np-text-secondary)',
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>

        <button
          id="flashcard-error-retry-btn"
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'none';
          }}
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
