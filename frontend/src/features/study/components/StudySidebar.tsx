import { ArrowLeft, Search, Film, Mic, FileStack, BookOpen, CheckCircle2, Lock } from 'lucide-react';
import type { StudyLecture } from '@/features/study/types';

interface StudySidebarProps {
  items: StudyLecture[];
  selectedId: string | null;
  searchQuery: string;
  sortOrder: 'newest' | 'oldest' | 'alphabetical';
  onSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: 'newest' | 'oldest' | 'alphabetical') => void;
  onBack?: () => void;
  isMobile?: boolean;
}

export function StudySidebar({
  items,
  selectedId,
  searchQuery,
  sortOrder,
  onSelect,
  onSearchChange,
  onSortChange,
  onBack,
  isMobile,
}: StudySidebarProps) {
  return (
    <aside style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingBottom: 4 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--np-text-muted)', margin: 0 }}>
            Study Library
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--np-text-primary)' }}>
            {isMobile ? 'Notes' : 'Your lectures'}
          </h2>
        </div>
        {isMobile && onBack && (
          <button onClick={onBack} style={{ border: '1px solid var(--np-border)', background: 'var(--np-surface)', borderRadius: 999, padding: '8px 10px', cursor: 'pointer', color: 'var(--np-text-primary)' }}>
            <ArrowLeft size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'var(--np-surface)', border: '1px solid var(--np-border)', borderRadius: 14, boxShadow: 'var(--np-shadow-card)' }}>
        <Search size={15} color="var(--np-text-muted)" />
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search lectures or notes"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--np-text-primary)', fontSize: 13 }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 2px 6px' }}>
        <span style={{ fontSize: 12, color: 'var(--np-text-secondary)', fontWeight: 600 }}>Sort</span>
        <select value={sortOrder} onChange={(event) => onSortChange(event.target.value as 'newest' | 'oldest' | 'alphabetical')} style={{ border: '1px solid var(--np-border)', borderRadius: 999, padding: '6px 10px', background: 'var(--np-surface)', color: 'var(--np-text-primary)', fontSize: 12 }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          
          const getIcon = (type: string) => {
            const t = type.toLowerCase();
            if (t.includes('youtube') || t.includes('video')) return <Film size={18} color="var(--np-text-muted)" />;
            if (t.includes('audio')) return <Mic size={18} color="var(--np-text-muted)" />;
            if (t.includes('pdf')) return <FileStack size={18} color="var(--np-text-muted)" />;
            return <BookOpen size={18} color="var(--np-text-muted)" />;
          };
          
          const formatDate = (dateStr: string) => {
            const d = new Date(dateStr);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'Updated today';
            if (diffDays === 1) return 'Updated yesterday';
            return `Updated ${diffDays} days ago`;
          };

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: 16,
                borderRadius: 16,
                border: isSelected ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--np-border)',
                background: isSelected ? 'linear-gradient(to bottom right, rgba(59,130,246,0.08), rgba(139,92,246,0.04))' : 'var(--np-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isSelected ? '0 8px 24px rgba(59,130,246,0.1)' : 'var(--np-shadow-card)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header: Thumbnail + Title + Meta */}
              <div style={{ display: 'flex', gap: 14, width: '100%', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 72, height: 54, borderRadius: 8, 
                  background: item.thumbnailUrl ? `url(${item.thumbnailUrl}) center/cover` : 'var(--np-bg-secondary)', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
                  border: '1px solid var(--np-border)'
                }}>
                  {!item.thumbnailUrl && getIcon(item.type)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    fontSize: 14, fontWeight: 700, color: 'var(--np-text-primary)', 
                    margin: '0 0 6px 0', lineHeight: 1.3 
                  }}>
                    {item.title}
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px', fontSize: 11, color: 'var(--np-text-secondary)', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{item.type.replace('Processor', '')}</span>
                    <span>•</span>
                    <span style={{ color: item.status === 'completed' ? '#10B981' : 'var(--np-text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={10} />
                      {item.status === 'completed' ? 'Completed' : 'Processing'}
                    </span>
                    {item.readingTime && (
                      <>
                        <span>•</span>
                        <span>{item.readingTime} min read</span>
                      </>
                    )}
                  </div>
                  
                  <div style={{ marginTop: 6, fontSize: 10, color: 'var(--np-text-muted)', fontWeight: 500 }}>
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>

              {/* Badges / Features Footer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contains</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600 }}>
                      <CheckCircle2 size={10} /> Notes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600 }}>
                      <CheckCircle2 size={10} /> Flashcards
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Soon</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--np-bg-secondary)', color: 'var(--np-text-muted)', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 500 }}>
                      <Lock size={9} /> Exam Strategy
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--np-bg-secondary)', color: 'var(--np-text-muted)', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 500 }}>
                      <Lock size={9} /> Quiz
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
