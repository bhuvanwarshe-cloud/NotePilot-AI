import { SupabaseClient } from '@supabase/supabase-js';
import { uploadFileToStorage, deleteFileFromStorage } from './storage.service';
import { insertLecture, insertLectureFile, deleteLecture } from './lecture.service';
import { createAIJob } from './aiJob.service';

export async function processUpload(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  source: string,
  processorKey: string,
  inputType: string,
  file?: Express.Multer.File,
  text?: string,
  url?: string
) {
  let storageResult = null;
  let lectureResult = null;

  try {
    // 1. Upload to Storage (if applicable)
    if (file) {
      storageResult = await uploadFileToStorage(supabase, file, userId);
    }

    // 2. Insert Lecture
    // For YouTube, we store the URL in storagePath
    const storagePath = storageResult ? storageResult.storagePath : (url || undefined);
    lectureResult = await insertLecture(supabase, userId, title, source, storagePath);

    // 3. Insert Lecture File (if applicable)
    if (file && storageResult) {
      await insertLectureFile(
        supabase,
        lectureResult.id,
        file.originalname,
        storageResult.bucket,
        storageResult.storagePath,
        storageResult.mimeType,
        storageResult.fileSize
      );
    }

    // 4. Create AI Job
    const aiJob = await createAIJob(
      supabase,
      userId,
      lectureResult.id,
      source,
      processorKey,
      inputType,
      text
    );

    return {
      lectureId: lectureResult.id,
      title: lectureResult.title,
      status: lectureResult.status,
      createdAt: lectureResult.created_at,
      source,
      aiJobId: aiJob.id
    };

  } catch (error) {
    // ROLLBACK
    console.error('Upload transaction failed, rolling back...', error);
    
    // Note: Due to ON DELETE CASCADE on the database, deleting the lecture 
    // will automatically delete the lecture_files and ai_jobs records if they exist.
    if (lectureResult) {
      await deleteLecture(supabase, lectureResult.id).catch(console.error);
    }
    
    if (storageResult) {
      await deleteFileFromStorage(supabase, storageResult.bucket, storageResult.storagePath).catch(console.error);
    }

    throw error;
  }
}
