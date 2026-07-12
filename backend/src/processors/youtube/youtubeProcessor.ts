/**
 * youtubeProcessor.ts
 *
 * Pure orchestrator for the YouTube transcript pipeline.
 *
 * New pipeline (Caption-First):
 *   1. Validate URL
 *   2. Quick metadata via oEmbed (immediately updates lecture card — no yt-dlp)
 *   3. YouTubeTranscriptRouter (CaptionProvider → YtDlpWhisperProvider)
 *   4. Save Transcript (via TranscriptService — unchanged)
 *
 * Error handling:
 *   - YouTubeBlockedError → status='manual_action_required' (recoverable)
 *   - Any other error    → status='failed' (unrecoverable)
 *
 * The processor knows nothing about how the transcript was extracted.
 * That detail lives entirely in the router and providers.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { validateYouTubeUrl } from './youtubeValidator';
import { YouTubeOEmbedMetadataProvider } from './providers/youtubeOEmbedMetadataProvider';
import { extractYouTubeTranscript } from './youtubeTranscriptRouter';
import { YouTubeBlockedError } from './providers/types';
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
    'Pipeline':   'Caption-First (oEmbed → CaptionProvider → YtDlpWhisper)',
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

    // ── Stage 2: Quick metadata (oEmbed — no yt-dlp, no binary) ─────────────
    // This updates the lecture title + thumbnail immediately so the dashboard
    // card is never blank while the transcript is being extracted.
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
      // Non-fatal: if oEmbed fails, the lecture title stays as the user entered.
      log.warn('YouTubeProcessor', `oEmbed metadata fetch failed (non-fatal): ${metaErr instanceof Error ? metaErr.message : String(metaErr)}`);
    }

    // ── Stage 3: Extract transcript (Caption → YtDlpWhisper) ────────────────
    log.stage(3, 4, 'Extracting transcript (router)');

    const transcriptResult = await extractYouTubeTranscript(videoId, url, onStage);

    // ── Stage 4: Save transcript ─────────────────────────────────────────────
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
    const message = error instanceof Error ? error.message : String(error);

    if (error instanceof YouTubeBlockedError) {
      // ── Recoverable: YouTube bot/challenge block ─────────────────────────
      log.warn('YouTubeProcessor', `YouTube blocked access — setting manual_action_required. Stage: ${currentStage}. Reason: ${message}`);

      await updateAIJobStatus(
        supabase, aiJobId,
        'manual_action_required',
        'youtube_blocked',
        0,
        'YouTube is requiring sign-in to confirm you\'re not a bot. Try a different video or contact support.'
      ).catch((e) => log.error('YouTubeProcessor', 'Could not update ai_job to manual_action_required', e));

      // Lecture is marked 'failed' so user sees an error state (recoverable by re-upload)
      await updateLectureStatus(supabase, lectureId, 'failed')
        .catch((e) => log.error('YouTubeProcessor', 'Could not update lecture to failed', e));

    } else {
      // ── Unrecoverable: pipeline error ────────────────────────────────────
      log.error('YouTubeProcessor', `Pipeline FAILED at stage: ${currentStage}`, error);

      await updateAIJobStatus(supabase, aiJobId, 'failed', currentStage, 0, message)
        .catch((e) => log.error('YouTubeProcessor', 'Could not update ai_job to failed', e));

      await updateLectureStatus(supabase, lectureId, 'failed')
        .catch((e) => log.error('YouTubeProcessor', 'Could not update lecture to failed', e));
    }
  }
}
