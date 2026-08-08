import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchQuizForLecture } from '../services/quizzes.service';
import type { QuizWithQuestions } from '../types';

export function useQuizzes(lectureId: string | null) {
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);

  const retry = useCallback(() => {
    setRetryCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user?.id || !lectureId) {
        setQuiz(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedQuiz = await fetchQuizForLecture(lectureId);

        if (!mounted) return;
        setQuiz(fetchedQuiz);
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load quiz. Please try again.'
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user?.id, lectureId, retryCounter]);

  return {
    quiz,
    loading,
    error,
    retry,
  };
}
