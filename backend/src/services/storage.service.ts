import { SupabaseClient } from '@supabase/supabase-js';

export async function uploadFileToStorage(
  supabase: SupabaseClient,
  file: Express.Multer.File,
  userId: string
): Promise<{ storagePath: string; bucket: string; fileSize: number; mimeType: string }> {
  const bucket = 'lecture-files';
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const storagePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return {
    storagePath,
    bucket,
    fileSize: file.size,
    mimeType: file.mimetype,
  };
}

export async function deleteFileFromStorage(
  supabase: SupabaseClient,
  bucket: string,
  storagePath: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) {
    console.error(`Failed to delete file ${storagePath} from bucket ${bucket}:`, error);
  }
}
