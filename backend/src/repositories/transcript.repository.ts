import { SupabaseClient } from '@supabase/supabase-js';
import type { TranscriptResult } from '../services/transcription/types';
import { log } from '../utils/logger';

/**
 * transcript.repository.ts
 *
 * Single responsibility: persist a transcript record to PostgreSQL.
 * Does NOT call any external APIs. Does NOT touch Storage.
 * The transcripts table is the single source of truth for all transcript content.
 */

export async function insertTranscript(
  supabase: SupabaseClient,
  lectureId: string,
  result: TranscriptResult
): Promise<{ id: string }> {

  log.info('TranscriptRepo', 'Inserting transcript into database', {
    'Lecture ID':   lectureId,
    'Word count':   result.wordCount,
    'Char count':   result.charCount,
    'Language':     result.language,
    'Duration':     `${result.durationSeconds}s`,
    'Process time': `${result.processingTimeMs}ms`,
    'Content len':  result.text.length,
  });

  const { data, error } = await supabase
    .from('transcripts')
    .insert({
      lecture_id:      lectureId,
      content:         result.text,
      word_count:      result.wordCount,
      processing_time: result.processingTimeMs,
    })
    .select('id')
    .single();

  if (error) {
    log.error('TranscriptRepo', 'INSERT failed', {
      message: error.message,
      code:    error.code,
      details: error.details,
      hint:    error.hint,
    } as any);
    throw new Error(`Failed to insert transcript: ${error.message} (code: ${error.code})`);
  }

  log.success('TranscriptRepo', 'Transcript row inserted', {
    'Transcript ID': (data as any).id,
    'Lecture ID':    lectureId,
    'Word count':    result.wordCount,
  });

  return data as { id: string };
}
