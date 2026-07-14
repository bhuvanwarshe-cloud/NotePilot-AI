/**
 * youtubeOEmbedMetadataProvider.ts
 *
 * Fetches YouTube video metadata using YouTube's public oEmbed API.
 * Always uses context.canonicalUrl — never the raw pasted URL.
 */

import { log } from '../../../utils/logger';
import type { YouTubeMetadataProvider, YouTubeVideoContext, YouTubeVideoMetadata } from './types';

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

  async fetchMetadata(context: YouTubeVideoContext): Promise<YouTubeVideoMetadata> {
    // Always use the canonical URL — strips ?si= and other tracking params
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(context.canonicalUrl)}&format=json`;

    log.info('OEmbedMetadata', 'Fetching via oEmbed', {
      'Video ID':     context.videoId,
      'Canonical URL': context.canonicalUrl,
    });

    const response = await fetch(oEmbedUrl, {
      headers: {
        'User-Agent': 'NotePilot/1.0 (https://notepilot.app)',
        'Accept':     'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`oEmbed request failed: HTTP ${response.status} for video ${context.videoId}`);
    }

    const data = await response.json() as OEmbedResponse;

    const metadata: YouTubeVideoMetadata = {
      title:           data.title        ?? 'Untitled Video',
      thumbnailUrl:    data.thumbnail_url ?? '',
      uploader:        data.author_name  ?? 'Unknown',
      durationSeconds: undefined, // oEmbed does not expose duration
    };

    log.success('OEmbedMetadata', 'Metadata fetched', {
      'Title':    metadata.title,
      'Uploader': metadata.uploader ?? '(none)',
      'Thumb':    metadata.thumbnailUrl ? 'yes' : 'no',
    });

    return metadata;
  }
}
