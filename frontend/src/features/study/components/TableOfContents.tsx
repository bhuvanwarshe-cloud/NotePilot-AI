import { ListTree } from 'lucide-react';
import type { TocItem } from '@/features/study/utils/generateTOC';

interface TableOfContentsProps {
  items: TocItem[];
  activeId?: string | null;
}

export function TableOfContents({ items, activeId }: TableOfContentsProps) {
  if (!items.length) return null;

  return (
    <div style={{ background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)', borderRadius: 16, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <ListTree size={14} color="var(--np-blue)" />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--np-text-primary)', margin: 0 }}>Contents</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a key={item.id} href={`#${item.id}`} style={{ 
              marginLeft: `${(item.level - 1) * 10}px`, 
              color: isActive ? 'var(--np-blue)' : 'var(--np-text-secondary)', 
              fontWeight: isActive ? 600 : 400,
              fontSize: 12, 
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}>
              {item.text}
            </a>
          );
        })}
      </div>
    </div>
  );
}
