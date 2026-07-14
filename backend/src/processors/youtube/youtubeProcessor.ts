/**
 * youtubeProcessor.ts
 *
 * Orchestrator for the YouTube transcript pipeline.
 *
 * Pipeline:
 *   1. Validate URL → build YouTubeVideoContext (canonical URL, no tracking params)
 *   2. oEmbed metadata → update lecture card (non-fatal if fails)
 *   3. Transcript router → always returns a result, never throws
 *   4a. result.metadata.manualActionRequired === true
 *         → ai_jobs.status = 'failed'
 *            ai_jobs.metadata includes { manualActionRequired, reason, retryable, recovery, userMessage }
 *            lectures.status = 'failed'
 *            saveTranscript() is NOT called
 *   4b. Normal path → saveTranscript()
 *
 * Logging at every stage:
 *   Original URL, Canonical URL, Video ID, Selected Provider,
 *   Failure Reason, Retryable, Recovery Method
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { validateYouTubeUrl, buildVideoContext } from './youtubeValidator';
import { YouTubeOEmbedMetadataProvider } from './providers/youtubeOEmbedMetadataProvider';
import { extractYouTubeTranscript } from './youtubeTranscriptRouter';
import type { YouTubeVideoContext } from './providers/types';
import { saveTranscript } from '../../services/transcript/transcript.service';
import { updateLectureMetadata, updateLectureStatus } from '../../services/lecture.service';
import { updateAIJobStatus } from '../../services/aiJob.service';
import { log } from '../../utils/logger';

export interface YouTubeProcessorInput {
  url: string;
  lectureId: string;
  aiJobId: string;
  supabase: SupabaseClient;
}

const metadataProvider = new YouTubeOEmbedMetadataProvider();

export async function runYouTubeProcessor(input: YouTubeProcessorInput): Promise<void> {
  const { url, lectureId, aiJobId, supabase } = input;
  let currentStage = 'init';
  let context: YouTubeVideoContext | null = null;

  log.banner('YouTube Processor Started', {
    'Lecture ID':   lectureId,
    'AI Job ID':    aiJobId,
    'Original URL': url,
    'Pipeline':     'Caption-First, Always-Recoverable',
  });

  const onStage = async (stage: string, progress: number) => {
    currentStage = stage;
    await updateAIJobStatus(supabase, aiJobId, 'processing', stage, progress);
  };

  try {

    // ── Stage 1: Validate + canonicalize URL ─────────────────────────────────
    await onStage('validating', 5);
    log.stage(1, 4, 'Validating URL + Building Context');

    const { videoId } = validateYouTubeUrl(url);
    context = buildVideoContext(url, videoId) as YouTubeVideoContext;

    log.success('YouTubeProcessor', 'URL validated and context built', {
      'Video ID':     context.videoId,
      'Original URL': context.originalUrl,
      'Canonical URL': context.canonicalUrl,
    });

    // ── Stage 2: Quick metadata (oEmbed) ─────────────────────────────────────
    await onStage('fetching_metadata', 10);
    log.stage(2, 4, 'Fetching metadata (oEmbed — no yt-dlp)');

    try {
      const metadata = await metadataProvider.fetchMetadata(context);
      await updateLectureMetadata(supabase, lectureId, {
        title:        metadata.title,
        thumbnailUrl: metadata.thumbnailUrl,
      });
      log.success('YouTubeProcessor', 'Lecture card updated with real metadata', {
        'Title': metadata.title,
        'Thumb': metadata.thumbnailUrl ? 'yes' : 'no',
      });
    } catch (metaErr) {
      log.warn(
        'YouTubeProcessor',
        `oEmbed metadata fetch failed (non-fatal): ${metaErr instanceof Error ? metaErr.message : String(metaErr)}`
      );
    }

    // ── Stage 3: Extract transcript via router ───────────────────────────────
    log.stage(3, 4, 'Extracting transcript (provider router)');

    const transcriptResult = await extractYouTubeTranscript(context, onStage);

    // ── Stage 4a: Manual action required (recoverable failure) ───────────────
    if (transcriptResult.metadata?.manualActionRequired === true) {
      const reason    = String(transcriptResult.metadata.reason   ?? 'unknown');
      const userMsg   = String(transcriptResult.metadata.userMessage ?? 'Manual resolution required.');
      const retryable = Boolean(transcriptResult.metadata.retryable ?? true);
      const recovery  = String(transcriptResult.metadata.recovery   ?? 'audio_upload');

      log.warn(
        'YouTubeProcessor',
        `Manual action required. ` +
        `Video: ${context.videoId} | Reason: ${reason} | ` +
        `Retryable: ${retryable} | Recovery: ${recovery}`
      );

      // Store all structured fields in ai_jobs.metadata.
      // Status stays as 'failed' — within the existing Postgres enum.
      // The frontend reads metadata.manualActionRequired to render the recovery UI.
      await updateAIJobStatus(
        supabase, aiJobId,
        'failed',
        'manual_action_required', // stage label (a string, not an enum)
        0,
        userMsg,
        {
          manualActionRequired: true,
          reason,
          retryable,
          recovery,
          userMessage: userMsg,
          videoId:     context.videoId,
          canonicalUrl: context.canonicalUrl,
        }
      ).catch((e) => log.error('YouTubeProcessor', 'Could not update ai_job (manual_action_required)', e));

      await updateLectureStatus(supabase, lectureId, 'failed')
        .catch((e) => log.error('YouTubeProcessor', 'Could not update lecture status to failed', e));

      log.banner('YouTube Processor — Manual Action Required', {
        'Lecture ID':   lectureId,
        'Video ID':     context.videoId,
        'Canonical URL': context.canonicalUrl,
        'Reason':       reason,
        'Retryable':    retryable,
        'Recovery':     recovery,
        'User message': userMsg.slice(0, 90) + (userMsg.length > 90 ? '…' : ''),
      });

      return;
    }

    // ── Stage 4b: Save transcript (normal path) ──────────────────────────────
    await onStage('saving_transcript', 85);
    log.stage(4, 4, 'Saving Transcript');

    const { transcriptId } = await saveTranscript({
      supabase,
      lectureId,
      aiJobId,
      result: transcriptResult,
    });

    log.banner('YouTube Processor Complete ✓', {
      'Lecture ID':        lectureId,
      'Transcript ID':     transcriptId,
      'Video ID':          context?.videoId ?? '(unknown)',
      'Canonical URL':     context?.canonicalUrl ?? '(unknown)',
      'Language':          transcriptResult.language,
      'Transcript source': String(transcriptResult.metadata?.transcriptSource ?? 'unknown'),
      'Provider':          transcriptResult.provider,
    });

  } catch (error: unknown) {
    // Only true infrastructure errors reach here (Supabase down, invalid URL, etc.)
    const message = error instanceof Error ? error.message : String(error);
    log.error('YouTubeProcessor', `Unrecoverable error at stage: ${currentStage}`, error);

    await updateAIJobStatus(supabase, aiJobId, 'failed', currentStage, 0, message)
      .catch((e) => log.error('YouTubeProcessor', 'Could not update ai_job to failed', e));

    await updateLectureStatus(supabase, lectureId, 'failed')
      .catch((e) => log.error('YouTubeProcessor', 'Could not update lecture to failed', e));
  }
}
