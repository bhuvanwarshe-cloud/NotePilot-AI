import fs from 'fs';
import path from 'path';
import { normalizeToWav } from '../media/mediaNormalizer';
import { splitAudioIntoChunks } from './transcription/audioSplitter';
import { log } from '../utils/logger';

export interface PreparedMediaResult {
  normalizedPath: string;
  chunkPaths: string[];
  chunkLengthSeconds: number;
}

export async function prepareMediaForTranscription(
  sourceFilePath: string,
  outputDir: string,
  label: string
): Promise<PreparedMediaResult> {
  const normalizedFileName = `${path.basename(sourceFilePath, path.extname(sourceFilePath))}-${label}-normalized.wav`;
  const normalizedPath = path.join(outputDir, normalizedFileName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  log.info('MediaPreparation', 'Normalizing media for transcription', {
    'Source': sourceFilePath,
    'Output': normalizedPath,
    'Label': label,
  });

  const normalizeResult = await normalizeToWav(sourceFilePath, normalizedPath);

  log.success('MediaPreparation', 'Media normalized', {
    'Normalized path': normalizedPath,
    'Duration': `${normalizeResult.durationSeconds.toFixed(1)}s`,
    'Size': `${(normalizeResult.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
  });

  const splitResult = await splitAudioIntoChunks(normalizedPath, Number(process.env.AUDIO_CHUNK_LENGTH_SECONDS || 600));

  log.success('MediaPreparation', 'Media prepared for transcription', {
    'Normalized path': normalizedPath,
    'Chunk count': String(splitResult.chunkPaths.length),
    'Chunk duration': `${splitResult.chunkLengthSeconds}s`,
  });

  return {
    normalizedPath,
    chunkPaths: splitResult.chunkPaths,
    chunkLengthSeconds: splitResult.chunkLengthSeconds,
  };
}
