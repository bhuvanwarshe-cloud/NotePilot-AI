import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchStudyLecturesForUser } from '@/features/study/services/lectures.service';
import type { StudyLecture } from '@/features/study/types';

export function useStudyLectures() {
  const { user } = useAuth();

  const [lectures, setLectures] = useState<StudyLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const lectureIdFromUrl = searchParams.get('lectureId');

  const [selectedLectureId, setSelectedLectureIdState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [view, setView] = useState<'list' | 'reader'>('list');

  useEffect(() => {
    let mounted = true;

    async function loadLectures() {
      if (!user?.id) {
        setLectures([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchStudyLecturesForUser(user.id);
        if (!mounted) return;
        setLectures(data);

        let initialLectureId = selectedLectureId;

        if (lectureIdFromUrl) {
          const matchingLecture = data.find(l => l.id === lectureIdFromUrl);
          if (matchingLecture) {
            initialLectureId = matchingLecture.id;
            // Clean up URL after grabbing the ID
            searchParams.delete('lectureId');
            setSearchParams(searchParams, { replace: true });
          }
        }

        const newSelectedId = initialLectureId && data.some((l) => l.id === initialLectureId)
          ? initialLectureId
          : data[0]?.id ?? null;

        setSelectedLectureIdState(newSelectedId);
        if (newSelectedId) {
          setView('reader');
        } else {
          setView('list');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load lectures.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadLectures();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const filteredLectures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = lectures.filter((lecture) => {
      if (!query) return true;
      return [
        lecture.title,
        lecture.type,
        lecture.language,
      ].some((value) => value?.toLowerCase().includes(query));
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortOrder === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    return sorted;
  }, [lectures, searchQuery, sortOrder]);

  const selectedLecture = useMemo(
    () => filteredLectures.find((l) => l.id === selectedLectureId) ?? filteredLectures[0] ?? null,
    [filteredLectures, selectedLectureId]
  );

  const setSelectedLectureId = (id: string) => {
    setSelectedLectureIdState(id);
    setView('reader');
  };

  return {
    lectures: filteredLectures,
    selectedLecture,
    loading,
    error,
    selectedLectureId,
    searchQuery,
    sortOrder,
    view,
    setSelectedLectureId,
    setSearchQuery,
    setSortOrder,
    setView,
  };
}
