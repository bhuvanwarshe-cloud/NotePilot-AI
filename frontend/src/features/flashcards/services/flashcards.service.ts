import { supabase } from '@/lib/supabase';
import type { Flashcard } from '@/features/flashcards/types';

/**
 * Fetches all flashcards for a given lecture, sorted by order_index ASC.
 * Uses RLS — user must be authenticated and own the parent lecture.
 */
export async function fetchFlashcardsForLecture(lectureId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('id, front, back, difficulty, order_index, generated_by, status, lecture_id')
    .eq('lecture_id', lectureId)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    id: row.id as string,
    front: row.front as string,
    back: row.back as string,
    difficulty: (row.difficulty ?? 1) as 1 | 2 | 3,
    order_index: (row.order_index ?? 0) as number,
    generated_by: (row.generated_by ?? '') as string,
    status: (row.status ?? 'completed') as string,
    lecture_id: row.lecture_id as string,
  }));
}

/**
 * Fetches all flashcards that belong to lectures owned by the given user.
 * Groups cards by lecture_id so the UI can show per-lecture sets.
 * Sorted by order_index ASC within each lecture.
 */
export async function fetchAllFlashcardsForUser(userId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select(`
      id,
      front,
      back,
      difficulty,
      order_index,
      generated_by,
      status,
      lecture_id,
      lectures!inner (
        user_id
      )
    `)
    .eq('lectures.user_id', userId)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    id: row.id as string,
    front: row.front as string,
    back: row.back as string,
    difficulty: (row.difficulty ?? 1) as 1 | 2 | 3,
    order_index: (row.order_index ?? 0) as number,
    generated_by: (row.generated_by ?? '') as string,
    status: (row.status ?? 'completed') as string,
    lecture_id: row.lecture_id as string,
  }));
}
