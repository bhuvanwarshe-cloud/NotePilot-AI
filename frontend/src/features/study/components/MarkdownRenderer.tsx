import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, AlertTriangle, Lightbulb, Sigma } from 'lucide-react';

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <div style={{ color: 'var(--np-text-primary)', lineHeight: 1.8, fontSize: 15, maxWidth: '100%', overflowX: 'hidden' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 style={{ fontSize: 28, fontWeight: 700, margin: '1.4em 0 0.6em', letterSpacing: '-0.02em' }} {...props} />,
          h2: ({ ...props }) => <h2 style={{ fontSize: 22, fontWeight: 700, margin: '1.25em 0 0.55em', letterSpacing: '-0.01em' }} {...props} />,
          h3: ({ ...props }) => <h3 style={{ fontSize: 18, fontWeight: 700, margin: '1.1em 0 0.45em' }} {...props} />,
          p: ({ children, ...props }) => {
            const textContent = extractTextContent(children);
            const calloutMatch = detectCallout(textContent);

            if (calloutMatch) {
              return renderCallout(calloutMatch.type, children);
            }

            return <p style={{ margin: '0 0 1em' }} {...props}>{children}</p>;
          },
          blockquote: ({ children, ...props }) => {
            const textContent = extractTextContent(children);
            const calloutMatch = detectCallout(textContent);

            if (calloutMatch) {
              return renderCallout(calloutMatch.type, children);
            }

            return <blockquote style={{ borderLeft: '3px solid var(--np-blue)', paddingLeft: 12, color: 'var(--np-text-secondary)', margin: '1em 0' }} {...props}>{children}</blockquote>;
          },
          ul: ({ ...props }) => <ul style={{ paddingLeft: 20, margin: '0 0 1em' }} {...props} />,
          ol: ({ ...props }) => <ol style={{ paddingLeft: 20, margin: '0 0 1em' }} {...props} />,
          li: ({ ...props }) => <li style={{ marginBottom: 6 }} {...props} />,
          code: ({ node, ...props }) => {
            const isInline = node?.position?.start.line === node?.position?.end.line && node?.position?.start.column === node?.position?.end.column;
            return isInline ? (
              <code style={{ background: 'var(--np-bg-secondary)', padding: '0.15em 0.35em', borderRadius: 6, fontSize: '0.95em' }} {...props} />
            ) : (
              <pre style={{ background: 'var(--np-bg-secondary)', padding: 14, borderRadius: 12, overflowX: 'auto', margin: '1em 0' }}><code {...props} /></pre>
            );
          },
          table: ({ ...props }) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1em 0' }} {...props} />,
          thead: ({ ...props }) => <thead {...props} />,
          tbody: ({ ...props }) => <tbody {...props} />,
          tr: ({ ...props }) => <tr style={{ borderBottom: '1px solid var(--np-border)' }} {...props} />,
          th: ({ ...props }) => <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700 }} {...props} />,
          td: ({ ...props }) => <td style={{ padding: '10px 8px' }} {...props} />,
          hr: ({ ...props }) => <hr style={{ border: 'none', borderTop: '1px solid var(--np-border)', margin: '1.4em 0' }} {...props} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

// Helpers for Callout Detection

function extractTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTextContent).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractTextContent((node as any).props.children);
  }
  return '';
}

function detectCallout(text: string) {
  const t = text.trim().toLowerCase();
  if (t.startsWith('definition:')) return { type: 'definition' };
  if (t.startsWith('exam tip:') || t.startsWith('exam focus:')) return { type: 'exam' };
  if (t.startsWith('important concept:') || t.startsWith('key concept:')) return { type: 'concept' };
  if (t.startsWith('formula:')) return { type: 'formula' };
  return null;
}

function renderCallout(type: string, children: React.ReactNode) {
  let bg = '';
  let border = '';
  let icon = null;
  let title = '';

  switch (type) {
    case 'definition':
      bg = 'rgba(59, 130, 246, 0.08)'; // Blue
      border = 'rgba(59, 130, 246, 0.4)';
      icon = <BookOpen size={18} color="#3B82F6" />;
      title = 'Definition';
      break;
    case 'exam':
      bg = 'rgba(249, 115, 22, 0.08)'; // Orange
      border = 'rgba(249, 115, 22, 0.4)';
      icon = <AlertTriangle size={18} color="#F97316" />;
      title = 'Exam Focus';
      break;
    case 'concept':
      bg = 'rgba(168, 85, 247, 0.08)'; // Purple
      border = 'rgba(168, 85, 247, 0.4)';
      icon = <Lightbulb size={18} color="#A855F7" />;
      title = 'Key Concept';
      break;
    case 'formula':
      bg = 'var(--np-bg-secondary)'; // Gray/Dark
      border = 'var(--np-border-strong)';
      icon = <Sigma size={18} color="var(--np-text-primary)" />;
      title = 'Formula';
      break;
  }

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: '16px 20px',
      margin: '1.2em 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--np-text-primary)' }}>
        {icon} {title}
      </div>
      <div style={{ margin: 0, fontSize: 15, color: 'var(--np-text-primary)' }}>
        {children}
      </div>
    </div>
  );
}
