import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudyNotes } from '@/features/study/hooks/useStudyNotes';
import { StudySidebar } from '@/features/study/components/StudySidebar';
import { StudyContentViewer } from '@/features/study/components/StudyContentViewer';
import { LoadingState } from '@/features/study/components/LoadingState';
import { EmptyState } from '@/features/study/components/EmptyState';
import { ErrorState } from '@/features/study/components/ErrorState';
import { LecturePickerSheet, LecturePickerTrigger } from '@/features/study/components/LecturePickerSheet';
import { useIsCompact } from '@/hooks/useMediaQuery';

export function StudyWorkspacePage() {
  const {
    notes,
    selectedNote,
    loading,
    error,
    selectedNoteId,
    searchQuery,
    sortOrder,
    setSelectedNoteId,
    setSearchQuery,
    setSortOrder,
  } = useStudyNotes();

  // Centralised breakpoint — no manual resize listeners
  const isCompact = useIsCompact();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!notes.length) return <EmptyState />;

  // Build sidebar items once
  const sidebarItems = notes.map((note) => ({
    id: note.lectureId,
    title: note.lectureTitle,
    type: note.lectureType,
    thumbnailUrl: note.lectureThumbnailUrl,
    language: note.language,
    createdAt: note.createdAt,
    status: note.status,
    readingTime: note.readingTime,
    hasNotes: true,
  }));

  const selectedItem = selectedNote
    ? sidebarItems.find((i) => i.id === selectedNote.lectureId)
    : undefined;

  // ── Desktop layout: permanent sidebar + content ──────────────
  if (!isCompact) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px minmax(0, 1fr)',
          gap: 24,
          alignItems: 'start',
          padding: '24px 20px 40px',
          maxWidth: 1500,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ minWidth: 0 }}
        >
          <StudySidebar
            items={sidebarItems}
            selectedId={selectedNote?.lectureId ?? selectedNoteId}
            searchQuery={searchQuery}
            sortOrder={sortOrder}
            onSelect={setSelectedNoteId}
            onSearchChange={setSearchQuery}
            onSortChange={setSortOrder}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ minWidth: 0 }}
        >
          <StudyContentViewer
            note={selectedNote}
            isMobile={false}
            onBack={() => {}}
            onCopy={handleCopy}
          />
        </motion.div>
      </div>
    );
  }

  // ── Compact layout (mobile/tablet): full-width + bottom sheet ──
  return (
    <div style={{ padding: '12px 0 32px', width: '100%', boxSizing: 'border-box' }}>
      {/* Lecture picker trigger */}
      <div style={{ padding: '0 16px' }}>
        <LecturePickerTrigger
          selectedLecture={selectedItem}
          onClick={() => setSheetOpen(true)}
          pageTitle="Notes"
        />
      </div>

      {/* Bottom sheet */}
      <LecturePickerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedLecture={selectedItem}
        items={sidebarItems}
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        onSelect={setSelectedNoteId}
        onSearchChange={setSearchQuery}
        onSortChange={setSortOrder}
        pageTitle="Select Lecture"
      />

      {/* Content — full width */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ padding: '0 16px' }}
      >
        <StudyContentViewer
          note={selectedNote}
          isMobile={true}
          onBack={() => {}}
          onCopy={handleCopy}
        />
      </motion.div>
    </div>
  );
}
