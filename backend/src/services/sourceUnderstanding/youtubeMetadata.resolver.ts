/**
 * youtubeMetadata.resolver.ts
 *
 * Phase 3.5.2 — YouTube Metadata Resolver
 *
 * Responsible for deriving stable metadata from an already-validated
 * YouTube video ID.
 *
 * This module deliberately does NOT:
 *
 * - call Gemini
 * - call yt-dlp
 * - scrape YouTube HTML
 * - persist anything to Supabase
 * - update lectures
 *
 * It is a pure source-specific metadata resolver.
 */


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface YouTubeResolvedMetadata {

  videoId: string;

  canonicalUrl: string;

  thumbnailUrl: string;

  sourceType:
    'youtube';

}


// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Defensive validation.
 *
 * The production orchestration layer already validates the video ID before
 * calling source understanding, but this resolver should remain safe when used
 * independently in future pipelines.
 */
function assertValidYouTubeVideoId(
  videoId: string
): void {

  if (
    !/^[A-Za-z0-9_-]{11}$/.test(videoId)
  ) {

    throw new Error(
      `Invalid YouTube video ID: ${videoId}`
    );

  }

}


// ─────────────────────────────────────────────────────────────────────────────
// Canonical URL
// ─────────────────────────────────────────────────────────────────────────────

export function buildYouTubeCanonicalUrl(
  videoId: string
): string {

  assertValidYouTubeVideoId(
    videoId
  );


  return (
    `https://www.youtube.com/watch?v=${videoId}`
  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Thumbnail
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a YouTube thumbnail URL directly from the video ID.
 *
 * We use hqdefault rather than maxresdefault because maxresdefault is not
 * guaranteed to exist for every video.
 *
 * hqdefault provides a broadly available fallback without requiring:
 *
 * - YouTube Data API
 * - yt-dlp
 * - scraping
 * - another network request during backend processing
 */
export function buildYouTubeThumbnailUrl(
  videoId: string
): string {

  assertValidYouTubeVideoId(
    videoId
  );


  return (
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves deterministic YouTube metadata.
 *
 * Example:
 *
 * resolveYouTubeMetadata('gl1r1XV0SLw')
 *
 * →
 *
 * {
 *   videoId: 'gl1r1XV0SLw',
 *   canonicalUrl: '...',
 *   thumbnailUrl: '...',
 *   sourceType: 'youtube'
 * }
 */
export function resolveYouTubeMetadata(
  videoId: string
): YouTubeResolvedMetadata {

  assertValidYouTubeVideoId(
    videoId
  );


  return {

    videoId,

    canonicalUrl:
      buildYouTubeCanonicalUrl(
        videoId
      ),

    thumbnailUrl:
      buildYouTubeThumbnailUrl(
        videoId
      ),

    sourceType:
      'youtube',

  };

}