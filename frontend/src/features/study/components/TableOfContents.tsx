import { ListTree } from 'lucide-react';
import type { TocItem } from '@/features/study/utils/generateTOC';

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  if (!items.length) return null;

  return (
    <div style={{ background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)', borderRadius: 16, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <ListTree size={14} color="var(--np-blue)" />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--np-text-primary)', margin: 0 }}>Contents</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} style={{ marginLeft: `${(item.level - 1) * 10}px`, color: 'var(--np-text-secondary)', fontSize: 12, textDecoration: 'none' }}>
            {item.text}
          </a>
        ))}
      </div>
    </div>
  );
}
