import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks } from 'lucide-react';

import { useStudyLectures } from '@/features/study/hooks/useStudyLectures';
import { StudySidebar } from '@/features/study/components/StudySidebar';
import { EmptyState as GlobalEmptyState } from '@/features/study/components/EmptyState';
import { LoadingState } from '@/features/study/components/LoadingState';
import { ErrorState } from '@/features/study/components/ErrorState';

import { useQuizzes } from '@/features/quizzes/hooks/useQuizzes';
import { QuizOverview } from '@/features/quizzes/components/QuizOverview';
import { QuizViewer } from '@/features/quizzes/components/QuizViewer';
import { QuizResults } from '@/features/quizzes/components/QuizResults';
import { QuizEmpty } from '@/features/quizzes/components/QuizEmpty';
import { QuizLoading } from '@/features/quizzes/components/QuizLoading';
import { QuizError } from '@/features/quizzes/components/QuizError';

export function QuizzesPage() {
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

  const { quiz, loading: quizLoading, error: quizError, retry } = useQuizzes(selectedLectureId);

  const [isMobile, setIsMobile] = useState(false);
  const [quizState, setQuizState] = useState<'overview' | 'playing' | 'results'>('overview');
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setQuizState('overview');
    setScore(0);
    setUserAnswers({});
  }, [selectedLectureId]);

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

  const renderQuizContent = () => {
    if (quizLoading) return <QuizLoading />;
    if (quizError) return <QuizError message={quizError} onRetry={retry} />;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return <QuizEmpty />;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, height: '100%' }}>
        {/* Page Header (Only show when not playing/results to keep it clean) */}
        {quizState === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
          >
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
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, var(--np-purple), var(--np-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}>
                  <ListChecks size={18} color="#fff" />
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--np-text-primary)', letterSpacing: '-0.02em' }}>
                  Quizzes
                </h1>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Quiz Area */}
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {quizState === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <QuizOverview 
                  quiz={quiz} 
                  onStart={() => setQuizState('playing')} 
                />
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

  return (
    <div style={{ padding: '24px 20px 40px', maxWidth: 1500, margin: '0 auto', width: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ ...layoutStyles, height: '100%' }}
      >
        {(isMobile ? view === 'list' : true) && (
          <div style={{ minWidth: 0, height: '100%' }}>
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
          <div style={{ minWidth: 0, height: '100%' }}>
            {selectedLectureId ? (
              renderQuizContent()
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--np-text-muted)' }}>
                Select a lecture to take a quiz
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
