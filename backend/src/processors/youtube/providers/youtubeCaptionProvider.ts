/**
 * youtubeCaptionProvider.ts
 *
 * Primary transcript provider. Fetches existing public captions via youtube-transcript-plus.
 * Uses context.videoId — the library only needs the video ID, not a URL.
 */

import { fetchTranscript } from 'youtube-transcript-plus';
import { log } from '../../../utils/logger';
import type { TranscriptResult } from '../../../services/transcription/types';
import { TranscriptUnavailableError, type YouTubeTranscriptProvider, type YouTubeVideoContext } from './types';

interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

export class YouTubeCaptionProvider implements YouTubeTranscriptProvider {
  readonly name = 'YouTubeCaptionProvider';

  async extract(
    context: YouTubeVideoContext,
    onStage: (stage: string, progress: number) => Promise<void>
  ): Promise<TranscriptResult> {
    const { videoId, canonicalUrl } = context;

    log.info(this.name, 'Fetching public captions', {
      'Video ID':     videoId,
      'Canonical URL': canonicalUrl,
    });
    await onStage('checking_captions', 15);

    const startTime = Date.now();

    let segments: TranscriptSegment[];
    try {
      // Library only needs the video ID
      segments = await fetchTranscript(videoId) as TranscriptSegment[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn(this.name, `No captions available for video ${videoId}: ${message}`);
      throw new TranscriptUnavailableError(
        `No public captions found for video ${videoId}: ${message}`,
        videoId,
        this.name
      );
    }

    if (!segments || segments.length === 0) {
      log.warn(this.name, `Caption response was empty for video ${videoId}`);
      throw new TranscriptUnavailableError(
        `Caption response was empty for video ${videoId}`,
        videoId,
        this.name
      );
    }

    await onStage('caption_found', 25);

    const text = segments
      .map((s) => s.text.trim())
      .filter(Boolean)
      .join(' ');

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const charCount = text.length;
    const processingTimeMs = Date.now() - startTime;

    const lastSegment = segments[segments.length - 1];
    const durationSeconds = lastSegment
      ? Math.ceil((lastSegment.offset + lastSegment.duration) / 1000)
      : 0;

    const detectedLang = segments.find((s) => s.lang)?.lang ?? 'unknown';

    log.success(this.name, 'Captions retrieved', {
      'Video ID':     videoId,
      'Segments':     segments.length,
      'Language':     detectedLang,
      'Words':        wordCount,
      'Duration':     `${durationSeconds}s`,
      'API time':     `${processingTimeMs}ms`,
      'Text preview': text.length > 120 ? text.slice(0, 120) + '…' : text,
    });

    return {
      text,
      language: detectedLang,
      durationSeconds,
      wordCount,
      charCount,
      processingTimeMs,
      source: 'youtube',
      provider: 'youtube-caption',
      metadata: {
        transcriptSource:      'youtube_caption',
        transcriptionProvider: 'none',
        videoId,
        canonicalUrl,
        captionSegmentCount:   segments.length,
      },
    };
  }
}
