import { Sparkles, FileText, BrainCircuit, GitBranch, HelpCircle, Captions, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Activity {
  id: string;
  type: 'transcript' | 'notes' | 'flashcards' | 'mindmap' | 'quiz';
  message: string;
  timestamp: string;
}

interface AiActivityProps {
  activities: Activity[];
}

const PIPELINE = [
  { Icon: Captions,    label: 'Transcript' },
  { Icon: FileText,    label: 'Smart Notes' },
  { Icon: BrainCircuit,label: 'Flashcards' },
  { Icon: GitBranch,   label: 'Mind Map' },
  { Icon: HelpCircle,  label: 'Quiz' },
];

export function AiActivity({ activities }: AiActivityProps) {
  const isEmpty = activities.length === 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
    >
      <h2
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--np-text-primary)',
          margin: '0 0 16px',
        }}
      >
        AI Activity
      </h2>

      <div
        style={{
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          borderRadius: 16,
          padding: isEmpty ? '36px 28px' : 0,
          boxShadow: 'var(--np-shadow-card)',
          overflow: 'hidden',
        }}
      >
        {isEmpty ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'var(--np-purple-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Sparkles size={22} color="var(--np-purple)" />
            </div>

            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--np-text-primary)',
                margin: '0 0 6px',
              }}
            >
              Waiting for first upload
            </p>
            <p
              style={{
                fontSize: 12.5,
                color: 'var(--np-text-muted)',
                margin: '0 0 24px',
                lineHeight: 1.5,
              }}
            >
              Upload a lecture to begin the AI pipeline
            </p>

            {/* Pipeline flow */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
                width: '100%',
              }}
            >
              {PIPELINE.map((step, i) => (
                <div
                  key={step.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 14px',
                      borderRadius: 9,
                      background: 'var(--np-bg-secondary)',
                      border: '1px solid var(--np-border)',
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: 'var(--np-text-secondary)',
                    }}
                  >
                    <step.Icon size={13} color="var(--np-purple)" />
                    {step.label}
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowDown size={14} color="var(--np-text-muted)" style={{ margin: '3px 0' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          activities.map((act, i) => (
            <div
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                borderBottom:
                  i < activities.length - 1 ? '1px solid var(--np-border)' : 'none',
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--np-text-secondary)', margin: 0 }}>
                {act.message}
              </p>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--np-text-muted)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  marginLeft: 'auto',
                }}
              >
                {act.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}
