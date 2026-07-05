import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';
import { log } from '../utils/logger';
import { probeMedia } from './mediaProbe';

/**
 * mediaNormalizer.ts
 *
 * Single responsibility: convert any media file (audio or video) into a
 * normalized WAV file suitable for Whisper transcription.
 *
 * Target format (matches Whisper's optimal input):
 *   Container : WAV
 *   Codec     : PCM 16-bit little-endian (pcm_s16le)
 *   Channels  : Mono (1)
 *   Sample Rate: 16,000 Hz
 *
 * WHY always normalize?
 * ─────────────────────
 * Groq Whisper accepts many formats but produces inconsistent results
 * depending on codec, sample rate, and channel layout. Normalizing to a
 * known-good format before every transcription call:
 *   1. Eliminates codec edge cases
 *   2. Reduces file size (mono 16kHz uses ~1/6th the space of stereo 44.1kHz)
 *   3. Makes every processor produce identical Whisper input
 *   4. Enables silence detection on a known format
 *
 * This module is reused by: AudioProcessor, VideoProcessor (future),
 * YouTubeDownloader could also route through here for consistency.
 */

/** Silence threshold: max_volume below this = silent recording */
const SILENCE_THRESHOLD_DB = -55.0;

export interface NormalizeResult {
  outputPath:       string;
  durationSeconds:  number;
  sizeBytes:        number;
  normalizationMs:  number;
}

export interface SilenceCheckResult {
  isSilent:    boolean;
  maxVolumeDb: number;
  meanVolumeDb: number;
}

/**
 * Converts any audio/video file to WAV 16kHz mono PCM.
 *
 * @param inputPath   Absolute path to the source file (any format)
 * @param outputPath  Absolute path for the output WAV file
 * @returns           Metadata about the normalized file
 * @throws            Descriptive error if ffmpeg fails
 */
export async function normalizeToWav(
  inputPath:  string,
  outputPath: string
): Promise<NormalizeResult> {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary not found. Run: npm install ffmpeg-static');
  }

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Normalizer: input file not found: ${inputPath}`);
  }

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  log.info('MediaNormalizer', 'Starting normalization', {
    'Input':        inputPath,
    'Output':       outputPath,
    'Target':       'WAV / pcm_s16le / 16000 Hz / mono',
  });

  const args: string[] = [
    '-y',                      // overwrite output without asking
    '-i', inputPath,           // input file
    '-vn',                     // drop video stream (extract audio only)
    '-ar', '16000',            // resample to 16,000 Hz
    '-ac', '1',                // downmix to mono
    '-acodec', 'pcm_s16le',    // encode as PCM 16-bit little-endian
    '-f', 'wav',               // output container: WAV
    outputPath,
  ];

  log.info('MediaNormalizer', 'ffmpeg args', {
    'Binary': ffmpegPath,
    'Args':   args.join(' '),
  });

  const startMs = Date.now();
  await runFfmpeg(args);
  const normalizationMs = Date.now() - startMs;

  if (!fs.existsSync(outputPath)) {
    throw new Error(`Normalizer: ffmpeg exited 0 but output file not found: ${outputPath}`);
  }

  const stats = fs.statSync(outputPath);
  if (stats.size === 0) {
    throw new Error(`Normalizer: output WAV is 0 bytes — ffmpeg produced no audio`);
  }

  const probe = await probeMedia(outputPath);
  const isExpectedFormat =
    probe.container.includes('wav') &&
    probe.codec === 'pcm_s16le' &&
    probe.sampleRate === 16000 &&
    probe.channels === 1;

  if (!isExpectedFormat) {
    throw new Error(
      `Normalizer: output format did not match expected WAV/pcm_s16le/16000Hz/mono. ` +
      `Got container=${probe.container}, codec=${probe.codec}, sampleRate=${probe.sampleRate}, channels=${probe.channels}`
    );
  }

  // Duration from WAV header: data chunk size / (sampleRate * channels * bytesPerSample)
  // For pcm_s16le mono 16kHz: duration = (size - 44) / (16000 * 1 * 2)
  const pcmBytes = Math.max(0, stats.size - 44);
  const durationSeconds = pcmBytes / (16000 * 1 * 2);

  log.success('MediaNormalizer', 'Normalization complete', {
    'Output':           outputPath,
    'Size':             `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    'Duration':         `${durationSeconds.toFixed(1)}s`,
    'Normalization ms': normalizationMs,
    'Codec':            probe.codec,
    'Sample rate':      `${probe.sampleRate} Hz`,
    'Channels':         String(probe.channels),
  });

  return { outputPath, durationSeconds, sizeBytes: stats.size, normalizationMs };
}

/**
 * Detects silence in a WAV file using ffmpeg's volumedetect filter.
 * Should be called AFTER normalizeToWav() with the output WAV path.
 *
 * @param wavPath  Path to the normalized WAV file
 */
export async function detectSilence(wavPath: string): Promise<SilenceCheckResult> {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static not found');
  }

  log.info('MediaNormalizer', 'Running silence detection', { 'File': wavPath });

  const args: string[] = [
    '-i', wavPath,
    '-af', 'volumedetect',
    '-f', 'null',
    '-',
  ];

  // volumedetect outputs to stderr
  const stderr = await runFfmpegStderr(args);

  const maxMatch  = stderr.match(/max_volume:\s*([-\d.]+)\s*dB/);
  const meanMatch = stderr.match(/mean_volume:\s*([-\d.]+)\s*dB/);

  const maxVolumeDb  = maxMatch  ? parseFloat(maxMatch[1])  : -Infinity;
  const meanVolumeDb = meanMatch ? parseFloat(meanMatch[1]) : -Infinity;

  const isSilent = maxVolumeDb < SILENCE_THRESHOLD_DB;

  log.info('MediaNormalizer', 'Silence detection result', {
    'Max volume':  `${maxVolumeDb} dB`,
    'Mean volume': `${meanVolumeDb} dB`,
    'Threshold':   `${SILENCE_THRESHOLD_DB} dB`,
    'Is silent':   String(isSilent),
  });

  return { isSilent, maxVolumeDb, meanVolumeDb };
}

/**
 * Deletes a temp file safely. Never throws — cleanup failure must not crash the pipeline.
 */
export function deleteTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log.success('MediaNormalizer', `Temp file deleted: ${filePath}`);
    }
  } catch (err) {
    log.warn('MediaNormalizer', `Could not delete temp file "${filePath}": ${err}`);
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath as string,
      args,
      { shell: false, maxBuffer: 100 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        if (stderr?.trim()) {
          // ffmpeg always writes progress to stderr — log at debug level only on error
          if (error) {
            console.log(`  [ffmpeg stderr]\n${stderr.trim()}`);
          }
        }
        if (error) {
          reject(new Error(
            `ffmpeg normalization failed (exit ${error.code}):\n` +
            `${stderr?.trim() || error.message}`
          ));
        } else {
          resolve();
        }
      }
    );
  });
}

function runFfmpegStderr(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath as string,
      args,
      { shell: false, maxBuffer: 10 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        // volumedetect always "fails" because output is /dev/null — exit code 1 is normal
        // We only reject on actual errors (missing file, etc.)
        if (error && error.code !== 1 && !stderr?.includes('volumedetect')) {
          if (!stderr?.includes('mean_volume') && !stderr?.includes('max_volume')) {
            reject(new Error(
              `ffmpeg volumedetect failed (exit ${error.code}): ${stderr?.trim()}`
            ));
            return;
          }
        }
        resolve(stderr ?? '');
      }
    );
  });
}
