import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlaySquare, Download } from 'lucide-react';
import { sourceConfig } from '../sourceConfig';

export function YouTubeUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const config = sourceConfig.youtube;
  const [url, setUrl] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 24,
        boxShadow: 'var(--np-shadow-card)',
        width: '100%',
      }}
    >
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: 'var(--np-error)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}>
        <PlaySquare size={32} />
      </div>

      <h3 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 700, color: 'var(--np-text-primary)' }}>
        {config.title}
      </h3>
      
      <p style={{ margin: '0 0 32px 0', fontSize: 16, color: 'var(--np-text-secondary)', textAlign: 'center' }}>
        {config.description}
      </p>

      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: 16,
            background: 'var(--np-bg-primary)',
            border: '1px solid var(--np-border)',
            borderRadius: 12,
            color: 'var(--np-text-primary)',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handlePaste}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: 'var(--np-surface-raised)',
              border: '1px solid var(--np-border)',
              borderRadius: 12,
              color: 'var(--np-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--np-bg-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--np-surface-raised)'}
          >
            Paste URL
          </button>
          <button
            onClick={() => onUpload(url)}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: url ? 'var(--np-blue)' : 'var(--np-blue-subtle)',
              border: 'none',
              borderRadius: 12,
              color: url ? '#fff' : 'var(--np-text-muted)',
              fontWeight: 600,
              cursor: url ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
            disabled={!url}
          >
            <Download size={18} />
            Import
          </button>
        </div>
      </div>
    </motion.div>
  );
}
