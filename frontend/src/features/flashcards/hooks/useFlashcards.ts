import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchFlashcardsForLecture,
  fetchAllFlashcardsForUser,
} from '@/features/flashcards/services/flashcards.service';
import type { Flashcard } from '@/features/flashcards/types';

interface UseFlashcardsReturn {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  currentIndex: number;
  isFlipped: boolean;
  activeLectureId: string | null;
  setCurrentIndex: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  flip: () => void;
  setFlipped: (flipped: boolean) => void;
  retry: () => void;
  setLectureId: (lectureId: string) => void;
}

export function useFlashcards(): UseFlashcardsReturn {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const lectureIdFromUrl = searchParams.get('lectureId');

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(
    lectureIdFromUrl
  );
  const [retryCounter, setRetryCounter] = useState(0);

  const retry = useCallback(() => {
    setRetryCounter((c) => c + 1);
  }, []);

  const setLectureId = useCallback(
    (lectureId: string) => {
      setActiveLectureId(lectureId);
      setCurrentIndex(0);
      setIsFlipped(false);
      // Persist to URL so page refresh restores the selection
      const next = new URLSearchParams(searchParams);
      next.set('lectureId', lectureId);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user?.id) {
        setFlashcards([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let cards: Flashcard[];
        if (activeLectureId) {
          cards = await fetchFlashcardsForLecture(activeLectureId);
        } else {
          cards = await fetchAllFlashcardsForUser(user.id);
        }

        if (!mounted) return;
        setFlashcards(cards);
        setCurrentIndex(0);
        setIsFlipped(false);
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load flashcards. Please try again.'
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user?.id, activeLectureId, retryCounter]);

  const goNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i + 1) % Math.max(flashcards.length, 1));
  }, [flashcards.length]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(
      (i) => (i - 1 + Math.max(flashcards.length, 1)) % Math.max(flashcards.length, 1)
    );
  }, [flashcards.length]);

  const flip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  return {
    flashcards,
    loading,
    error,
    currentIndex,
    isFlipped,
    activeLectureId,
    setCurrentIndex,
    goNext,
    goPrev,
    flip,
    setFlipped: setIsFlipped,
    retry,
    setLectureId,
  };
}
