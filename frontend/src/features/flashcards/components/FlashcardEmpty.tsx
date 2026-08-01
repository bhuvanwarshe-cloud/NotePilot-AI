import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, ArrowRight, UploadCloud } from 'lucide-react';

/**
 * FlashcardEmpty — shown when there are no flashcards for this user.
 */
export function FlashcardEmpty() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: '40px 24px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
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
        {/* Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 28,
            background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 12px 28px rgba(59, 130, 246, 0.22)',
          }}
        >
          <BrainCircuit size={34} color="#fff" />
        </div>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            margin: '0 0 12px',
            color: 'var(--np-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          No Flashcards Yet
        </h2>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--np-text-secondary)',
            margin: '0 0 36px',
            maxWidth: 360,
          }}
        >
          Upload a lecture and NotePilot AI will automatically generate
          flashcards from the key concepts.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          <button
            id="flashcard-empty-upload-btn"
            onClick={() => navigate('/dashboard/upload')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '13px 28px',
              border: 'none',
              borderRadius: 999,
              background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.22)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 10px 28px rgba(59, 130, 246, 0.32)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'none';
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 6px 20px rgba(59, 130, 246, 0.22)';
            }}
          >
            <UploadCloud size={17} />
            Upload a Lecture
          </button>

          <button
            id="flashcard-empty-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px 28px',
              border: '1px solid var(--np-border)',
              borderRadius: 999,
              background: 'var(--np-surface)',
              color: 'var(--np-text-secondary)',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--np-surface-raised)';
              (e.currentTarget as HTMLElement).style.color = 'var(--np-text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--np-surface)';
              (e.currentTarget as HTMLElement).style.color = 'var(--np-text-secondary)';
            }}
          >
            Back to Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
