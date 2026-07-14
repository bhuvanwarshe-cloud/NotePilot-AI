/**
 * manualResolutionProvider.ts
 *
 * Terminal provider — always the last in the chain. Never throws, never fails.
 *
 * Returns a structured TranscriptResult with:
 *   metadata.manualActionRequired = true   ← processor branches on this flag
 *   metadata.reason                        ← specific reason code
 *   metadata.retryable                     ← whether user can retry
 *   metadata.recovery                      ← suggested recovery path
 *   metadata.userMessage                   ← user-facing explanation
 *
 * The processor stores these fields in ai_jobs.metadata and sets
 * ai_jobs.status = 'failed' (not 'manual_action_required') to stay within the
 * existing Postgres enum. The frontend differentiates this case by reading
 * ai_jobs.metadata.manualActionRequired instead of ai_jobs.status.
 */

import { log } from '../../../utils/logger';
import type { TranscriptResult } from '../../../services/transcription/types';
import type { YouTubeTranscriptProvider, YouTubeVideoContext } from './types';

export type ManualResolutionReason =
  | 'youtube_verification_required'
  | 'captions_unavailable'
  | 'video_private'
  | 'all_providers_failed';

interface ManualResolutionProviderOptions {
  accumulatedErrors: string[];
  reason: ManualResolutionReason;
}

const USER_MESSAGES: Record<ManualResolutionReason, string> = {
  youtube_verification_required:
    "YouTube restricted access to this video from our servers and no public captions were available. " +
    "You can still study this lecture by downloading the audio (if you have permission) and uploading it directly to NotePilot.",
  captions_unavailable:
    "This video has no public captions and the audio download was also unavailable. " +
    "You can still study this lecture by downloading the audio and uploading it directly to NotePilot.",
  video_private:
    "This video is private or has been removed and cannot be accessed. " +
    "Please check that the link is correct and the video is publicly available.",
  all_providers_failed:
    "We were unable to extract a transcript from this video through any available method. " +
    "You can still study this lecture by downloading the audio and uploading it directly to NotePilot.",
};

export class ManualResolutionProvider implements YouTubeTranscriptProvider {
  readonly name = 'ManualResolutionProvider';

  constructor(private readonly opts: ManualResolutionProviderOptions) {}

  async extract(
    context: YouTubeVideoContext,
    onStage: (stage: string, progress: number) => Promise<void>
  ): Promise<TranscriptResult> {
    const { videoId, canonicalUrl, originalUrl } = context;
    const { reason, accumulatedErrors } = this.opts;

    // Use 'awaiting_manual_action' as the stage string (stage is just a label,
    // not constrained by the DB enum — only ai_jobs.status is enum-constrained)
    await onStage('awaiting_manual_action', 0);

    log.warn(
      this.name,
      `All providers exhausted for video ${videoId}. Reason: ${reason}. ` +
      `Retryable: true. Recovery: audio_upload`
    );

    log.info(this.name, 'Manual action context', {
      'Video ID':     videoId,
      'Canonical URL': canonicalUrl,
      'Original URL':  originalUrl,
      'Reason':        reason,
      'Retryable':     'true',
      'Recovery':      'audio_upload',
      'Errors':        accumulatedErrors.join(' | '),
    });

    return {
      text: '',
      language: 'unknown',
      durationSeconds: 0,
      wordCount: 0,
      charCount: 0,
      processingTimeMs: 0,
      source: 'youtube',
      provider: 'manual_resolution',
      metadata: {
        // Sentinel: processor checks this flag to branch into the manual path
        manualActionRequired: true,
        reason,
        retryable: true,
        recovery: 'audio_upload',
        userMessage: USER_MESSAGES[reason],
        providerErrors: accumulatedErrors,
        videoId,
        canonicalUrl,
      },
    };
  }
}

/**
 * Classify a list of accumulated error strings into the most specific reason code.
 */
export function classifyManualReason(errors: string[]): ManualResolutionReason {
  const combined = errors.join(' ').toLowerCase();

  if (
    combined.includes('bot') ||
    combined.includes('sign in') ||
    combined.includes('challenge') ||
    combined.includes('captcha') ||
    combined.includes('access_denied') ||
    combined.includes('youtube_access_denied') ||
    combined.includes('[blocked]')
  ) {
    return 'youtube_verification_required';
  }

  if (
    combined.includes('private') ||
    combined.includes('removed') ||
    combined.includes('does not exist')
  ) {
    return 'video_private';
  }

  if (
    combined.includes('no public captions') ||
    combined.includes('transcript is disabled') ||
    combined.includes('caption') ||
    combined.includes('subtitles')
  ) {
    return 'captions_unavailable';
  }

  return 'all_providers_failed';
}
