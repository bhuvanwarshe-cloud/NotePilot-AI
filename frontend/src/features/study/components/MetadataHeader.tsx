import { Sparkles } from 'lucide-react';
import type { StudyNote } from '@/features/study/types';

interface MetadataHeaderProps {
  note: StudyNote;
}

export function MetadataHeader({ note }: MetadataHeaderProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    return `Updated ${diffDays} days ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--np-border)' }}>
      <h1 style={{ 
        fontSize: 'clamp(2rem, 3vw, 2.75rem)', 
        fontWeight: 800, 
        margin: '0 0 16px 0', 
        lineHeight: 1.15, 
        color: 'var(--np-text-primary)', 
        letterSpacing: '-0.02em' 
      }}>
        {note.lectureTitle}
      </h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', fontSize: 13, color: 'var(--np-text-secondary)', fontWeight: 500 }}>
        <span>{note.lectureType.replace('Processor', '')}</span>
        <span>•</span>
        <span style={{ textTransform: 'capitalize' }}>{note.language}</span>
        <span>•</span>
        <span>{note.readingTime} min read</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', fontSize: 13, color: 'var(--np-text-secondary)', fontWeight: 500, marginTop: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--np-blue)', fontWeight: 600 }}>
          <Sparkles size={14} /> AI Generated
        </span>
        <span>•</span>
        <span>{formatDate(note.createdAt)}</span>
      </div>
    </div>
  );
}
