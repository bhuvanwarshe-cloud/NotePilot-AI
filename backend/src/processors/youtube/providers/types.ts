/**
 * providers/types.ts
 *
 * Shared types and interfaces for the YouTube Transcript Provider system.
 *
 * Key addition: YouTubeVideoContext
 *   A single canonical object that every provider, router, and metadata service
 *   receives. Providers never reconstruct URLs or parse video IDs themselves.
 *   This eliminates inconsistent behaviour from tracking params like ?si=.
 */

import type { TranscriptResult } from '../../../services/transcription/types';

// ── Shared Context ────────────────────────────────────────────────────────────

/**
 * Canonical representation of a YouTube video.
 * Built immediately after URL validation and passed through the entire pipeline.
 *
 *   originalUrl  — the raw URL the user pasted (may have ?si= or other params)
 *   canonicalUrl — https://www.youtube.com/watch?v=<videoId>  (clean, no params)
 *   videoId      — the 11-character video ID extracted by the validator
 */
export interface YouTubeVideoContext {
  readonly videoId: string;
  readonly canonicalUrl: string;
  readonly originalUrl: string;
}

// ── Error Classes ─────────────────────────────────────────────────────────────

/**
 * Thrown when a provider cannot find a transcript (captions not available,
 * auto-generated captions disabled, etc.). This is a SOFT failure — the
 * router will log it and try the next provider.
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
 * This is a HARD failure — no further providers can help.
 * The router catches it, records it, and delegates to ManualResolutionProvider.
 * The processor sets ai_jobs.status = 'failed' with metadata.manualActionRequired = true.
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
 *
 * Receives a YouTubeVideoContext — never reconstructs or parses URLs internally.
 * On soft failure → throws TranscriptUnavailableError.
 * On hard block  → throws YouTubeBlockedError.
 * On other error → throws generic Error (router treats as soft).
 */
export interface YouTubeTranscriptProvider {
  readonly name: string;

  extract(
    context: YouTubeVideoContext,
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
 * Receives a YouTubeVideoContext — always uses canonicalUrl.
 */
export interface YouTubeMetadataProvider {
  readonly name: string;
  fetchMetadata(context: YouTubeVideoContext): Promise<YouTubeVideoMetadata>;
}
