import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { fetchStudyNotesForUser } from '@/features/study/services/notes.service';
import type { StudyNote, StudyWorkspaceState } from '@/features/study/types';

export function useStudyNotes() {
  const { user } = useAuth();

  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const lectureIdFromUrl = searchParams.get('lectureId');

  const [workspaceState, setWorkspaceState] = useState<StudyWorkspaceState>({
    selectedNoteId: null,
    searchQuery: '',
    sortOrder: 'newest',
    view: 'list',
  });

  useEffect(() => {
    let mounted = true;

    async function loadNotes() {
      if (!user?.id) {
        setNotes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchStudyNotesForUser(user.id);
        if (!mounted) return;
        setNotes(data);
        
        setWorkspaceState((current) => {
          let initialNoteId = current.selectedNoteId;
          
          if (lectureIdFromUrl) {
            const noteForLecture = data.find(n => n.lectureId === lectureIdFromUrl);
            if (noteForLecture) {
              initialNoteId = noteForLecture.id;
              // Clean up URL after grabbing the ID
              searchParams.delete('lectureId');
              setSearchParams(searchParams, { replace: true });
            }
          }
          
          return {
            ...current,
            selectedNoteId: initialNoteId && data.some((note) => note.id === initialNoteId)
              ? initialNoteId
              : data[0]?.id ?? null,
            view: initialNoteId ? 'reader' : 'list',
          };
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load study notes.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadNotes();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !workspaceState.selectedNoteId) return;

    const selectedNote = notes.find((note) => note.id === workspaceState.selectedNoteId);
    if (!selectedNote) return;

    void supabase.from('study_sessions').insert({
      user_id: user.id,
      lecture_id: selectedNote.lectureId,
      duration_minutes: 0,
      created_at: new Date().toISOString(),
    });
  }, [user?.id, workspaceState.selectedNoteId, notes]);

  const filteredNotes = useMemo(() => {
    const query = workspaceState.searchQuery.trim().toLowerCase();

    const filtered = notes.filter((note) => {
      if (!query) return true;
      return [
        note.lectureTitle,
        note.markdown,
        note.lectureType,
        note.language,
        note.provider,
      ].some((value) => value?.toLowerCase().includes(query));
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (workspaceState.sortOrder === 'alphabetical') {
        return a.lectureTitle.localeCompare(b.lectureTitle);
      }
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return workspaceState.sortOrder === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    return sorted;
  }, [notes, workspaceState.searchQuery, workspaceState.sortOrder]);

  const selectedNote = useMemo(
    () => filteredNotes.find((note) => note.id === workspaceState.selectedNoteId) ?? filteredNotes[0] ?? null,
    [filteredNotes, workspaceState.selectedNoteId]
  );

  const setSelectedNoteId = (noteId: string) => {
    setWorkspaceState((current) => ({ ...current, selectedNoteId: noteId, view: 'reader' }));
  };

  const setSearchQuery = (value: string) => {
    setWorkspaceState((current) => ({ ...current, searchQuery: value }));
  };

  const setSortOrder = (value: StudyWorkspaceState['sortOrder']) => {
    setWorkspaceState((current) => ({ ...current, sortOrder: value }));
  };

  const setView = (view: StudyWorkspaceState['view']) => {
    setWorkspaceState((current) => ({ ...current, view }));
  };

  return {
    notes: filteredNotes,
    selectedNote,
    loading,
    error,
    selectedNoteId: workspaceState.selectedNoteId,
    searchQuery: workspaceState.searchQuery,
    sortOrder: workspaceState.sortOrder,
    view: workspaceState.view,
    setSelectedNoteId,
    setSearchQuery,
    setSortOrder,
    setView,
  };
}
