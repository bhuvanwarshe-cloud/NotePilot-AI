import path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';
import { validateYouTubeUrl } from './youtubeValidator';
import { fetchYouTubeMetadata } from './youtubeMetadata';
import { downloadAudio, cleanupTempFile } from './youtubeDownloader';
import { transcribe } from '../../services/transcription/transcription.service';
import { prepareMediaForTranscription } from '../../services/mediaPreparation.service';
import { saveTranscript } from '../../services/transcript/transcript.service';
import { updateLectureMetadata, updateLectureStatus } from '../../services/lecture.service';
import { updateAIJobStatus } from '../../services/aiJob.service';
import { log } from '../../utils/logger';

/**
 * youtubeProcessor.ts
 *
 * Pure orchestrator — no business logic, no SQL.
 * Transcript persistence delegated to TranscriptService.
 *
 * Pipeline:
 *   validate → metadata → download → transcribe → saveTranscript (via service) → cleanup
 */

const TEMP_DIR = path.resolve(__dirname, '../../../temp');

export interface YouTubeProcessorInput {
  url: string;
  lectureId: string;
  aiJobId: string;
  supabase: SupabaseClient;
}

export async function runYouTubeProcessor(input: YouTubeProcessorInput): Promise<void> {
  const { url, lectureId, aiJobId, supabase } = input;
  let tempFilePath: string | null = null;
  let currentStage = 'init';

  log.banner('YouTube Processor Started', {
    'Lecture ID': lectureId,
    'AI Job ID':  aiJobId,
    'URL':        url,
    'Temp Dir':   TEMP_DIR,
  });

  try {

    // ── Stage 1/5: Validate URL ───────────────────────────────────────────────
    currentStage = 'validating';
    log.stage(1, 5, 'Validating URL');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'validating', 5);

    const { videoId } = validateYouTubeUrl(url);
    log.success('YouTubeProcessor', 'URL validated', { 'Video ID': videoId });

    // ── Stage 2/5: Fetch Metadata ─────────────────────────────────────────────
    currentStage = 'fetching_metadata';
    log.stage(2, 5, 'Fetching Metadata');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'fetching_metadata', 15);

    const metadata = await fetchYouTubeMetadata(url);
    log.success('YouTubeProcessor', 'Metadata fetched', {
      'Title':    metadata.title,
      'Uploader': metadata.uploader,
      'Duration': `${metadata.durationSeconds}s`,
    });

    await updateLectureMetadata(supabase, lectureId, {
      title:        metadata.title,
      thumbnailUrl: metadata.thumbnailUrl,
    });
    log.success('YouTubeProcessor', 'Lecture metadata updated');

    // ── Stage 3/5: Download Audio ─────────────────────────────────────────────
    currentStage = 'downloading_audio';
    log.stage(3, 5, 'Downloading Audio');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'downloading_audio', 30);

    tempFilePath = await downloadAudio(url, videoId, TEMP_DIR);
    log.success('YouTubeProcessor', 'Audio downloaded', { 'File': tempFilePath });

    const preparedMedia = await prepareMediaForTranscription(tempFilePath, TEMP_DIR, videoId);
    tempFilePath = preparedMedia.normalizedPath;
    log.success('YouTubeProcessor', 'Media preparation complete', {
      'Normalized path': tempFilePath,
      'Chunk count': String(preparedMedia.chunkPaths.length),
      'Chunk duration': `${preparedMedia.chunkLengthSeconds}s`,
    });

    // ── Stage 4/5: Transcribe ─────────────────────────────────────────────────
    currentStage = 'transcribing';
    log.stage(4, 5, 'Transcribing Audio');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'transcribing', 55);

    const transcriptResult = await transcribe(tempFilePath);
    // Override source — GroqProvider defaults to 'audio'; YouTube is different
    transcriptResult.source = 'youtube';
    transcriptResult.metadata = {
      videoId,
      title:           metadata.title,
      uploader:        metadata.uploader,
      durationSeconds: metadata.durationSeconds,
    };
    log.success('YouTubeProcessor', 'Transcription complete', {
      'Language': transcriptResult.language,
      'Words':    transcriptResult.wordCount,
    });

    // ── Stage 5/5: Save Transcript (via TranscriptService) ────────────────────
    currentStage = 'saving_transcript';
    log.stage(5, 5, 'Saving Transcript');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'saving_transcript', 85);

    const { transcriptId } = await saveTranscript({
      supabase,
      lectureId,
      aiJobId,
      result: transcriptResult,
    });
    log.success('YouTubeProcessor', 'Transcript saved', { 'Transcript ID': transcriptId });

    log.banner('YouTube Processor Complete ✓', {
      'Lecture ID':    lectureId,
      'Transcript ID': transcriptId,
      'Language':      transcriptResult.language,
    });

  } catch (error: any) {
    log.error(
      'YouTubeProcessor',
      `Pipeline FAILED at stage: ${currentStage} | Lecture: ${lectureId} | Job: ${aiJobId}`,
      error
    );

    await updateAIJobStatus(supabase, aiJobId, 'failed', currentStage, 0, error?.message ?? 'Unknown error')
      .catch((e) => log.error('YouTubeProcessor', 'Could not update ai_job to failed', e));

    await updateLectureStatus(supabase, lectureId, 'failed')
      .catch((e) => log.error('YouTubeProcessor', 'Could not update lecture to failed', e));

  } finally {
    log.info('YouTubeProcessor', 'Cleanup');
    if (tempFilePath) {
      cleanupTempFile(tempFilePath);
    } else {
      log.info('YouTubeProcessor', 'No temp file to clean up');
    }
  }
}
