import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, FileText, CheckCircle2, Clock, Film, Mic, FileStack, BookOpen } from 'lucide-react';

export interface SmartNoteItem {
  id: string;
  lectureId: string;
  title: string;
  type: string;
  thumbnail_url: string | null;
  readingTime: number;
  completed: boolean;
  createdAt: string;
}

interface ContinueLearningProps {
  items: SmartNoteItem[];
}

export function ContinueLearning({ items }: ContinueLearningProps) {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('youtube') || t.includes('video')) return <Film size={14} />;
    if (t.includes('audio')) return <Mic size={14} />;
    if (t.includes('pdf')) return <FileStack size={14} />;
    return <BookOpen size={14} />;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--np-text-primary)', margin: 0 }}>
          Continue Learning
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/dashboard/notes?lectureId=${item.lectureId}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'var(--np-surface)',
              border: '1px solid var(--np-border)',
              borderRadius: 16,
              padding: '16px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              boxShadow: 'var(--np-shadow-card)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--np-shadow-card)';
            }}
          >
            {/* Thumbnail / Icon */}
            <div
              style={{
                width: 64,
                height: 48,
                borderRadius: 8,
                background: item.thumbnail_url ? `url(${item.thumbnail_url}) center/cover` : 'var(--np-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--np-border)',
              }}
            >
              {!item.thumbnail_url && getIcon(item.type)}
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--np-text-primary)',
                  margin: '0 0 6px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--np-text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} />
                  {item.readingTime} min read
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: item.completed ? '#10B981' : 'var(--np-text-secondary)' }}>
                  <CheckCircle2 size={12} />
                  {item.completed ? 'Completed' : 'Notes Ready'}
                </span>
              </div>
            </div>

            {/* Play/Action Button */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--np-blue-subtle)',
                color: 'var(--np-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />
            </div>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
