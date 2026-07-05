import { SupabaseClient } from '@supabase/supabase-js';

export async function insertLecture(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  type: string,
  storagePath?: string
) {
  const { data, error } = await supabase
    .from('lectures')
    .insert({
      user_id: userId,
      title,
      type,
      status: 'uploaded',
      storage_path: storagePath || null,
      language: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert lecture: ${error.message}`);
  }

  return data;
}

export async function insertLectureFile(
  supabase: SupabaseClient,
  lectureId: string,
  originalFilename: string,
  bucketName: string,
  storagePath: string,
  mimeType: string,
  fileSize: number
) {
  const { data, error } = await supabase
    .from('lecture_files')
    .insert({
      lecture_id: lectureId,
      original_filename: originalFilename,
      bucket_name: bucketName,
      storage_path: storagePath,
      file_type: mimeType,
      file_size: fileSize,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert lecture file: ${error.message}`);
  }

  return data;
}

export async function deleteLecture(supabase: SupabaseClient, lectureId: string) {
  const { error } = await supabase.from('lectures').delete().eq('id', lectureId);
  if (error) {
    console.error(`Failed to delete lecture ${lectureId}:`, error);
  }
}

/**
 * Updates a lecture's metadata fields fetched from the YouTube video.
 * Called after youtubeMetadata.ts resolves, before audio download begins.
 */
export async function updateLectureMetadata(
  supabase: SupabaseClient,
  lectureId: string,
  meta: { title?: string; thumbnailUrl?: string }
) {
  const updates: Record<string, unknown> = {};
  if (meta.title) updates.title = meta.title;
  if (meta.thumbnailUrl) updates.thumbnail_url = meta.thumbnailUrl;

  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from('lectures')
    .update(updates)
    .eq('id', lectureId);

  if (error) {
    throw new Error(`Failed to update lecture metadata: ${error.message}`);
  }
}

/**
 * Updates a lecture's status and optionally its detected language.
 * Called at the end of a successful processor run (status='transcribed')
 * or on failure.
 */
export async function updateLectureStatus(
  supabase: SupabaseClient,
  lectureId: string,
  status: string,
  language?: string
) {
  const updates: Record<string, unknown> = { status };
  if (language) updates.language = language;

  const { error } = await supabase
    .from('lectures')
    .update(updates)
    .eq('id', lectureId);

  if (error) {
    throw new Error(`Failed to update lecture status: ${error.message}`);
  }
}
