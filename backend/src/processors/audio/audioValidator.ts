import fs from 'fs';
import path from 'path';
import { log } from '../../utils/logger';

/**
 * audioValidator.ts
 *
 * First-pass validation: fast checks that don't require running any binaries.
 * Deep codec/stream validation is delegated to mediaInspector (ffprobe).
 *
 * Accepts ALL common lecture recording formats.
 * Rejects only: empty files, files over the size limit, and unknown types.
 *
 * DESIGN: No magic byte checks here. Magic bytes are format-specific and
 * fragile — some containers (e.g. OGG, OPUS, CAF) have non-obvious
 * signatures. ffprobe handles this correctly.
 */

/**
 * Every MIME type that can plausibly contain audio from a lecture recording.
 * When in doubt, include it — ffprobe will catch non-audio content later.
 */
const SUPPORTED_MIME_TYPES = new Set([
  // MP3
  'audio/mpeg', 'audio/mp3',
  // WAV
  'audio/wav', 'audio/x-wav', 'audio/wave',
  // M4A / AAC in MP4 container
  'audio/m4a', 'audio/x-m4a', 'audio/mp4',
  // AAC raw
  'audio/aac', 'audio/x-aac',
  // OGG / OGA / OPUS
  'audio/ogg', 'audio/oga', 'audio/opus', 'application/ogg',
  // FLAC
  'audio/flac', 'audio/x-flac',
  // AIFF
  'audio/aiff', 'audio/x-aiff',
  // AMR (voice notes — Android, WhatsApp)
  'audio/amr', 'audio/amr-nb', 'audio/amr-wb',
  // 3GP (mobile recordings)
  'audio/3gpp', 'audio/3gpp2',
  // WEBM audio (browser recordings, Google Meet)
  'audio/webm',
  // CAF (iOS voice recordings)
  'audio/x-caf',
  // Video containers that may carry audio-only content
  // (MP4 lectures, Zoom/Meet/Teams recordings, screen recordings)
  'video/mp4', 'video/quicktime', 'video/webm',
  'video/x-matroska', 'video/3gpp', 'video/3gpp2',
  'video/mpeg', 'video/x-msvideo',
  // Octet-stream fallback (some mobile apps send this)
  'application/octet-stream',
]);

/** Extensions that correspond to the supported MIME types above */
const SUPPORTED_EXTENSIONS = new Set([
  '.mp3', '.wav', '.m4a', '.aac',
  '.ogg', '.oga', '.opus',
  '.flac', '.aiff', '.aif',
  '.amr', '.3gp', '.3gpp',
  '.webm', '.caf',
  '.mp4', '.mov', '.mkv', '.avi',
]);

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

/**
 * Real audio files are never under 1 KB.
 * Sub-1KB "files" are Windows .lnk shortcuts, HTML error pages,
 * or browser bookmarks accidentally dropped into the file picker.
 */
const MIN_FILE_SIZE_BYTES = 1024;

export interface AudioValidationResult {
  filePath:  string;
  fileName:  string;
  extension: string;
  mimeType:  string;
  sizeBytes: number;
}

export function validateAudioFile(
  filePath:  string,
  mimeType:  string,
  fileName:  string
): AudioValidationResult {
  log.info('AudioValidator', 'Validating uploaded file', {
    'File': fileName,
    'MIME': mimeType,
    'Path': filePath,
    'Size': fs.existsSync(filePath) ? `${fs.statSync(filePath).size} bytes` : '(file missing)',
  });

  // ── 1. File must exist on disk ────────────────────────────────────────────
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Uploaded file not found on disk: ${filePath}\n` +
      `Stage: validation\n` +
      `Action: The server may have failed to save the upload buffer. Try uploading again.`
    );
  }

  const stats = fs.statSync(filePath);

  // ── 2. Must not be empty ──────────────────────────────────────────────────
  if (stats.size === 0) {
    throw new Error(
      `Uploaded file "${fileName}" is empty (0 bytes).\n` +
      `Stage: validation\n` +
      `Action: The upload may have been interrupted. Try again.`
    );
  }

  // ── 3. Minimum size guard (shortcuts / broken uploads) ───────────────────
  if (stats.size < MIN_FILE_SIZE_BYTES) {
    throw new Error(
      `Uploaded file "${fileName}" is only ${stats.size} bytes — ` +
      `too small to contain audio (minimum 1 KB).\n` +
      `Stage: validation\n` +
      `Reason: The file may be a Windows shortcut (.lnk), a browser bookmark, ` +
      `or was not fully uploaded. Check the file on your device.`
    );
  }

  // ── 4. Maximum size ───────────────────────────────────────────────────────
  if (stats.size > MAX_FILE_SIZE_BYTES) {
    const mb = (stats.size / 1024 / 1024).toFixed(1);
    throw new Error(
      `File "${fileName}" is ${mb} MB — exceeds the 200 MB upload limit.\n` +
      `Stage: validation\n` +
      `Action: Trim the recording or split it into shorter segments.`
    );
  }

  // ── 5. MIME type check ────────────────────────────────────────────────────
  const normalizedMime = mimeType.toLowerCase().trim();
  if (!SUPPORTED_MIME_TYPES.has(normalizedMime)) {
    throw new Error(
      `Unsupported file type "${mimeType}".\n` +
      `Stage: validation\n` +
      `Supported formats: MP3, WAV, M4A, AAC, OGG, OPUS, FLAC, AIFF, AMR, ` +
      `WEBM, 3GP, MP4, MOV, CAF, and more.\n` +
      `Action: Convert the file to MP3 or M4A and try again.`
    );
  }

  // ── 6. Extension check ────────────────────────────────────────────────────
  const extension = path.extname(fileName).toLowerCase();
  if (extension && !SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(
      `Unsupported file extension "${extension}".\n` +
      `Stage: validation\n` +
      `Supported extensions: ${[...SUPPORTED_EXTENSIONS].join(', ')}.`
    );
  }

  // Deep validation (codec, streams, silence) is done by mediaInspector + mediaNormalizer
  const result: AudioValidationResult = {
    filePath,
    fileName,
    extension: extension || path.extname(fileName).toLowerCase(),
    mimeType: normalizedMime,
    sizeBytes: stats.size,
  };

  log.success('AudioValidator', 'First-pass validation passed', {
    'File':      fileName,
    'Extension': result.extension,
    'MIME':      normalizedMime,
    'Size':      `${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`,
  });

  return result;
}
