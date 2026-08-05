import { useEffect, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, BookOpen } from 'lucide-react';
import { useStudyLectures } from '@/features/study/hooks/useStudyLectures';
import { StudySidebar } from '@/features/study/components/StudySidebar';
import { EmptyState as GlobalEmptyState } from '@/features/study/components/EmptyState';
import { LoadingState } from '@/features/study/components/LoadingState';
import { ErrorState } from '@/features/study/components/ErrorState';

import { useFlashcards } from '@/features/flashcards/hooks/useFlashcards';
import { FlashcardViewer } from '@/features/flashcards/components/FlashcardViewer';
import { FlashcardLoading } from '@/features/flashcards/components/FlashcardLoading';
import { FlashcardEmpty } from '@/features/flashcards/components/FlashcardEmpty';
import { FlashcardError } from '@/features/flashcards/components/FlashcardError';
import { DifficultyBadge } from '@/features/flashcards/components/DifficultyBadge';

export function FlashcardsPage() {
  const {
    lectures,
    loading: lecturesLoading,
    error: lecturesError,
    selectedLectureId,
    searchQuery,
    sortOrder,
    view,
    setSelectedLectureId,
    setSearchQuery,
    setSortOrder,
    setView,
  } = useStudyLectures();

  const {
    flashcards,
    loading: flashcardsLoading,
    error: flashcardsError,
    currentIndex,
    isFlipped,
    flip,
    goNext,
    goPrev,
    setCurrentIndex,
    setFlipped,
    retry,
  } = useFlashcards(selectedLectureId);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (event.key) {
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          flip();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < flashcards.length - 1) goNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (currentIndex > 0) goPrev();
          break;
        default:
          break;
      }
    },
    [flip, goNext, goPrev, currentIndex, flashcards.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const layoutStyles = useMemo(() => ({
    display: 'grid' as const,
    gridTemplateColumns: isMobile ? '1fr' : '300px minmax(0, 1fr)',
    gap: 24,
    alignItems: 'start' as const,
  }), [isMobile]);

  if (lecturesLoading) {
    return <LoadingState />;
  }

  if (lecturesError) {
    return <ErrorState message={lecturesError} onRetry={() => window.location.reload()} />;
  }

  if (!lectures.length) {
    return <GlobalEmptyState />;
  }

  const renderFlashcardsContent = () => {
    if (flashcardsLoading) return <FlashcardLoading />;
    if (flashcardsError) return <FlashcardError message={flashcardsError} onRetry={retry} />;
    if (!flashcards.length) return <FlashcardEmpty />;

    const currentCard = flashcards[currentIndex];
    const easyCount = flashcards.filter((c) => c.difficulty === 1).length;
    const mediumCount = flashcards.filter((c) => c.difficulty === 2).length;
    const hardCount = flashcards.filter((c) => c.difficulty === 3).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
      >
        {/* ── Page Header ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--np-text-muted)', margin: 0 }}>
              Study Tools
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isMobile && (
                <button 
                  onClick={() => setView('list')}
                  style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', color: 'var(--np-text-primary)', display: 'flex', alignItems: 'center' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </button>
              )}
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.2)' }}>
                <BrainCircuit size={18} color="#fff" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--np-text-primary)', letterSpacing: '-0.02em' }}>
                Flashcards
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 14, background: 'var(--np-surface)', border: '1px solid var(--np-border)', boxShadow: 'var(--np-shadow-card)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--np-text-muted)', marginRight: 4 }}>
              <BookOpen size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
              {flashcards.length} total
            </span>
            <div style={{ width: 1, height: 14, background: 'var(--np-border-strong)' }} />
            {easyCount > 0 && <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>{easyCount} Easy</span>}
            {mediumCount > 0 && <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>{mediumCount} Medium</span>}
            {hardCount > 0 && <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{hardCount} Hard</span>}
          </div>
        </div>

        {/* ── Difficulty badge for current card ─────────────────────── */}
        {currentCard && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 2 }}>
            <DifficultyBadge difficulty={currentCard.difficulty} />
            {currentCard.generated_by && (
              <span style={{ fontSize: 11, color: 'var(--np-text-muted)', fontWeight: 500 }}>
                Generated by {currentCard.generated_by}
              </span>
            )}
          </div>
        )}

        {/* ── Viewer ────────────────────────────────────────────────── */}
        <FlashcardViewer
          flashcards={flashcards}
          currentIndex={currentIndex}
          isFlipped={isFlipped}
          onFlip={flip}
          onNext={goNext}
          onPrev={goPrev}
          onJumpTo={(i) => {
            setCurrentIndex(i);
            setFlipped(false);
          }}
        />
      </motion.div>
    );
  };

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
              items={lectures}
              selectedId={selectedLectureId}
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              onSelect={setSelectedLectureId}
              onSearchChange={setSearchQuery}
              onSortChange={setSortOrder}
              isMobile={isMobile}
              onBack={() => setView('list')}
            />
          </div>
        )}

        {(isMobile ? view === 'reader' : true) && (
          <div style={{ minWidth: 0 }}>
            {selectedLectureId ? (
              renderFlashcardsContent()
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--np-text-muted)' }}>
                Select a lecture to study flashcards
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
