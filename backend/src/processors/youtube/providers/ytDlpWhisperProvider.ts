/**
 * ytDlpWhisperProvider.ts
 *
 * Fallback transcript provider using yt-dlp + ffmpeg + Groq Whisper.
 * Uses context.canonicalUrl exclusively — never the original pasted URL.
 * This ensures yt-dlp always receives a clean URL without ?si= tracking params.
 */

import path from 'path';
import { log } from '../../../utils/logger';
import { fetchYouTubeMetadata } from '../youtubeMetadata';
import { downloadAudio, cleanupTempFile, YouTubeDownloadError } from '../youtubeDownloader';
import { prepareMediaForTranscription } from '../../../services/mediaPreparation.service';
import { transcribe } from '../../../services/transcription/transcription.service';
import { YouTubeBlockedError, type YouTubeTranscriptProvider, type YouTubeVideoContext } from './types';
import type { TranscriptResult } from '../../../services/transcription/types';

export class YtDlpWhisperProvider implements YouTubeTranscriptProvider {
  readonly name = 'YtDlpWhisperProvider';

  constructor(private readonly tempDir: string) {}

  async extract(
    context: YouTubeVideoContext,
    onStage: (stage: string, progress: number) => Promise<void>
  ): Promise<TranscriptResult> {
    const { videoId, canonicalUrl } = context;
    let tempFilePath: string | null = null;

    try {
      // ── Stage: Fetch metadata ───────────────────────────────────────────────
      log.info(this.name, 'Fetching video metadata via yt-dlp', {
        'Video ID':     videoId,
        'Canonical URL': canonicalUrl,
      });
      await onStage('fetching_metadata', 30);

      // Always pass canonicalUrl — clean URL without tracking params
      const metadata = await fetchYouTubeMetadata(canonicalUrl);
      log.success(this.name, 'Metadata fetched', {
        'Title':    metadata.title,
        'Uploader': metadata.uploader,
        'Duration': `${metadata.durationSeconds}s`,
      });

      // ── Stage: Download audio ───────────────────────────────────────────────
      log.info(this.name, 'Downloading audio via yt-dlp', {
        'Video ID':     videoId,
        'Canonical URL': canonicalUrl,
      });
      await onStage('downloading_audio', 45);

      tempFilePath = await downloadAudio(canonicalUrl, videoId, this.tempDir);
      log.success(this.name, 'Audio downloaded', { 'File': tempFilePath });

      // ── Stage: Prepare (normalize) ────────────────────────────────────────
      log.info(this.name, 'Preparing audio for transcription');
      await onStage('preparing_audio', 55);

      const preparedMedia = await prepareMediaForTranscription(tempFilePath, this.tempDir, videoId);
      tempFilePath = preparedMedia.normalizedPath;
      log.success(this.name, 'Media prepared', {
        'Normalized': tempFilePath,
        'Chunks':     String(preparedMedia.chunkPaths.length),
      });

      // ── Stage: Transcribe ─────────────────────────────────────────────────
      log.info(this.name, 'Transcribing via Groq Whisper');
      await onStage('transcribing', 65);

      const transcriptResult = await transcribe(tempFilePath);
      log.success(this.name, 'Transcription complete', {
        'Language': transcriptResult.language,
        'Words':    transcriptResult.wordCount,
      });

      return {
        ...transcriptResult,
        source: 'youtube',
        metadata: {
          transcriptSource:      'audio_transcription',
          transcriptionProvider: transcriptResult.provider,
          videoId,
          canonicalUrl,
          title:           metadata.title,
          uploader:        metadata.uploader,
          durationSeconds: metadata.durationSeconds,
        },
      };

   } catch (err: unknown) {

  if (err instanceof YouTubeDownloadError) {

    if (err.code === 'YOUTUBE_ACCESS_DENIED') {

      log.error(
        this.name,
        'YouTube blocked yt-dlp access',
        err
      );

      throw new YouTubeBlockedError(
        `YouTube blocked server-side access for video ${videoId}. ` +
        `The video may require authentication or YouTube may be challenging the server IP.`,
        err.details
      );
    }

    log.warn(
      this.name,
      `yt-dlp operation failed: ${err.code} — ${err.message}`
    );

    throw err;
  }

  throw err;

} finally {
      if (tempFilePath) {
        log.info(this.name, 'Cleaning up temp file', { 'File': path.basename(tempFilePath) });
        cleanupTempFile(tempFilePath);
      }
    }
  }
}
