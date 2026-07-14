/**
 * youtubeTranscriptRouter.ts
 *
 * Orchestrates the ordered list of YouTube transcript providers.
 * The processor knows nothing about providers — it calls extractYouTubeTranscript()
 * and always receives a TranscriptResult (never throws on exhaustion).
 *
 * Provider execution model:
 *   - Providers are tried in order.
 *   - TranscriptUnavailableError → soft failure: record error, try next provider.
 *   - YouTubeBlockedError → hard failure: record error, skip remaining providers.
 *   - Any unexpected error → treat as soft failure: record, try next provider.
 *   - All providers exhausted → ManualResolutionProvider runs as terminal, always succeeds.
 *
 * The terminal ManualResolutionProvider guarantees the pipeline always ends
 * in one of two states: completed or manual_action_required. It never crashes.
 *
 * To add a new provider:
 *   Add it inside buildProviders() before ManualResolutionProvider. Done.
 *
 * Logging format: "Provider N/M: <name>" for easy production debugging.
 */

import path from 'path';
import { log } from '../../utils/logger';
import { YouTubeCaptionProvider } from './providers/youtubeCaptionProvider';
import { YtDlpWhisperProvider } from './providers/ytDlpWhisperProvider';
import { ManualResolutionProvider, classifyManualReason } from './providers/manualResolutionProvider';
import { TranscriptUnavailableError, YouTubeBlockedError } from './providers/types';
import type { YouTubeTranscriptProvider } from './providers/types';
import type { TranscriptResult } from '../../services/transcription/types';

const TEMP_DIR = path.resolve(__dirname, '../../../temp');

/**
 * Build the ordered provider list.
 * ManualResolutionProvider is always last — it is constructed at exhaustion time
 * with the accumulated errors, so it is NOT included in this list.
 *
 * Add future providers here:
 *   new InnerTubeCaptionProvider(),
 *   new DeepgramYouTubeProvider(),
 */
function buildProviders(): YouTubeTranscriptProvider[] {
  return [
    new YouTubeCaptionProvider(),       // 1. Free, instant — public captions
    new YtDlpWhisperProvider(TEMP_DIR), // 2. yt-dlp + ffmpeg + Groq Whisper
  ];
}

/**
 * Extract a transcript from a YouTube video using the best available provider.
 *
 * Always returns a TranscriptResult. Never throws.
 * If all real providers fail, returns a ManualResolutionProvider result where
 *   result.metadata.manualResolutionRequired === true.
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
  let hardBlocked = false;

  for (let i = 0; i < providers.length; i++) {
    // If YouTube hard-blocked a previous provider, skip remaining real providers.
    if (hardBlocked) break;

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
        // Hard failure — record and break; ManualResolutionProvider will run next.
        log.warn(
          'TranscriptRouter',
          `Provider ${position}: ${provider.name} — HARD FAIL (YouTube blocked, ${durationMs}ms): ${err.message}`
        );
        errors.push(`[${provider.name}][BLOCKED] ${err.message}`);
        hardBlocked = true;
        break;
      }

      if (err instanceof TranscriptUnavailableError) {
        // Soft failure — continue to next provider.
        log.warn(
          'TranscriptRouter',
          `Provider ${position}: ${provider.name} — unavailable (${durationMs}ms): ${err.message}`
        );
        errors.push(`[${provider.name}] ${err.message}`);
        continue;
      }

      // Unexpected error — treat as soft, continue.
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(
        'TranscriptRouter',
        `Provider ${position}: ${provider.name} — unexpected error (${durationMs}ms): ${msg}`
      );
      errors.push(`[${provider.name}][UNEXPECTED] ${msg}`);
      continue;
    }
  }

  // ── All providers exhausted (or hard-blocked) ─────────────────────────────
  // Run the terminal ManualResolutionProvider. It always succeeds.
  const reason = classifyManualReason(errors);

  log.warn(
    'TranscriptRouter',
    `All ${total} provider(s) exhausted for video ${videoId}. Reason: ${reason}. Delegating to ManualResolutionProvider.`
  );

  const terminal = new ManualResolutionProvider({ accumulatedErrors: errors, reason });
  return terminal.extract(videoId, url, onStage);
}
