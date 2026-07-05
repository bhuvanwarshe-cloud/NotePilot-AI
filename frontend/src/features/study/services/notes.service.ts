import { supabase } from '@/lib/supabase';
import type { StudyNote } from '@/features/study/types';

function estimateReadingTime(wordCount: number) {
  if (!wordCount) return 1;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function countOccurrences(text: string, token: string) {
  return (text.match(new RegExp(token, 'gi')) || []).length;
}

function normalizeLectureType(type?: string | null) {
  if (!type) return 'Lecture';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function normalizeStatus(status?: string | null) {
  if (!status) return 'completed';
  return status;
}

export async function fetchStudyNotesForUser(userId: string): Promise<StudyNote[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      content,
      status,
      created_at,
      updated_at,
      generated_by,
      lecture_id,
      lectures!inner (
        id,
        title,
        type,
        thumbnail_url,
        language,
        created_at,
        status
      )
    `)
    .eq('lectures.user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: {
    id: string;
    title: string | null;
    content: string | null;
    status: string | null;
    created_at: string;
    updated_at: string | null;
    generated_by: string | null;
    lecture_id: string;
    lectures: {
      id: string;
      title: string | null;
      type: string | null;
      thumbnail_url: string | null;
      language: string | null;
      created_at: string;
      status: string | null;
    } | {
      id: string;
      title: string | null;
      type: string | null;
      thumbnail_url: string | null;
      language: string | null;
      created_at: string;
      status: string | null;
    }[];
  }) => {
    const lecture = Array.isArray(row.lectures) ? row.lectures[0] : row.lectures;
    const markdown = row.content || '';
    const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = estimateReadingTime(wordCount);
    const definitions = countOccurrences(markdown, 'Definition') + countOccurrences(markdown, 'definition');
    const headings = (markdown.match(/^#{1,6}\s+/gm) || []).length;
    const lists = (markdown.match(/^[\s-]*[-*+]\s+/gm) || []).length + (markdown.match(/^\d+\.\s+/gm) || []).length;
    const codeBlocks = (markdown.match(/```/g) || []).length;
    const tables = (markdown.match(/^\|.*\|.*$/gm) || []).length;
    const revisionTime = Math.max(2, Math.round(readingTime * 1.2));

    return {
      id: row.id,
      lectureId: row.lecture_id,
      lectureTitle: lecture?.title || 'Untitled Lecture',
      lectureType: normalizeLectureType(lecture?.type),
      lectureThumbnailUrl: lecture?.thumbnail_url || null,
      language: lecture?.language || 'en',
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined,
      status: normalizeStatus(row.status),
      provider: row.generated_by || null,
      markdown,
      readingTime,
      wordCount,
      headings,
      lists,
      codeBlocks,
      tables,
      definitions,
      revisionTime,
      isFavorite: false,
    } satisfies StudyNote;
  });
}

