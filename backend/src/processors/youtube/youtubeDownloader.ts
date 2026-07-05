import { execFile } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { log } from '../../utils/logger';

export type YouTubeDownloadErrorCode = 'YOUTUBE_ACCESS_DENIED' | 'YOUTUBE_DOWNLOAD_FAILED' | 'YOUTUBE_RETRY_EXHAUSTED';

export class YouTubeDownloadError extends Error {
  constructor(
    message: string,
    public readonly code: YouTubeDownloadErrorCode,
    public readonly retryable: boolean = false,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'YouTubeDownloadError';
  }
}

/**
 * youtubeDownloader.ts
 *
 * Single responsibility: download audio-only from a YouTube URL.
 *
 * WHY NOT youtube-dl-exec wrapper?
 * ─────────────────────────────────
 * The youtube-dl-exec wrapper activates shell=true on Windows whenever the
 * binary path contains spaces (e.g. "C:\NotePilot AI\..."). In shell mode,
 * CLI arguments are concatenated into one string without quoting — so an
 * output path like "C:\NotePilot AI\backend\temp\<id>.%(ext)s" is split at
 * the space by cmd.exe. yt-dlp receives "C:\NotePilot" as the -o value and
 * "AI\backend\..." as a second download target, triggering:
 *   "Fixed output name but more than one file to download: C:\NotePilot"
 *
 * FIX: use child_process.execFile() directly.
 * execFile() NEVER uses a shell — each element of the args array is passed
 * as a separate, unmodified argument regardless of spaces or special chars.
 */

// Resolve the bundled yt-dlp binary from youtube-dl-exec at import time.
const { YOUTUBE_DL_PATH } = require('youtube-dl-exec/src/constants') as {
  YOUTUBE_DL_PATH: string;
};

export async function downloadAudio(
  url: string,
  videoId: string,
  tempDir: string
): Promise<string> {
  const maxRetries = Number(process.env.YOUTUBE_MAX_RETRIES || 3);
  const retryDelayMs = Number(process.env.YOUTUBE_RETRY_DELAY_MS || 2000);

  // ── Pre-flight checks ─────────────────────────────────────────────────────
  log.info('Downloader', 'Pre-flight checks');

  log.info('Downloader', 'yt-dlp binary path', { 'Binary': YOUTUBE_DL_PATH });
  if (!fs.existsSync(YOUTUBE_DL_PATH)) {
    throw new YouTubeDownloadError(
      `yt-dlp binary not found at: ${YOUTUBE_DL_PATH}\nRun: npm install youtube-dl-exec`,
      'YOUTUBE_DOWNLOAD_FAILED',
      false
    );
  }
  log.success('Downloader', 'yt-dlp binary exists');

  log.info('Downloader', 'ffmpeg binary path', { 'ffmpeg': ffmpegPath ?? '(null)' });
  if (!ffmpegPath) {
    throw new YouTubeDownloadError('ffmpeg-static binary not found. Run: npm install ffmpeg-static', 'YOUTUBE_DOWNLOAD_FAILED', false);
  }
  log.success('Downloader', 'ffmpeg binary exists');

  if (!fs.existsSync(tempDir)) {
    log.info('Downloader', `Creating temp directory: ${tempDir}`);
    fs.mkdirSync(tempDir, { recursive: true });
  }
  log.info('Downloader', 'Temp directory ready', { 'Temp Dir': tempDir });

  // ── Construct output template ─────────────────────────────────────────────
  // %(ext)s lets yt-dlp resolve the actual extension.
  // path.join() guarantees correct OS separators.
  const outputTemplate = path.join(tempDir, `${videoId}.%(ext)s`);

  // ── Build args array ──────────────────────────────────────────────────────
  // Each element is a SEPARATE argument — execFile() never joins them through
  // a shell, so spaces in paths are completely safe.
  const args: string[] = [
    '--extract-audio',
    '--audio-format', 'm4a',
    '--audio-quality', '0',
    '--no-playlist',
    '--no-warnings',
    '--ffmpeg-location', ffmpegPath,
    ...getCookieArgs(),
    '-o', outputTemplate,
    url,
  ];

  // ── Log the exact command ─────────────────────────────────────────────────
  log.info('Downloader', 'Executing yt-dlp', {
    'Binary':          YOUTUBE_DL_PATH,
    'ffmpeg':          ffmpegPath,
    'Output template': outputTemplate,
    'URL':             url,
  });
  console.log('');
  console.log('  [yt-dlp exact command]');
  console.log(`  ${YOUTUBE_DL_PATH}`);
  args.forEach((a, i) => console.log(`    [${String(i).padStart(2, '0')}] ${a}`));
  console.log('');

  // ── Execute with retries for transient failures ─────────────────────────
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await runExecFile(YOUTUBE_DL_PATH, args);

      const files = fs.readdirSync(tempDir).filter((f) => f.startsWith(videoId));
      log.info('Downloader', `Files in temp dir matching videoId "${videoId}"`, {
        'Matches': files.length > 0 ? files.join(', ') : '(none)',
        'Attempt': attempt,
      });

      if (files.length === 0) {
        throw new YouTubeDownloadError(
          `yt-dlp exited 0 but no file found starting with "${videoId}" in ${tempDir}`,
          'YOUTUBE_DOWNLOAD_FAILED',
          true
        );
      }

      const resolvedPath = path.join(tempDir, files[0]);
      const stats = fs.statSync(resolvedPath);

      if (stats.size === 0) {
        throw new YouTubeDownloadError(`Downloaded file is empty (0 bytes): ${resolvedPath}`, 'YOUTUBE_DOWNLOAD_FAILED', true);
      }

      log.success('Downloader', 'Audio downloaded successfully', {
        'File':     resolvedPath,
        'Size':     `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        'Bytes':    stats.size,
        'Modified': stats.mtime.toISOString(),
        'Attempt':  attempt,
      });

      return resolvedPath;
    } catch (error) {
      lastError = error;
      if (error instanceof YouTubeDownloadError && !error.retryable) {
        throw error;
      }

      if (attempt < maxRetries) {
        log.warn('Downloader', `Download attempt ${attempt} failed; retrying in ${retryDelayMs}ms`);
        await delay(retryDelayMs);
      }
    }
  }

  if (lastError instanceof YouTubeDownloadError) {
    throw new YouTubeDownloadError(
      lastError.message,
      'YOUTUBE_RETRY_EXHAUSTED',
      false,
      lastError.details
    );
  }

  throw new YouTubeDownloadError('yt-dlp download failed after retries', 'YOUTUBE_RETRY_EXHAUSTED', false);
}

/**
 * Wraps child_process.execFile() in a Promise.
 * On non-zero exit, throws with full stderr + stdout for debugging.
 */
function runExecFile(binary: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      binary,
      args,
      { shell: false, maxBuffer: 100 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (stdout?.trim()) {
          console.log(`  [yt-dlp stdout]\n${stdout.trim()}`);
        }
        if (stderr?.trim()) {
          console.log(`  [yt-dlp stderr]\n${stderr.trim()}`);
        }
        if (error) {
          const combined = `${stdout}\n${stderr}`.toLowerCase();
          const challengeMessage = classifyAccessError(combined);
          if (challengeMessage) {
            reject(new YouTubeDownloadError(challengeMessage, 'YOUTUBE_ACCESS_DENIED', false, combined));
            return;
          }

          const transientMessage = classifyTransientError(combined);
          reject(new YouTubeDownloadError(
            `yt-dlp failed (exit ${error.code}):\n` +
            `stderr: ${stderr?.trim() || '(empty)'}\n` +
            `stdout: ${stdout?.trim() || '(empty)'}\n` +
            `message: ${error.message}`,
            transientMessage ? 'YOUTUBE_DOWNLOAD_FAILED' : 'YOUTUBE_DOWNLOAD_FAILED',
            transientMessage
          ));
          return;
        }

        log.success('Downloader', `yt-dlp exited 0`);
        resolve();
      }
    );
  });
}

function getCookieArgs(): string[] {
  const useCookies = process.env.YOUTUBE_USE_BROWSER_COOKIES === 'true' || process.env.YOUTUBE_USE_BROWSER_COOKIES === '1';
  if (!useCookies) {
    return [];
  }

  const cookieFile = process.env.YOUTUBE_COOKIE_FILE?.trim();
  if (cookieFile) {
    log.info('Downloader', 'Using configured cookie file', { 'Cookie file': cookieFile });
    return ['--cookies', cookieFile];
  }

  const browser = process.env.YOUTUBE_COOKIE_BROWSER?.trim() || 'chrome';
  log.info('Downloader', 'Using browser cookies', { 'Browser': browser });
  return ['--cookies-from-browser', browser];
}

function classifyAccessError(output: string): string | null {
  const patterns = [
    /sign in to confirm your age/i,
    /requires authentication/i,
    /login required/i,
    /private video/i,
    /this video is unavailable/i,
    /this video may be private/i,
    /age-restricted/i,
    /captcha/i,
    /bot/i,
    /challenge/i,
    /not publicly accessible/i,
  ];

  return patterns.some((pattern) => pattern.test(output))
    ? 'This video requires authentication or is not publicly accessible.'
    : null;
}

function classifyTransientError(output: string): boolean {
  const patterns = [
    /429/i,
    /rate limit/i,
    /timed out/i,
    /timeout/i,
    /network/i,
    /connection reset/i,
    /socket hang up/i,
    /temporarily unavailable/i,
    /http error 5/i,
    /failed to download webpage/i,
    /unable to download webpage/i,
  ];

  return patterns.some((pattern) => pattern.test(output));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely deletes a file. Silently swallows errors — cleanup must never crash.
 */
export function cleanupTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log.success('Downloader', `Temp file deleted: ${filePath}`);
    } else {
      log.info('Downloader', `No temp file found at: ${filePath}`);
    }
  } catch (err) {
    log.warn('Downloader', `Failed to delete temp file "${filePath}": ${err}`);
  }
}
