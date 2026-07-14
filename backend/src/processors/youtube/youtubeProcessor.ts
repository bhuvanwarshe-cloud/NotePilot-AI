/**
 * youtubeProcessor.ts
 *
 * Pure orchestrator for the YouTube transcript pipeline.
 *
 * Pipeline (Caption-First, always-recoverable):
 *   1. Validate URL
 *   2. Quick metadata via oEmbed (immediately updates lecture card — no yt-dlp)
 *   3. YouTubeTranscriptRouter → always returns a TranscriptResult, never throws
 *   4a. If result.metadata.manualResolutionRequired === true:
 *         → set ai_jobs.status = 'manual_action_required'
 *         → set lectures.status = 'manual_action_required'
 *         → do NOT call saveTranscript()
 *   4b. Otherwise:
 *         → saveTranscript() (triggers Knowledge Engine)
 *
 * The processor never catches YouTubeBlockedError — the router now handles it
 * internally and returns a ManualResolutionProvider result instead of throwing.
 *
 * Two terminal states:
 *   completed              — transcript extracted, notes pipeline started
 *   manual_action_required — recoverable; user shown a specific reason + recovery path
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { validateYouTubeUrl } from './youtubeValidator';
import { YouTubeOEmbedMetadataProvider } from './providers/youtubeOEmbedMetadataProvider';
import { extractYouTubeTranscript } from './youtubeTranscriptRouter';
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

  log.banner('YouTube Processor Started', {
    'Lecture ID': lectureId,
    'AI Job ID':  aiJobId,
    'URL':        url,
    'Pipeline':   'Caption-First, Always-Recoverable (oEmbed → Router → ManualResolution)',
  });

  /** Helper: update AI job stage + progress in one call */
  const onStage = async (stage: string, progress: number) => {
    currentStage = stage;
    await updateAIJobStatus(supabase, aiJobId, 'processing', stage, progress);
  };

  try {

    // ── Stage 1: Validate URL ────────────────────────────────────────────────
    await onStage('validating', 5);
    log.stage(1, 4, 'Validating URL');

    const { videoId } = validateYouTubeUrl(url);
    log.success('YouTubeProcessor', 'URL validated', { 'Video ID': videoId });

    // ── Stage 2: Quick metadata (oEmbed — no yt-dlp) ────────────────────────
    await onStage('fetching_metadata', 10);
    log.stage(2, 4, 'Fetching metadata (oEmbed)');

    try {
      const metadata = await metadataProvider.fetchMetadata(url, videoId);
      await updateLectureMetadata(supabase, lectureId, {
        title:        metadata.title,
        thumbnailUrl: metadata.thumbnailUrl,
      });
      log.success('YouTubeProcessor', 'Metadata applied to lecture', {
        'Title': metadata.title,
        'Thumb': metadata.thumbnailUrl ? 'yes' : 'no',
      });
    } catch (metaErr) {
      log.warn('YouTubeProcessor', `oEmbed metadata fetch failed (non-fatal): ${metaErr instanceof Error ? metaErr.message : String(metaErr)}`);
    }

    // ── Stage 3: Extract transcript — router always returns, never throws ────
    log.stage(3, 4, 'Extracting transcript (router)');

    const transcriptResult = await extractYouTubeTranscript(videoId, url, onStage);

    // ── Stage 4a: Manual action required (recoverable) ───────────────────────
    if (transcriptResult.metadata?.manualResolutionRequired === true) {
      const reason   = String(transcriptResult.metadata.reason   ?? 'unknown');
      const userMsg  = String(transcriptResult.metadata.userMessage ?? 'Manual resolution required.');
      const recovery = String(transcriptResult.metadata.recoveryPath ?? 'audio_upload');

      log.warn(
        'YouTubeProcessor',
        `Manual resolution required for lecture ${lectureId}. Reason: ${reason}. Recovery: ${recovery}`
      );

      await updateAIJobStatus(
        supabase, aiJobId,
        'manual_action_required',
        'manual_action_required',
        0,
        userMsg
      ).catch((e) => log.error('YouTubeProcessor', 'Could not update ai_job to manual_action_required', e));

      await updateLectureStatus(supabase, lectureId, 'manual_action_required')
        .catch((e) => log.error('YouTubeProcessor', 'Could not update lecture to manual_action_required', e));

      log.banner('YouTube Processor — Manual Action Required', {
        'Lecture ID':   lectureId,
        'Reason':       reason,
        'Recovery':     recovery,
        'User message': userMsg.slice(0, 80) + (userMsg.length > 80 ? '…' : ''),
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
      'Language':          transcriptResult.language,
      'Transcript source': String(transcriptResult.metadata?.transcriptSource ?? 'unknown'),
      'Provider':          transcriptResult.provider,
    });

  } catch (error: unknown) {
    // This catch handles only genuine infrastructure errors (e.g. Supabase down,
    // URL validation failure). Provider-level failures are fully handled by the router.
    const message = error instanceof Error ? error.message : String(error);
    log.error('YouTubeProcessor', `Unrecoverable pipeline error at stage: ${currentStage}`, error);

    await updateAIJobStatus(supabase, aiJobId, 'failed', currentStage, 0, message)
      .catch((e) => log.error('YouTubeProcessor', 'Could not update ai_job to failed', e));

    await updateLectureStatus(supabase, lectureId, 'failed')
      .catch((e) => log.error('YouTubeProcessor', 'Could not update lecture to failed', e));
  }
}
