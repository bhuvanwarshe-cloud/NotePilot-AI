import { Mic, Video, FileText, PlaySquare, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const FORMATS = [
  { Icon: Mic, label: 'Audio' },
  { Icon: Video, label: 'Video' },
  { Icon: FileText, label: 'PDF' },
  { Icon: PlaySquare, label: 'YouTube' },
  { Icon: BookOpen, label: 'Textbook' },
];

export function UploadHero() {
  return (
    <div style={{ marginBottom: 40 }}>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--np-text-primary)',
          margin: '0 0 12px 0',
        }}
      >
        Upload Lecture
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          fontSize: 16,
          color: 'var(--np-text-secondary)',
          lineHeight: 1.5,
          margin: '0 0 24px 0',
          maxWidth: 600,
        }}
      >
        Transform any lecture into smart notes, flashcards, quizzes and mind maps.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {FORMATS.map(({ Icon, label }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--np-text-muted)',
              background: 'var(--np-surface)',
              border: '1px solid var(--np-border)',
              padding: '6px 12px',
              borderRadius: 20,
              boxShadow: 'var(--np-shadow-sm)',
            }}
          >
            <Icon size={14} />
            {label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
