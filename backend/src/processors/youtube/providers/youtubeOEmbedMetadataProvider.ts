/**
 * youtubeOEmbedMetadataProvider.ts
 *
 * Fetches YouTube video metadata using YouTube's public oEmbed API.
 * No yt-dlp, no binary, no authentication required.
 *
 * Endpoint: https://www.youtube.com/oembed?url=<encoded_url>&format=json
 * Returns:  title, thumbnail_url, author_name (uploader), dimensions
 *
 * This is called FIRST, immediately after URL validation, so the lecture card
 * in the dashboard shows the real title and thumbnail while transcription runs
 * in the background.
 *
 * Future: Add YouTubeDataAPIMetadataProvider as a second option when you have
 * a YouTube API key configured — just implement the same interface.
 */

import { log } from '../../../utils/logger';
import type { YouTubeMetadataProvider, YouTubeVideoMetadata } from './types';

interface OEmbedResponse {
  title: string;
  author_name: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  type: string;
  version: string;
}

export class YouTubeOEmbedMetadataProvider implements YouTubeMetadataProvider {
  readonly name = 'youtube-oembed';

  async fetchMetadata(url: string, _videoId: string): Promise<YouTubeVideoMetadata> {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;

    log.info('OEmbedMetadata', 'Fetching via oEmbed', { 'URL': oEmbedUrl });

    const response = await fetch(oEmbedUrl, {
      headers: {
        'User-Agent': 'NotePilot/1.0 (https://notepilot.app)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`oEmbed request failed: HTTP ${response.status} for URL: ${url}`);
    }

    const data = await response.json() as OEmbedResponse;

    const metadata: YouTubeVideoMetadata = {
      title: data.title ?? 'Untitled Video',
      thumbnailUrl: data.thumbnail_url ?? '',
      uploader: data.author_name ?? 'Unknown',
      // oEmbed does not expose duration — that's available from yt-dlp only
      durationSeconds: undefined,
    };

    log.success('OEmbedMetadata', 'Metadata fetched', {
      'Title':    metadata.title,
      'Uploader': metadata.uploader ?? '(none)',
      'Thumb':    metadata.thumbnailUrl ? 'yes' : 'no',
    });

    return metadata;
  }
}
