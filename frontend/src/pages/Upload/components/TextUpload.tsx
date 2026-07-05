import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Sparkles } from 'lucide-react';
import { sourceConfig } from '../sourceConfig';

export function TextUpload({ onUpload }: { onUpload: (text: string) => void }) {
  const config = sourceConfig.text;
  const [text, setText] = useState('');
  const maxLength = 50000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 24,
        boxShadow: 'var(--np-shadow-card)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid var(--np-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--np-blue-subtle)',
          color: 'var(--np-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Type size={24} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 700, color: 'var(--np-text-primary)' }}>
            {config.title}
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--np-text-secondary)' }}>
            {config.description}
          </p>
        </div>
      </div>

      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <textarea
          placeholder="Paste your lecture notes or text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: '100%',
            height: 300,
            padding: 20,
            fontSize: 16,
            lineHeight: 1.6,
            background: 'var(--np-bg-primary)',
            border: '1px solid var(--np-border)',
            borderRadius: 12,
            color: 'var(--np-text-primary)',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--np-text-muted)' }}>
            {text.length.toLocaleString()} / {maxLength.toLocaleString()} characters
          </span>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setText('')}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid var(--np-border)',
                borderRadius: 8,
                color: 'var(--np-text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--np-bg-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Clear
            </button>
            <button
              onClick={() => onUpload(text)}
              style={{
                padding: '10px 20px',
                background: text.length > 0 ? 'var(--np-blue)' : 'var(--np-blue-subtle)',
                border: 'none',
                borderRadius: 8,
                color: text.length > 0 ? '#fff' : 'var(--np-text-muted)',
                fontWeight: 600,
                cursor: text.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
              disabled={text.length === 0}
            >
              <Sparkles size={16} />
              Generate
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
