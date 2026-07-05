export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function generateTOC(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const items: TocItem[] = [];

  for (const match of markdown.matchAll(headingRegex)) {
    const level = match[1].length;
    const text = match[2].trim().replace(/[*_`~]/g, '');
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    items.push({ id: `${id}-${items.length + 1}`, text, level });
  }

  return items;
}
