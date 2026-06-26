import { Library, Upload, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Lecture {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'youtube' | 'text';
  date: string;
}

interface RecentLecturesProps {
  lectures: Lecture[];
}

const BENEFITS = [
  'Transcript in seconds',
  'Smart Notes you can edit',
  'Flashcards ready to review',
  'Mind Map of key concepts',
  'Quiz to test yourself',
];

export function RecentLectures({ lectures }: RecentLecturesProps) {
  const isEmpty = lectures.length === 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--np-text-primary)',
            margin: 0,
          }}
        >
          Recent Lectures
        </h2>
        {!isEmpty && (
          <button
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--np-blue)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 2px',
              fontFamily: 'inherit',
            }}
          >
            View all
          </button>
        )}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div
          style={{
            background: 'var(--np-surface)',
            border: '2px dashed var(--np-border-strong)',
            borderRadius: 18,
            padding: '56px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 0,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'var(--np-blue-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Library size={28} color="var(--np-blue)" />
          </div>

          <h3
            style={{
              fontSize: 18,
              fontWeight: 650,
              color: 'var(--np-text-primary)',
              margin: '0 0 8px',
              letterSpacing: '-0.01em',
            }}
          >
            No lectures uploaded yet
          </h3>
          <p
            style={{
              fontSize: 14,
              color: 'var(--np-text-secondary)',
              lineHeight: 1.6,
              maxWidth: 360,
              margin: '0 0 24px',
            }}
          >
            Upload your first lecture and NotePilot will instantly create:
          </p>

          {/* Benefits */}
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              textAlign: 'left',
            }}
          >
            {BENEFITS.map((b) => (
              <li
                key={b}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  fontSize: 13.5,
                  color: 'var(--np-text-secondary)',
                }}
              >
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                {b}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 11,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
              boxShadow: '0 4px 18px var(--np-blue-glow)',
              fontFamily: 'inherit',
            }}
          >
            <Upload size={14} />
            + Upload Lecture
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {lectures.map((lec) => (
            <LectureCard key={lec.id} lecture={lec} />
          ))}
        </div>
      )}
    </motion.section>
  );
}

function LectureCard({ lecture }: { lecture: Lecture }) {
  return (
    <div
      style={{
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 14,
        padding: '16px 18px',
        cursor: 'pointer',
        boxShadow: 'var(--np-shadow-card)',
        transition: 'box-shadow 0.2s',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--np-text-primary)' }}>
        {lecture.title}
      </p>
      <p style={{ fontSize: 12, color: 'var(--np-text-muted)', marginTop: 4 }}>
        {lecture.date}
      </p>
    </div>
  );
}
