import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import type { TranscriptResult } from './types';
import { log } from '../../utils/logger';
import { deleteTempFile } from '../../media/mediaNormalizer';
import { probeMedia } from '../../media/mediaProbe';

export interface AudioChunkingResult {
  chunkPaths: string[];
  chunkDurationsSeconds: number[];
  totalDurationSeconds: number;
  chunkLengthSeconds: number;
}

const DEFAULT_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const PCM16_MONO_16K_BYTES_PER_SECOND = 16000 * 2;

export async function splitAudioIntoChunks(filePath: string, chunkLengthSeconds = 600): Promise<AudioChunkingResult> {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary not found. Run: npm install ffmpeg-static');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at: ${filePath}`);
  }

  const sourceProbe = await probeMedia(filePath);
  log.info('AudioSplitter', 'Splitting normalized audio', {
    'Source': filePath,
    'Codec': sourceProbe.codec,
    'Sample rate': `${sourceProbe.sampleRate} Hz`,
    'Channels': String(sourceProbe.channels),
    'Bitrate': `${Math.round(sourceProbe.bitrate / 1000)} kbps`,
    'Duration': `${sourceProbe.duration.toFixed(2)}s`,
    'Size': `${(sourceProbe.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
  });

  if (sourceProbe.codec !== 'pcm_s16le' || sourceProbe.sampleRate !== 16000 || sourceProbe.channels !== 1) {
    throw new Error(
      `Splitter requires PCM16/WAV/16kHz/mono input before chunking. ` +
      `Got codec=${sourceProbe.codec}, sampleRate=${sourceProbe.sampleRate}, channels=${sourceProbe.channels}`
    );
  }
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary not found. Run: npm install ffmpeg-static');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at: ${filePath}`);
  }

  const outputDir = path.dirname(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));
  const chunkPaths: string[] = [];

  const safeChunkLengthSeconds = Math.max(1, Math.floor(getProviderSafeChunkLengthSeconds(chunkLengthSeconds)));

  const args = [
    '-y',
    '-i', filePath,
    '-f', 'segment',
    '-segment_time', String(safeChunkLengthSeconds),
    '-c:a', 'pcm_s16le',
    `${path.join(outputDir, `${baseName}-%03d.wav`)}`,
  ];

  await runFfmpeg(args);

  const files = fs.readdirSync(outputDir)
    .filter((name) => name.startsWith(`${baseName}-`) && name.endsWith('.wav'))
    .sort()
    .map((name) => path.join(outputDir, name));

  for (const chunkPath of files) {
    if (fs.existsSync(chunkPath)) {
      chunkPaths.push(chunkPath);
    }
  }

  if (chunkPaths.length === 0) {
    throw new Error(`No audio chunks were generated for: ${filePath}`);
  }

  const chunkDurationsSeconds = [] as number[];
  for (const chunkPath of chunkPaths) {
    const probe = await probeMedia(chunkPath);
    const durationSeconds = probe.duration > 0 ? probe.duration : Math.max(1, Math.round((probe.sizeBytes - 44) / (16000 * 2)));
    chunkDurationsSeconds.push(durationSeconds);

    log.info('AudioSplitter', 'Chunk probe', {
      'Chunk': chunkPath,
      'Codec': probe.codec,
      'Sample rate': `${probe.sampleRate} Hz`,
      'Channels': String(probe.channels),
      'Bitrate': `${Math.round(probe.bitrate / 1000)} kbps`,
      'Duration': `${durationSeconds.toFixed(2)}s`,
      'Size': `${(probe.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
    });
  }

  return {
    chunkPaths,
    chunkDurationsSeconds,
    totalDurationSeconds: chunkDurationsSeconds.reduce((sum, value) => sum + value, 0),
    chunkLengthSeconds: safeChunkLengthSeconds,
  };
}

export async function cleanupChunkFiles(chunkPaths: string[]): Promise<void> {
  for (const chunkPath of chunkPaths) {
    deleteTempFile(chunkPath);
  }
}

export function mergeTranscriptChunks(chunks: TranscriptResult[], source: TranscriptResult['source']): TranscriptResult {
  const mergedText = chunks.map((chunk) => chunk.text.trim()).filter(Boolean).join(' ');
  const language = chunks.find((chunk) => chunk.language && chunk.language !== 'unknown')?.language ?? 'unknown';
  const durationSeconds = chunks.reduce((sum, chunk) => sum + (chunk.durationSeconds || 0), 0);
  const wordCount = chunks.reduce((sum, chunk) => sum + (chunk.wordCount || 0), 0);
  const charCount = mergedText.length;
  const processingTimeMs = chunks.reduce((sum, chunk) => sum + (chunk.processingTimeMs || 0), 0);

  return {
    text: mergedText,
    language,
    durationSeconds,
    wordCount,
    charCount,
    processingTimeMs,
    source,
    provider: chunks[0]?.provider ?? 'unknown',
  };
}

function getProviderSafeChunkLengthSeconds(requestedSeconds: number): number {
  const configuredMaxUploadBytes = Number(process.env.GROQ_MAX_UPLOAD_BYTES || DEFAULT_MAX_UPLOAD_BYTES);
  const maxUploadBytes = Math.max(1, configuredMaxUploadBytes);
  const bytesPerSecond = Number(process.env.AUDIO_BYTES_PER_SECOND || PCM16_MONO_16K_BYTES_PER_SECOND);
  const perSecondBytes = Math.max(1, bytesPerSecond);
  const derivedSeconds = Math.floor(maxUploadBytes / perSecondBytes);
  return Math.min(requestedSeconds, Math.max(1, derivedSeconds));
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath as string,
      args,
      { shell: false, maxBuffer: 100 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(`ffmpeg chunking failed (exit ${error.code}): ${stderr?.trim() || error.message}`));
        } else {
          resolve();
        }
      }
    );
  });
}
