/**
 * youtubeTranscriptRouter.ts
 *
 * Orchestrates the ordered list of YouTube transcript providers.
 * The processor knows nothing about providers — it calls extractYouTubeTranscript()
 * and receives a TranscriptResult.
 *
 * Provider execution model:
 *   - Providers are tried in order.
 *   - TranscriptUnavailableError → soft failure: log and try next provider.
 *   - YouTubeBlockedError → hard failure: propagate immediately (no next provider).
 *   - All providers exhausted → throw generic Error.
 *
 * To add a new provider in the future:
 *   providers.push(new DeepgramProvider());  // done.
 *
 * Logging format: "Provider N/M: <name>" for easy production debugging.
 */

import path from 'path';
import { log } from '../../utils/logger';
import { YouTubeCaptionProvider } from './providers/youtubeCaptionProvider';
import { YtDlpWhisperProvider } from './providers/ytDlpWhisperProvider';
import { TranscriptUnavailableError, YouTubeBlockedError } from './providers/types';
import type { YouTubeTranscriptProvider } from './providers/types';
import type { TranscriptResult } from '../../services/transcription/types';

const TEMP_DIR = path.resolve(__dirname, '../../../temp');

/**
 * Build the ordered provider list.
 * This is the single place to add, remove, or reorder providers.
 */
function buildProviders(): YouTubeTranscriptProvider[] {
  return [
    new YouTubeCaptionProvider(),       // 1. Free, instant, no binary
    new YtDlpWhisperProvider(TEMP_DIR), // 2. yt-dlp + ffmpeg + Groq Whisper
    // Future:
    // new DeepgramYouTubeProvider(),
    // new AssemblyAIProvider(),
  ];
}

/**
 * Extract a transcript from a YouTube video using the best available provider.
 *
 * @param videoId    Validated 11-char YouTube video ID
 * @param url        Original YouTube URL
 * @param onStage    Callback to advance AI job stage + progress in Supabase
 */
export async function extractYouTubeTranscript(
  videoId: string,
  url: string,
  onStage: (stage: string, progress: number) => Promise<void>
): Promise<TranscriptResult> {
  const providers = buildProviders();
  const total = providers.length;
  const errors: string[] = [];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const position = `${i + 1}/${total}`;
    const attemptStart = Date.now();

    log.info('TranscriptRouter', `Provider ${position}: ${provider.name} — starting`, {
      'Video ID': videoId,
    });

    try {
      const result = await provider.extract(videoId, url, onStage);
      const durationMs = Date.now() - attemptStart;

      log.success('TranscriptRouter', `Provider ${position}: ${provider.name} — SUCCESS`, {
        'Video ID':   videoId,
        'Words':      result.wordCount,
        'Language':   result.language,
        'Duration ms': durationMs,
        'Transcript source': String(result.metadata?.transcriptSource ?? 'unknown'),
      });

      return result;

    } catch (err: unknown) {

      if (err instanceof YouTubeBlockedError) {
        // Hard failure — propagate immediately; no point trying other providers.
        log.error(
          'TranscriptRouter',
          `Provider ${position}: ${provider.name} — HARD FAIL (YouTube blocked): ${err.message}`,
          err
        );
        throw err;
      }

      if (err instanceof TranscriptUnavailableError) {
        // Soft failure — log and continue to next provider.
        const durationMs = Date.now() - attemptStart;
        log.warn('TranscriptRouter', `Provider ${position}: ${provider.name} — unavailable (${durationMs}ms), reason: ${err.message}`);
        errors.push(`[${provider.name}] ${err.message}`);
        continue;
      }

      // Unexpected error — treat as soft failure and continue.
      const msg = err instanceof Error ? err.message : String(err);
      const durationMs = Date.now() - attemptStart;
      log.warn('TranscriptRouter', `Provider ${position}: ${provider.name} — unexpected error (${durationMs}ms): ${msg}`);
      errors.push(`[${provider.name}] ${msg}`);
      continue;
    }
  }

  // All providers exhausted.
  const summary = errors.join(' | ');
  log.error('TranscriptRouter', 'All providers exhausted — no transcript could be extracted', {
    'Video ID': videoId,
    'Attempts': total,
    'Errors':   summary,
  });

  throw new Error(`No transcript provider succeeded for video ${videoId}. Attempted ${total} providers. Errors: ${summary}`);
}
