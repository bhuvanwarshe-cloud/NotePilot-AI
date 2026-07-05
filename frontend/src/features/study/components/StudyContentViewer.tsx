import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StudyNote } from '@/features/study/types';
import { generateTOC } from '@/features/study/utils/generateTOC';
import { MarkdownRenderer } from '@/features/study/components/MarkdownRenderer';
import { MetadataHeader } from '@/features/study/components/MetadataHeader';
import { ReaderToolbar } from '@/features/study/components/ReaderToolbar';
import { ReadingStats } from '@/features/study/components/ReadingStats';
import { TableOfContents } from '@/features/study/components/TableOfContents';

interface StudyContentViewerProps {
  note: StudyNote | null;
  onBack?: () => void;
  isMobile?: boolean;
  onCopy?: (content: string) => void;
}

export function StudyContentViewer({ note, onBack, isMobile, onCopy }: StudyContentViewerProps) {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const toc = useMemo(() => (note ? generateTOC(note.markdown) : []), [note]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const current = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      setProgress(Math.min(100, Math.max(0, current * 100)));

      const headings = Array.from(document.querySelectorAll<HTMLElement>('[data-toc-heading="true"]'));
      for (let index = headings.length - 1; index >= 0; index -= 1) {
        const heading = headings[index];
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 160) {
          setActiveSection(heading.id);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!note) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        {isMobile && onBack && (
          <button onClick={onBack} style={{ border: '1px solid var(--np-border)', background: 'var(--np-surface)', borderRadius: 999, padding: '8px 10px', cursor: 'pointer', color: 'var(--np-text-primary)' }}>
            <ArrowLeft size={16} />
          </button>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 16px', border: '1px solid var(--np-border)', borderRadius: 16, background: 'var(--np-surface)', boxShadow: 'var(--np-shadow-card)', minWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--np-text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Learning Progress</span>
            <span style={{ fontSize: 11, color: 'var(--np-text-secondary)', fontWeight: 600 }}>
              {Math.max(1, Math.ceil(note.readingTime * (1 - (progress / 100))))} min left
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--np-bg-secondary)', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.25 }} style={{ height: '100%', background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))', borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--np-text-primary)' }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ background: 'var(--np-surface)', border: '1px solid var(--np-border)', borderRadius: 24, padding: 24, boxShadow: 'var(--np-shadow-card)' }}>
        <MetadataHeader note={note} />
        <ReaderToolbar note={note} onCopy={onCopy} />
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 260px', gap: 24, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <MarkdownRenderer markdown={note.markdown} />
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 24 }}>
              <TableOfContents items={toc} activeId={activeSection} />
              <ReadingStats note={note} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
