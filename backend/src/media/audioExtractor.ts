/**
 * audioExtractor.ts
 *
 * Single responsibility: extract the audio track from a video container
 * (MP4, MOV, MKV, WEBM, etc.) into a temporary audio-only file.
 *
 * The output is then passed to mediaNormalizer.ts for normalization.
 *
 * Status: STUB — will be implemented in Phase 6C.3 (Video Pipeline).
 *
 * All processors share this path:
 *
 *   Video File   → audioExtractor  → raw audio file
 *   YouTube URL  → youtubeDownloader → raw audio file
 *   Audio File   → (skip extraction)
 *                         ↓
 *               mediaNormalizer (all above)
 *                         ↓
 *               WAV 16kHz mono PCM
 *                         ↓
 *               TranscriptionService (Groq Whisper)
 *                         ↓
 *               TranscriptService (save + status)
 */

export async function extractAudio(
  _videoPath: string,
  _outputPath: string
): Promise<string> {
  throw new Error(
    'audioExtractor is not yet implemented. ' +
    'It will be built in Phase 6C.3 (Video Pipeline).'
  );
}
