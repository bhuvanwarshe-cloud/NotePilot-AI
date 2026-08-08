import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, BookOpen } from 'lucide-react';
import { StudySidebar } from './StudySidebar';
import type { StudyLecture } from '@/features/study/types';

interface LecturePickerSheetProps {
  /** Whether the bottom sheet is open */
  open: boolean;
  onClose: () => void;

  /** The currently selected lecture (for the trigger display) */
  selectedLecture: StudyLecture | null | undefined;

  /** All StudySidebar props — forwarded directly to avoid duplicating data logic */
  items: StudyLecture[];
  searchQuery: string;
  sortOrder: 'newest' | 'oldest' | 'alphabetical';
  onSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: 'newest' | 'oldest' | 'alphabetical') => void;

  /** Page-specific title shown in the trigger button */
  pageTitle?: string;
}

/**
 * LecturePickerSheet
 *
 * Mobile-only bottom sheet that wraps the existing StudySidebar.
 * Triggered by a button showing the currently selected lecture title.
 * On lecture selection, the sheet closes automatically.
 *
 * Does NOT duplicate any data fetching. All data comes through props
 * from the parent page's existing hook.
 */
export function LecturePickerSheet({
  open,
  onClose,
  selectedLecture,
  items,
  searchQuery,
  sortOrder,
  onSelect,
  onSearchChange,
  onSortChange,
  pageTitle = 'Select Lecture',
}: LecturePickerSheetProps) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="np-bottom-sheet-overlay"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Select a lecture"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34, mass: 0.9 }}
            className="np-bottom-sheet"
          >
            {/* Drag handle */}
            <div className="np-bottom-sheet-handle" />

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} color="var(--np-blue)" />
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--np-text-primary)' }}>
                  {pageTitle}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close lecture picker"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--np-bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--np-text-secondary)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Reuse the existing StudySidebar — no duplication */}
            <StudySidebar
              items={items}
              selectedId={selectedLecture?.id ?? null}
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              onSelect={handleSelect}
              onSearchChange={onSearchChange}
              onSortChange={onSortChange}
              isMobile={true}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * LecturePickerTrigger
 *
 * The compact button shown at the top of study pages on mobile/tablet.
 * Shows the current lecture title (or a prompt to select one).
 */
export function LecturePickerTrigger({
  selectedLecture,
  onClick,
  pageTitle = 'Select Lecture',
}: {
  selectedLecture: StudyLecture | null | undefined;
  onClick: () => void;
  pageTitle?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="np-lecture-picker-trigger"
      aria-label={selectedLecture ? `Currently studying: ${selectedLecture.title}. Tap to change.` : 'Select a lecture'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--np-blue-subtle), var(--np-purple-subtle))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <BookOpen size={15} color="var(--np-blue)" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            {pageTitle}
          </p>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: selectedLecture ? 'var(--np-text-primary)' : 'var(--np-blue)',
              margin: '2px 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedLecture ? selectedLecture.title : 'Tap to choose a lecture →'}
          </p>
        </div>
      </div>
      <ChevronDown size={16} color="var(--np-text-muted)" style={{ flexShrink: 0 }} />
    </button>
  );
}
