/**
 * youtubeTranscriptRouter.ts
 *
 * Orchestrates the provider chain. Accepts a YouTubeVideoContext and always
 * returns a TranscriptResult — never throws.
 *
 * Provider order:
 *   1. YouTubeCaptionProvider  — uses context.videoId
 *   2. YtDlpWhisperProvider    — uses context.canonicalUrl
 *   N. ManualResolutionProvider — terminal, always succeeds
 *
 * Failure model:
 *   TranscriptUnavailableError  → soft: record, continue
 *   YouTubeBlockedError         → hard: record with [BLOCKED] tag, break loop
 *   Any other Error             → soft: record as [UNEXPECTED], continue
 *   All exhausted               → delegate to ManualResolutionProvider
 */

import path from 'path';
import { log } from '../../utils/logger';
import { YouTubeCaptionProvider } from './providers/youtubeCaptionProvider';
import { YtDlpWhisperProvider } from './providers/ytDlpWhisperProvider';
import { ManualResolutionProvider, classifyManualReason } from './providers/manualResolutionProvider';
import { TranscriptUnavailableError, YouTubeBlockedError } from './providers/types';
import type { YouTubeTranscriptProvider, YouTubeVideoContext } from './providers/types';
import type { TranscriptResult } from '../../services/transcription/types';

const TEMP_DIR = path.resolve(__dirname, '../../../temp');

function buildProviders(): YouTubeTranscriptProvider[] {
  return [
    new YouTubeCaptionProvider(),       // 1. Free, instant — public captions via videoId
    new YtDlpWhisperProvider(TEMP_DIR), // 2. yt-dlp + ffmpeg + Groq Whisper via canonicalUrl
    // Future additions (insert before ManualResolutionProvider):
    // new InnerTubeCaptionProvider(),
    // new DeepgramYouTubeProvider(),
  ];
}

/**
 * Extract a transcript from a YouTube video.
 * Always returns a TranscriptResult. Never throws.
 *
 * @param context  Canonical context built immediately after URL validation
 * @param onStage  Callback to advance AI job stage + progress in Supabase
 */
export async function extractYouTubeTranscript(
  context: YouTubeVideoContext,
  onStage: (stage: string, progress: number) => Promise<void>
): Promise<TranscriptResult> {
  const { videoId, canonicalUrl, originalUrl } = context;
  const providers = buildProviders();
  const total = providers.length;
  const errors: string[] = [];
  let hardBlocked = false;

  log.info('TranscriptRouter', 'Starting provider chain', {
    'Video ID':     videoId,
    'Canonical URL': canonicalUrl,
    'Original URL':  originalUrl,
    'Providers':    providers.map((p) => p.name).join(' → '),
  });

  for (let i = 0; i < providers.length; i++) {
    if (hardBlocked) break;

    const provider = providers[i];
    const position = `${i + 1}/${total}`;
    const attemptStart = Date.now();

    log.info('TranscriptRouter', `Provider ${position}: ${provider.name} — starting`, {
      'Video ID': videoId,
    });

    try {
      const result = await provider.extract(context, onStage);
      const durationMs = Date.now() - attemptStart;

      log.success('TranscriptRouter', `Provider ${position}: ${provider.name} — SUCCESS`, {
        'Video ID':          videoId,
        'Words':             result.wordCount,
        'Language':          result.language,
        'Duration ms':       durationMs,
        'Transcript source': String(result.metadata?.transcriptSource ?? 'unknown'),
      });

      return result;

    } catch (err: unknown) {
      const durationMs = Date.now() - attemptStart;

      if (err instanceof YouTubeBlockedError) {
        log.warn(
          'TranscriptRouter',
          `Provider ${position}: ${provider.name} — HARD FAIL (YouTube blocked, ${durationMs}ms): ${err.message}`
        );
        errors.push(`[${provider.name}][BLOCKED] ${err.message}`);
        hardBlocked = true;
        break;
      }

      if (err instanceof TranscriptUnavailableError) {
        log.warn(
          'TranscriptRouter',
          `Provider ${position}: ${provider.name} — unavailable (${durationMs}ms): ${err.message}`
        );
        errors.push(`[${provider.name}] ${err.message}`);
        continue;
      }

      const msg = err instanceof Error ? err.message : String(err);
      log.warn(
        'TranscriptRouter',
        `Provider ${position}: ${provider.name} — unexpected error (${durationMs}ms): ${msg}`
      );
      errors.push(`[${provider.name}][UNEXPECTED] ${msg}`);
      continue;
    }
  }

  // ── All providers exhausted — delegate to terminal ManualResolutionProvider ─
  const reason = classifyManualReason(errors);

  log.warn(
    'TranscriptRouter',
    `All ${total} provider(s) exhausted for video ${videoId}. ` +
    `Hard-blocked: ${hardBlocked}. Classified reason: ${reason}. ` +
    `Delegating to ManualResolutionProvider.`
  );

  const terminal = new ManualResolutionProvider({ accumulatedErrors: errors, reason });
  return terminal.extract(context, onStage);
}
