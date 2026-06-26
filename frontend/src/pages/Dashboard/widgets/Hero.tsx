import { Upload, Mic, Video, FileText, PlaySquare, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (h < 18) return { text: 'Good Afternoon', emoji: '🌤️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

const BENEFITS = [
  'Transcript',
  'Smart Notes',
  'Flashcards',
  'Mind Map',
  'Quiz',
];

const FORMATS = [
  { Icon: Mic,        label: 'Audio' },
  { Icon: Video,      label: 'Video' },
  { Icon: FileText,   label: 'PDF' },
  { Icon: PlaySquare, label: 'YouTube' },
  { Icon: BookOpen,   label: 'Textbook' },
];

export function DashboardHero() {
  const { user, profile } = useAuth();
  const { text: greet, emoji } = getGreeting();
  const firstName =
    profile?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'Student';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',     /* Guaranteed 60 / 40 split */
        minHeight: 400,
        maxHeight: 440,
        borderRadius: 20,
        overflow: 'hidden',
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        boxShadow: 'var(--np-shadow-card)',
        /* Very subtle dual-radial tint — almost invisible */
        backgroundImage:
          'radial-gradient(ellipse 80% 100% at 10% 60%, rgba(59,130,246,0.05) 0%, transparent 65%),' +
          'radial-gradient(ellipse 60% 80% at 90% 10%, rgba(139,92,246,0.04) 0%, transparent 65%)',
      }}
    >
      {/* ── LEFT PANEL — 60% ──────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          gap: 28,
          minWidth: 0,
        }}
      >
        {/* Greeting + name */}
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--np-text-muted)',
              marginBottom: 10,
            }}
          >
            {greet} {emoji}
          </p>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 750,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--np-text-primary)',
              margin: 0,
            }}
          >
            Welcome back,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {firstName}.
            </span>
          </h1>
          <p
            style={{
              marginTop: 14,
              fontSize: 16,
              lineHeight: 1.65,
              color: 'var(--np-text-secondary)',
              maxWidth: 420,
            }}
          >
            Upload any lecture and NotePilot will instantly generate everything you need to study.
          </p>
        </div>

        {/* Benefits list */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {BENEFITS.map((b) => (
            <li
              key={b}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                color: 'var(--np-text-secondary)',
              }}
            >
              <CheckCircle2
                size={16}
                style={{ color: '#10B981', flexShrink: 0 }}
              />
              {b}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 24px',
              borderRadius: 11,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
              boxShadow: '0 4px 18px var(--np-blue-glow)',
              letterSpacing: '0.01em',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.9';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <Upload size={15} />
            + Upload Lecture
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL — 40% — Upload dropzone ───────────────────── */}
      <div
        style={{
          borderLeft: '1px solid var(--np-border)',
          background: 'var(--np-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 36px',
        }}
      >
        <UploadDropzone />
      </div>
    </motion.div>
  );
}

// ─── Upload dropzone panel ────────────────────────────────────────────────────
function UploadDropzone() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 360,
        border: '2px dashed var(--np-border-strong)',
        borderRadius: 18,
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--np-blue)';
        (e.currentTarget as HTMLElement).style.background = 'var(--np-blue-subtle)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--np-border-strong)';
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* Upload icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
          flexShrink: 0,
        }}
      >
        <Upload size={32} color="var(--np-blue)" />
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontSize: 17,
            fontWeight: 650,
            color: 'var(--np-text-primary)',
            marginBottom: 6,
            letterSpacing: '-0.01em',
          }}
        >
          Drop your lecture here
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--np-text-muted)', lineHeight: 1.5 }}>
          or{' '}
          <span
            style={{
              color: 'var(--np-blue)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            Browse Files
          </span>
        </p>
      </div>

      {/* Supported formats */}
      <div
        style={{
          width: '100%',
          borderTop: '1px solid var(--np-border)',
          paddingTop: 18,
        }}
      >
        <p
          style={{
            textAlign: 'center',
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'var(--np-text-muted)',
            marginBottom: 12,
          }}
        >
          Supports
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 18px',
          }}
        >
          {FORMATS.map(({ Icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--np-text-secondary)',
              }}
            >
              <Icon size={13} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
