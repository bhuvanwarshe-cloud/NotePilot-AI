/**
 * ytDlpWhisperProvider.ts
 *
 * Fallback transcript provider using yt-dlp + ffmpeg + Groq Whisper.
 * All existing download/transcription logic is relocated here — nothing
 * is changed internally, only ownership changes.
 *
 * This is Provider 2/N in the router.
 * On success: returns a TranscriptResult with provider='groq-whisper-...'.
 * On bot block: throws YouTubeBlockedError (fatal — router stops).
 * On other error: throws generic Error.
 *
 * Metadata stored:
 *   transcriptSource    : 'audio_transcription'
 *   transcriptionProvider: 'groq-whisper-large-v3-turbo'
 *   videoId, title, uploader, durationSeconds
 */

import path from 'path';
import { log } from '../../../utils/logger';
import { fetchYouTubeMetadata } from '../youtubeMetadata';
import { downloadAudio, cleanupTempFile, YouTubeDownloadError } from '../youtubeDownloader';
import { prepareMediaForTranscription } from '../../../services/mediaPreparation.service';
import { transcribe } from '../../../services/transcription/transcription.service';
import { YouTubeBlockedError, type YouTubeTranscriptProvider } from './types';
import type { TranscriptResult } from '../../../services/transcription/types';

export class YtDlpWhisperProvider implements YouTubeTranscriptProvider {
  readonly name = 'YtDlpWhisperProvider';

  constructor(private readonly tempDir: string) {}

  async extract(
    videoId: string,
    url: string,
    onStage: (stage: string, progress: number) => Promise<void>
  ): Promise<TranscriptResult> {
    let tempFilePath: string | null = null;

    try {
      // ── Stage: Fetch metadata ───────────────────────────────────────────────
      log.info(this.name, 'Fetching video metadata via yt-dlp', { 'Video ID': videoId });
      await onStage('fetching_metadata', 30);

      const metadata = await fetchYouTubeMetadata(url);
      log.success(this.name, 'Metadata fetched', {
        'Title':    metadata.title,
        'Uploader': metadata.uploader,
        'Duration': `${metadata.durationSeconds}s`,
      });

      // ── Stage: Download audio ───────────────────────────────────────────────
      log.info(this.name, 'Downloading audio via yt-dlp', { 'URL': url });
      await onStage('downloading_audio', 45);

      tempFilePath = await downloadAudio(url, videoId, this.tempDir);
      log.success(this.name, 'Audio downloaded', { 'File': tempFilePath });

      // ── Stage: Prepare (normalize + chunk) ────────────────────────────────
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

      // ── Build final result ────────────────────────────────────────────────
      const result: TranscriptResult = {
        ...transcriptResult,
        source: 'youtube',
        metadata: {
          transcriptSource:      'audio_transcription',
          transcriptionProvider: transcriptResult.provider,
          videoId,
          title:           metadata.title,
          uploader:        metadata.uploader,
          durationSeconds: metadata.durationSeconds,
        },
      };

      return result;

    } catch (err: unknown) {
      // ── Re-classify YouTube bot blocks as YouTubeBlockedError ─────────────
      if (err instanceof YouTubeDownloadError && err.code === 'YOUTUBE_ACCESS_DENIED') {
        log.error(this.name, 'YouTube blocked yt-dlp download (bot challenge)', err);
        throw new YouTubeBlockedError(
          `YouTube blocked the audio download. The video may require sign-in or is geo-restricted. Details: ${err.message}`,
          err.details
        );
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
