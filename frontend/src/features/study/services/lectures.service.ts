import { supabase } from '@/lib/supabase';
import type { StudyLecture } from '@/features/study/types';

function normalizeLectureType(type?: string | null) {
  if (!type) return 'Lecture';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function normalizeStatus(status?: string | null) {
  if (!status) return 'completed';
  return status;
}

export async function fetchStudyLecturesForUser(userId: string): Promise<StudyLecture[]> {
  const { data, error } = await supabase
    .from('lectures')
    .select(`
      id,
      title,
      type,
      thumbnail_url,
      language,
      created_at,
      status
    `)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title || 'Untitled Lecture',
    type: normalizeLectureType(row.type),
    thumbnailUrl: row.thumbnail_url || null,
    language: row.language || 'en',
    createdAt: row.created_at,
    status: normalizeStatus(row.status),
  }));
}
