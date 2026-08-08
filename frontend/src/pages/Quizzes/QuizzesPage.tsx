import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks } from 'lucide-react';

import { useStudyLectures } from '@/features/study/hooks/useStudyLectures';
import { StudySidebar } from '@/features/study/components/StudySidebar';
import { EmptyState as GlobalEmptyState } from '@/features/study/components/EmptyState';
import { LoadingState } from '@/features/study/components/LoadingState';
import { ErrorState } from '@/features/study/components/ErrorState';
import { LecturePickerSheet, LecturePickerTrigger } from '@/features/study/components/LecturePickerSheet';

import { useQuizzes } from '@/features/quizzes/hooks/useQuizzes';
import { QuizOverview } from '@/features/quizzes/components/QuizOverview';
import { QuizViewer } from '@/features/quizzes/components/QuizViewer';
import { QuizResults } from '@/features/quizzes/components/QuizResults';
import { QuizEmpty } from '@/features/quizzes/components/QuizEmpty';
import { QuizLoading } from '@/features/quizzes/components/QuizLoading';
import { QuizError } from '@/features/quizzes/components/QuizError';
import { useIsCompact } from '@/hooks/useMediaQuery';

export function QuizzesPage() {
  const {
    lectures,
    loading: lecturesLoading,
    error: lecturesError,
    selectedLectureId,
    searchQuery,
    sortOrder,
    setSelectedLectureId,
    setSearchQuery,
    setSortOrder,
  } = useStudyLectures();

  const { quiz, loading: quizLoading, error: quizError, retry } = useQuizzes(selectedLectureId);

  const isCompact = useIsCompact();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [quizState, setQuizState] = useState<'overview' | 'playing' | 'results'>('overview');
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    setQuizState('overview');
    setScore(0);
    setUserAnswers({});
  }, [selectedLectureId]);

  if (lecturesLoading) return <LoadingState />;
  if (lecturesError)   return <ErrorState message={lecturesError} onRetry={() => window.location.reload()} />;
  if (!lectures.length) return <GlobalEmptyState />;

  const selectedLecture = lectures.find((l) => l.id === selectedLectureId);

  const renderQuizContent = () => {
    if (quizLoading) return <QuizLoading />;
    if (quizError)   return <QuizError message={quizError} onRetry={retry} />;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return <QuizEmpty />;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, height: '100%' }}>
        {/* Page header — shown in overview only */}
        {quizState === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--np-text-muted)', margin: 0 }}>
                Study Tools
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, var(--np-purple), var(--np-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}>
                  <ListChecks size={18} color="#fff" />
                </div>
                <h1 style={{ fontSize: isCompact ? 22 : 26, fontWeight: 800, margin: 0, color: 'var(--np-text-primary)', letterSpacing: '-0.02em' }}>
                  Quizzes
                </h1>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic quiz area */}
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {quizState === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <QuizOverview quiz={quiz} onStart={() => setQuizState('playing')} />
              </motion.div>
            )}

            {quizState === 'playing' && (
              <motion.div key="playing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ height: '100%' }}>
                <QuizViewer
                  quiz={quiz}
                  onComplete={(finalScore, answers) => {
                    setScore(finalScore);
                    setUserAnswers(answers);
                    setQuizState('results');
                  }}
                />
              </motion.div>
            )}

            {quizState === 'results' && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <QuizResults
                  quiz={quiz}
                  score={score}
                  userAnswers={userAnswers}
                  onRetry={() => {
                    setScore(0);
                    setUserAnswers({});
                    setQuizState('overview');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // ── Desktop layout ────────────────────────────────────────────
  if (!isCompact) {
    return (
      <div style={{ padding: '24px 20px 40px', maxWidth: 1500, margin: '0 auto', width: '100%', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr)', gap: 24, alignItems: 'start', height: '100%' }}>
          <div style={{ minWidth: 0, height: '100%' }}>
            <StudySidebar
              items={lectures}
              selectedId={selectedLectureId}
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              onSelect={setSelectedLectureId}
              onSearchChange={setSearchQuery}
              onSortChange={setSortOrder}
            />
          </div>

          <div style={{ minWidth: 0, height: '100%' }}>
            {selectedLectureId ? (
              renderQuizContent()
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--np-text-muted)' }}>
                Select a lecture to take a quiz
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Compact layout (mobile/tablet) ────────────────────────────
  return (
    <div style={{ padding: '12px 0 32px', width: '100%', boxSizing: 'border-box' }}>
      {/* Lecture picker trigger */}
      <div style={{ padding: '0 16px' }}>
        <LecturePickerTrigger
          selectedLecture={selectedLecture}
          onClick={() => setSheetOpen(true)}
          pageTitle="Quizzes"
        />
      </div>

      {/* Bottom sheet */}
      <LecturePickerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedLecture={selectedLecture}
        items={lectures}
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        onSelect={setSelectedLectureId}
        onSearchChange={setSearchQuery}
        onSortChange={setSortOrder}
        pageTitle="Select Lecture"
      />

      {/* Content */}
      <div style={{ padding: '0 16px' }}>
        {selectedLectureId ? (
          renderQuizContent()
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--np-text-muted)' }}>
            Select a lecture above to take a quiz
          </div>
        )}
      </div>
    </div>
  );
}
