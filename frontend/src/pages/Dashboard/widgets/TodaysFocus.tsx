import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

export interface FocusItem {
  id: string;
  title: string;
  completed: boolean;
}

interface TodaysFocusProps {
  items: FocusItem[];
}

export function TodaysFocus({ items }: TodaysFocusProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
    >
      <h2
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--np-text-primary)',
          margin: '0 0 16px',
        }}
      >
        Today's Focus
      </h2>

      {items.length === 0 ? (
        <div
          style={{
            background: 'var(--np-surface)',
            border: '1px solid var(--np-border)',
            borderRadius: 16,
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 12,
            boxShadow: 'var(--np-shadow-card)',
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
            }}
          >
            <Target size={22} color="var(--np-purple)" />
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--np-text-primary)',
              margin: 0,
            }}
          >
            No focus items yet
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--np-text-secondary)',
              lineHeight: 1.6,
              maxWidth: 300,
              margin: 0,
            }}
          >
            Upload your first lecture to receive AI-generated study recommendations.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--np-surface)',
            border: '1px solid var(--np-border)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: 'var(--np-shadow-card)',
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '13px 18px',
                borderBottom:
                  i < items.length - 1 ? '1px solid var(--np-border)' : 'none',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: `2px solid ${item.completed ? '#10B981' : 'var(--np-border-strong)'}`,
                  background: item.completed ? '#10B981' : 'transparent',
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  fontSize: 13.5,
                  color: item.completed
                    ? 'var(--np-text-muted)'
                    : 'var(--np-text-primary)',
                  textDecoration: item.completed ? 'line-through' : 'none',
                  margin: 0,
                }}
              >
                {item.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
