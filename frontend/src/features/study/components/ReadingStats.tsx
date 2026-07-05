import { BookOpen, FileCode2, Table, ListChecks, TextSearch, TimerReset } from 'lucide-react';
import type { StudyNote } from '@/features/study/types';
import type { ComponentType } from 'react';

interface ReadingStatsProps {
  note: StudyNote;
}

export function ReadingStats({ note }: ReadingStatsProps) {
  return (
    <div style={{ background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--np-text-primary)', margin: 0 }}>Reading Insights</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <StatRow icon={BookOpen} label="Reading time" value={`${note.readingTime} min`} />
        <StatRow icon={TextSearch} label="Word count" value={note.wordCount.toLocaleString()} />
        <StatRow icon={ListChecks} label="Headings" value={note.headings.toString()} />
        <StatRow icon={ListChecks} label="Lists" value={note.lists.toString()} />
        <StatRow icon={FileCode2} label="Code blocks" value={note.codeBlocks.toString()} />
        <StatRow icon={Table} label="Tables" value={note.tables.toString()} />
        <StatRow icon={TimerReset} label="Revision" value={`${note.revisionTime} min`} />
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--np-text-secondary)', fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={13} />
        <span>{label}</span>
      </div>
      <span style={{ color: 'var(--np-text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
