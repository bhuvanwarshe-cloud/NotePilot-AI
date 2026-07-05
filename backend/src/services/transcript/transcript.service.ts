import { SupabaseClient } from '@supabase/supabase-js';
import type { TranscriptResult } from '../transcription/types';
import { insertTranscript } from '../../repositories/transcript.repository';
import { updateLectureStatus } from '../lecture.service';
import { createAIJob, updateAIJobStatus } from '../aiJob.service';
import { log } from '../../utils/logger';
import { generateNotesFromTranscript } from '../knowledge/knowledge.service';

/**
 * TranscriptService
 *
 * The single owner of ALL transcript persistence and status-update logic.
 *
 * Every processor (YouTube, Audio, Video, PDF, OCR, Text) produces a
 * TranscriptResult and calls saveTranscript(). Nothing else is needed.
 *
 * Responsibilities:
 *  1. INSERT transcript row (via repository)
 *  2. Update lecture.status → 'transcribed'
 *  3. Update lecture.language
 *  4. Update ai_job → completed / done / 100%
 *
 * Zero duplication across processors.
 */

export interface SaveTranscriptOptions {
  supabase:   SupabaseClient;
  lectureId:  string;
  aiJobId:    string;
  result:     TranscriptResult;
}

export async function saveTranscript(opts: SaveTranscriptOptions): Promise<{ transcriptId: string }> {
  const { supabase, lectureId, aiJobId, result } = opts;

  // ── 1. Persist transcript ─────────────────────────────────────────────────
  log.info('TranscriptService', 'Persisting transcript', {
    'Lecture ID': lectureId,
    'Source':     result.source,
    'Provider':   result.provider,
    'Language':   result.language,
    'Words':      result.wordCount,
    'Duration':   `${result.durationSeconds}s`,
  });

  const { id: transcriptId } = await insertTranscript(supabase, lectureId, result);
  log.success('TranscriptService', 'Transcript persisted', { 'Transcript ID': transcriptId });

  // ── 2. Update lecture status + language ───────────────────────────────────
  log.info('TranscriptService', 'Updating lecture → transcribed');
  await updateLectureStatus(supabase, lectureId, 'transcribed', result.language);
  log.success('TranscriptService', 'Lecture status updated', {
    'Status':   'transcribed',
    'Language': result.language,
  });

  // ── 3. Mark transcription AI job complete ─────────────────────────────────
  log.info('TranscriptService', 'Marking transcription AI job → completed / done / 100%');
  await updateAIJobStatus(supabase, aiJobId, 'completed', 'done', 100);
  log.success('TranscriptService', 'Transcription AI job completed');

  // ── 4. Trigger knowledge generation in the background ─────────────────────
  try {
    const { data: parentJob } = await supabase
      .from('ai_jobs')
      .select('user_id')
      .eq('id', aiJobId)
      .single();

    const userId = (parentJob as { user_id?: string } | null)?.user_id;
    if (!userId) {
      throw new Error('Could not resolve user id for notes AI job creation');
    }

    const notesJob = await createAIJob(
      supabase,
      userId,
      lectureId,
      result.source,
      'knowledgeEngine',
      'transcript',
      undefined,
      'notes',
      {
        transcriptId,
        provider: result.provider,
        language: result.language,
        source: result.source,
      }
    );

    log.info('TranscriptService', 'Created notes AI job', { 'Notes AI Job ID': notesJob.id });

    void generateNotesFromTranscript({
      supabase,
      lectureId,
      aiJobId: notesJob.id,
      input: {
        lectureId,
        title: undefined,
        transcriptText: result.text,
        language: result.language,
        source: result.source,
        metadata: {
          transcriptId,
          provider: result.provider,
          source: result.source,
          wordCount: result.wordCount,
        },
      },
    }).catch((error) => {
      log.error('TranscriptService', 'Knowledge generation failed after transcript save', error);
    });
  } catch (error) {
    log.error('TranscriptService', 'Could not start knowledge generation pipeline', error);
  }

  return { transcriptId };
}
