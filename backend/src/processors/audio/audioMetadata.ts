import fs from 'fs';
import { log } from '../../utils/logger';

/**
 * audioMetadata.ts
 *
 * Single responsibility: extract metadata from a validated audio file.
 * Does NOT perform transcription.
 * Does NOT write to the database.
 *
 * Uses only Node built-ins and fs — no ffprobe dependency needed for the
 * fields we currently require (size, mime type). Duration/bitrate/sample-rate
 * are derived from the Whisper response in the processor after transcription.
 *
 * Metadata is stored in the ai_jobs.metadata JSONB column via the processor.
 */

export interface AudioFileMetadata {
  fileName:        string;
  extension:       string;
  mimeType:        string;
  sizeBytes:       number;
  sizeMb:          number;
  /** Populated after transcription from the Whisper verbose_json response */
  durationSeconds?: number;
}

/**
 * Reads and returns available file-level metadata for an audio file.
 *
 * @param filePath   Absolute path to the audio file
 * @param fileName   Original filename
 * @param extension  Validated file extension (e.g. '.mp3')
 * @param mimeType   Validated MIME type
 */
export function extractAudioMetadata(
  filePath:  string,
  fileName:  string,
  extension: string,
  mimeType:  string
): AudioFileMetadata {
  log.info('AudioMetadata', 'Reading file metadata', { 'File': filePath });

  const stats = fs.statSync(filePath);
  const sizeMb = parseFloat((stats.size / 1024 / 1024).toFixed(2));

  const metadata: AudioFileMetadata = {
    fileName,
    extension,
    mimeType,
    sizeBytes: stats.size,
    sizeMb,
  };

  log.success('AudioMetadata', 'Metadata extracted', {
    'File':      fileName,
    'Extension': extension,
    'MIME':      mimeType,
    'Size':      `${sizeMb} MB`,
    'Bytes':     stats.size,
  });

  return metadata;
}
