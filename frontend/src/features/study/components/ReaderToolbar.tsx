import { useState, useRef, useEffect } from 'react';
import { Copy, Download, MoreHorizontal, LayoutList, Target, BrainCircuit, Share, History, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudyNote } from '@/features/study/types';

interface ReaderToolbarProps {
  note: StudyNote;
  onCopy?: (content: string) => void;
}

export function ReaderToolbar({ note, onCopy }: ReaderToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: <LayoutList size={14} />, label: 'Flashcards', action: () => {} },
    { icon: <Target size={14} />, label: 'Exam Strategy', action: () => {} },
    { icon: <Brain size={14} />, label: 'Quiz', action: () => {} },
    { icon: <BrainCircuit size={14} />, label: 'Mind Map', action: () => {} },
    { icon: <Share size={14} />, label: 'Share', action: () => {} },
    { icon: <History size={14} />, label: 'Revision Mode', action: () => {} },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, position: 'relative' }}>
      <button
        onClick={() => onCopy?.(note.markdown)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 999,
          border: '1px solid var(--np-border)',
          background: 'var(--np-surface)',
          color: 'var(--np-text-primary)',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
      >
        <Copy size={14} /> Copy
      </button>
      
      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 999,
          border: '1px solid var(--np-border)',
          background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
      >
        <Download size={14} /> Download
      </button>

      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: '1px solid var(--np-border)',
            background: showMenu ? 'var(--np-bg-secondary)' : 'var(--np-surface)',
            color: 'var(--np-text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <MoreHorizontal size={16} />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 8,
                background: 'var(--np-surface)',
                border: '1px solid var(--np-border)',
                borderRadius: 12,
                boxShadow: 'var(--np-shadow-card)',
                padding: '6px',
                minWidth: 180,
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setShowMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--np-text-primary)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    textAlign: 'left',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--np-bg-secondary)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: 'var(--np-text-secondary)' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
