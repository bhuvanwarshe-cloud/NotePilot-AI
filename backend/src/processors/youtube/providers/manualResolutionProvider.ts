/**
 * manualResolutionProvider.ts
 *
 * Terminal provider — always the last entry in the router's provider chain.
 * Never throws. Never fails. Always returns a structured result.
 *
 * When all real providers are exhausted, this provider:
 *   1. Records the accumulated errors from previous attempts
 *   2. Determines a specific reason code (youtube_verification_required, captions_unavailable, etc.)
 *   3. Returns a TranscriptResult that signals to the processor that manual resolution is required
 *
 * The processor detects `metadata.manualResolutionRequired === true` and:
 *   - Sets ai_jobs.status = 'manual_action_required'
 *   - Sets lectures.status = 'manual_action_required'
 *   - Does NOT call saveTranscript()
 *   - Stores the reason + user message in ai_jobs.metadata
 *
 * This design guarantees the pipeline never crashes on provider exhaustion.
 * Every YouTube upload ends in one of two terminal states: completed or manual_action_required.
 */

import { log } from '../../../utils/logger';
import type { TranscriptResult } from '../../../services/transcription/types';
import type { YouTubeTranscriptProvider } from './types';

export type ManualResolutionReason =
  | 'youtube_verification_required'   // yt-dlp blocked by bot challenge
  | 'captions_unavailable'            // video has no public captions
  | 'video_private'                   // video is private / removed
  | 'all_providers_failed';           // fallback when no specific reason detected

interface ManualResolutionProviderOptions {
  /** Errors accumulated from all previous providers */
  accumulatedErrors: string[];
  /** Specific reason code — determined by the router based on error types */
  reason: ManualResolutionReason;
}

/** User-facing message by reason code */
const USER_MESSAGES: Record<ManualResolutionReason, string> = {
  youtube_verification_required:
    'YouTube restricted access to this video from our servers and no public captions were available. ' +
    'You can still study this lecture by downloading the audio (if you have permission) and uploading it directly to NotePilot.',
  captions_unavailable:
    'This video has no public captions and the audio download was also unavailable. ' +
    'You can still study this lecture by downloading the audio and uploading it directly to NotePilot.',
  video_private:
    'This video is private or has been removed and cannot be accessed. ' +
    'Please check that the link is correct and the video is publicly available.',
  all_providers_failed:
    'We were unable to extract a transcript from this video through any available method. ' +
    'You can still study this lecture by downloading the audio and uploading it directly to NotePilot.',
};

export class ManualResolutionProvider implements YouTubeTranscriptProvider {
  readonly name = 'ManualResolutionProvider';

  private readonly accumulatedErrors: string[];
  private readonly reason: ManualResolutionReason;

  constructor(opts: ManualResolutionProviderOptions) {
    this.accumulatedErrors = opts.accumulatedErrors;
    this.reason = opts.reason;
  }

  async extract(
    videoId: string,
    _url: string,
    onStage: (stage: string, progress: number) => Promise<void>
  ): Promise<TranscriptResult> {

    await onStage('manual_action_required', 0);

    log.warn(
      this.name,
      `All providers exhausted for video ${videoId}. Setting manual_action_required. Reason: ${this.reason}`
    );

    const userMessage = USER_MESSAGES[this.reason];

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
        // Sentinel flag — processor checks this to branch into the manual path
        manualResolutionRequired: true,
        reason: this.reason,
        userMessage,
        recoveryPath: 'audio_upload',
        providerErrors: this.accumulatedErrors,
        videoId,
      },
    };
  }
}

/**
 * Determine a specific ManualResolutionReason from accumulated error strings.
 * Returns the most informative reason found; falls back to 'all_providers_failed'.
 */
export function classifyManualReason(errors: string[]): ManualResolutionReason {
  const combined = errors.join(' ').toLowerCase();

  if (
    combined.includes('bot') ||
    combined.includes('sign in') ||
    combined.includes('challenge') ||
    combined.includes('captcha') ||
    combined.includes('access_denied') ||
    combined.includes('youtube_access_denied')
  ) {
    return 'youtube_verification_required';
  }

  if (
    combined.includes('private') ||
    combined.includes('removed') ||
    combined.includes('unavailable') ||
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
