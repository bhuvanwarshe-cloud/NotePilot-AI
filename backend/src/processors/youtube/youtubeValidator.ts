/**
 * youtubeValidator.ts
 *
 * Single responsibility: validate a YouTube URL and extract the video ID.
 * Rejects playlists, shorts with missing IDs, and non-YouTube domains.
 */

export interface YouTubeValidationResult {
  valid: true;
  videoId: string;
}

const YOUTUBE_DOMAINS = ['youtube.com', 'youtu.be', 'www.youtube.com', 'm.youtube.com'];

/**
 * Validates a YouTube URL and returns the extracted video ID.
 * Throws a descriptive Error if the URL is invalid.
 */
export function validateYouTubeUrl(rawUrl: string): YouTubeValidationResult {
  let url: URL;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error(`Invalid URL format: "${rawUrl}"`);
  }

  const hostname = url.hostname.replace(/^www\./, '');

  if (!YOUTUBE_DOMAINS.some((d) => url.hostname === d)) {
    throw new Error(`Not a YouTube URL. Got hostname: "${url.hostname}"`);
  }

  // Reject playlists (no individual video)
  if (url.searchParams.has('list') && !url.searchParams.has('v')) {
    throw new Error('Playlists are not supported. Please provide a direct video URL.');
  }

  let videoId: string | null = null;

  if (hostname === 'youtu.be') {
    // Short URL: https://youtu.be/<videoId>
    videoId = url.pathname.slice(1).split('?')[0];
  } else if (url.pathname.startsWith('/shorts/')) {
    // Shorts URL: https://www.youtube.com/shorts/<videoId>
    videoId = url.pathname.replace('/shorts/', '').split('?')[0];
  } else {
    // Standard URL: https://www.youtube.com/watch?v=<videoId>
    videoId = url.searchParams.get('v');
  }

  if (!videoId || videoId.length < 6) {
    throw new Error(`Could not extract a valid video ID from URL: "${rawUrl}"`);
  }

  // YouTube video IDs are exactly 11 alphanumeric/dash/underscore characters
  if (!/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
    throw new Error(`Extracted video ID "${videoId}" does not look valid.`);
  }

  return { valid: true, videoId };
}

/**
 * Converts any valid YouTube video ID into a clean canonical URL.
 * Strips all tracking parameters (?si=, &feature=, etc.).
 *
 * Example:
 *   https://youtu.be/wIyHSOugGGw?si=Bf3Qn9mpLNQqDTKh
 *   → https://www.youtube.com/watch?v=wIyHSOugGGw
 */
export function buildCanonicalUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Builds a YouTubeVideoContext from the original URL and the extracted videoId.
 * Import type from providers/types to keep the validator free of deep dependencies.
 */
export function buildVideoContext(originalUrl: string, videoId: string): {
  videoId: string;
  canonicalUrl: string;
  originalUrl: string;
} {
  return {
    videoId,
    canonicalUrl: buildCanonicalUrl(videoId),
    originalUrl,
  };
}

