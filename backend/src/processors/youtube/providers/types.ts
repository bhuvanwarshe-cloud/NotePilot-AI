/**
 * providers/types.ts
 *
 * Shared types and interfaces for the YouTube Transcript Provider system.
 *
 * Architecture:
 *   YouTubeTranscriptProvider — URL/videoId → TranscriptResult
 *   YouTubeMetadataProvider   — URL/videoId → YouTubeVideoMetadata
 *
 * These are separate from the audio-file TranscriptionProvider interface
 * which is defined in services/transcription/types.ts.
 */

import type { TranscriptResult } from '../../../services/transcription/types';

// ── Error Classes ─────────────────────────────────────────────────────────────

/**
 * Thrown when a provider cannot find a transcript (captions not available,
 * auto-generated captions disabled, etc.). This is a SOFT failure — the
 * router will try the next provider.
 */
export class TranscriptUnavailableError extends Error {
  constructor(
    message: string,
    public readonly videoId: string,
    public readonly providerName: string
  ) {
    super(message);
    this.name = 'TranscriptUnavailableError';
  }
}

/**
 * Thrown when yt-dlp is blocked by YouTube's bot/challenge detection.
 * This is a HARD failure — no further providers can help, and the AI job
 * should be set to 'manual_action_required' rather than 'failed'.
 */
export class YouTubeBlockedError extends Error {
  constructor(message: string, public readonly details?: string) {
    super(message);
    this.name = 'YouTubeBlockedError';
  }
}

// ── Transcript Provider Interface ─────────────────────────────────────────────

/**
 * A provider that can extract a transcript from a YouTube video.
 * Each provider is responsible for a specific extraction strategy.
 *
 * On recoverable failure (e.g. captions not available), throws TranscriptUnavailableError.
 * On fatal failure (e.g. bot block), throws YouTubeBlockedError.
 * On unrecoverable error, throws a generic Error.
 */
export interface YouTubeTranscriptProvider {
  /** Human-readable identifier used in logs and metadata */
  readonly name: string;

  /**
   * Extract a transcript from a YouTube video.
   * @param videoId  The 11-character YouTube video ID
   * @param url      The original full URL (some providers need it)
   * @param onStage  Callback to report progress to the AI job tracker
   */
  extract(
    videoId: string,
    url: string,
    onStage: (stage: string, progress: number) => Promise<void>
  ): Promise<TranscriptResult>;
}

// ── Metadata Provider Interface ───────────────────────────────────────────────

export interface YouTubeVideoMetadata {
  title: string;
  thumbnailUrl: string;
  uploader?: string;
  durationSeconds?: number;
}

/**
 * A provider that can fetch metadata for a YouTube video.
 * Designed for extensibility: oEmbed today, YouTube Data API tomorrow.
 */
export interface YouTubeMetadataProvider {
  readonly name: string;
  fetchMetadata(url: string, videoId: string): Promise<YouTubeVideoMetadata>;
}
