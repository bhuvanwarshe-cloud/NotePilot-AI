import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStudyNotes } from '@/features/study/hooks/useStudyNotes';
import { StudySidebar } from '@/features/study/components/StudySidebar';
import { StudyContentViewer } from '@/features/study/components/StudyContentViewer';
import { LoadingState } from '@/features/study/components/LoadingState';
import { EmptyState } from '@/features/study/components/EmptyState';
import { ErrorState } from '@/features/study/components/ErrorState';

export function StudyWorkspacePage() {
  const {
    notes,
    selectedNote,
    loading,
    error,
    selectedNoteId,
    searchQuery,
    sortOrder,
    view,
    setSelectedNoteId,
    setSearchQuery,
    setSortOrder,
    setView,
  } = useStudyNotes();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const layoutStyles = useMemo(() => ({
    display: 'grid' as const,
    gridTemplateColumns: isMobile ? '1fr' : '300px minmax(0, 1fr)',
    gap: 24,
    alignItems: 'start' as const,
  }), []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!notes.length) {
    return <EmptyState />;
  }

  return (
    <div style={{ padding: '24px 20px 40px', maxWidth: 1500, margin: '0 auto', width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ ...layoutStyles }}
      >
        {(isMobile ? view === 'list' : true) && (
          <div style={{ minWidth: 0 }}>
            <StudySidebar
              items={notes.map(note => ({
                id: note.id,
                title: note.lectureTitle,
                type: note.lectureType,
                thumbnailUrl: note.lectureThumbnailUrl,
                language: note.language,
                createdAt: note.createdAt,
                status: note.status,
                readingTime: note.readingTime,
              }))}
              selectedId={selectedNoteId}
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              onSelect={setSelectedNoteId}
              onSearchChange={setSearchQuery}
              onSortChange={setSortOrder}
              isMobile={isMobile}
              onBack={() => setView('list')}
            />
          </div>
        )}

        {(isMobile ? view === 'reader' : true) && (
          <div style={{ minWidth: 0 }}>
            <StudyContentViewer
              note={selectedNote}
              isMobile={isMobile}
              onBack={() => setView('list')}
              onCopy={handleCopy}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
