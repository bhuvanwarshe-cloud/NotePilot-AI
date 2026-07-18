import { execFile } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { log } from '../../utils/logger';

export type YouTubeDownloadErrorCode =
  | 'YOUTUBE_ACCESS_DENIED'
  | 'YOUTUBE_DOWNLOAD_FAILED'
  | 'YOUTUBE_RETRY_EXHAUSTED';

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
 * Single responsibility:
 * Download audio-only from a YouTube URL using the bundled yt-dlp binary.
 *
 * Uses execFile() directly instead of the youtube-dl-exec wrapper.
 *
 * Why:
 * - No shell is used.
 * - Paths containing spaces are safe.
 * - Arguments are passed independently.
 * - stdout/stderr can be inspected.
 * - We can enforce an explicit timeout.
 * - YouTube access errors can be classified consistently.
 */

// Resolve bundled yt-dlp binary.
const { YOUTUBE_DL_PATH } = require(
  'youtube-dl-exec/src/constants'
) as {
  YOUTUBE_DL_PATH: string;
};


/**
 * Downloads audio from YouTube.
 */
export async function downloadAudio(
  url: string,
  videoId: string,
  tempDir: string
): Promise<string> {

  const maxRetries = Number(
    process.env.YOUTUBE_MAX_RETRIES || 3
  );

  const retryDelayMs = Number(
    process.env.YOUTUBE_RETRY_DELAY_MS || 2000
  );


  // ───────────────────────────────────────────────────────────────────────────
  // 1. Pre-flight checks
  // ───────────────────────────────────────────────────────────────────────────

  log.info(
    'Downloader',
    'Pre-flight checks'
  );


  // Check yt-dlp

  log.info(
    'Downloader',
    'yt-dlp binary path',
    {
      'Binary': YOUTUBE_DL_PATH,
    }
  );

  if (!fs.existsSync(YOUTUBE_DL_PATH)) {

    throw new YouTubeDownloadError(
      `yt-dlp binary not found at: ${YOUTUBE_DL_PATH}\n` +
      `Run: npm install youtube-dl-exec`,
      'YOUTUBE_DOWNLOAD_FAILED',
      false
    );

  }

  log.success(
    'Downloader',
    'yt-dlp binary exists'
  );


  // Check ffmpeg

  log.info(
    'Downloader',
    'ffmpeg binary path',
    {
      'ffmpeg': ffmpegPath ?? '(null)',
    }
  );

  if (!ffmpegPath) {

    throw new YouTubeDownloadError(
      'ffmpeg-static binary not found. Run: npm install ffmpeg-static',
      'YOUTUBE_DOWNLOAD_FAILED',
      false
    );

  }

  log.success(
    'Downloader',
    'ffmpeg binary exists'
  );


  // Ensure temp directory exists

  if (!fs.existsSync(tempDir)) {

    log.info(
      'Downloader',
      `Creating temp directory: ${tempDir}`
    );

    fs.mkdirSync(
      tempDir,
      {
        recursive: true,
      }
    );

  }

  log.info(
    'Downloader',
    'Temp directory ready',
    {
      'Temp Dir': tempDir,
    }
  );


  // ───────────────────────────────────────────────────────────────────────────
  // 2. Construct output path
  // ───────────────────────────────────────────────────────────────────────────

  const outputTemplate = path.join(
    tempDir,
    `${videoId}.%(ext)s`
  );


  // ───────────────────────────────────────────────────────────────────────────
  // 3. Build yt-dlp arguments
  // ───────────────────────────────────────────────────────────────────────────

  const args: string[] = [

    '--extract-audio',

    '--audio-format',
    'm4a',

    '--audio-quality',
    '0',

    '--no-playlist',

    '--no-warnings',

    '--ffmpeg-location',
    ffmpegPath,

    ...getCookieArgs(),

    '-o',
    outputTemplate,

    url,

  ];


  // ───────────────────────────────────────────────────────────────────────────
  // 4. Log command
  // ───────────────────────────────────────────────────────────────────────────

  log.info(
    'Downloader',
    'Executing yt-dlp',
    {
      'Binary': YOUTUBE_DL_PATH,
      'ffmpeg': ffmpegPath,
      'Output template': outputTemplate,
      'URL': url,
    }
  );


  console.log('');
  console.log('  [yt-dlp exact command]');
  console.log(`  ${YOUTUBE_DL_PATH}`);

  args.forEach(
    (arg, index) => {

      console.log(
        `    [${String(index).padStart(2, '0')}] ${arg}`
      );

    }
  );

  console.log('');


  // ───────────────────────────────────────────────────────────────────────────
  // 5. Execute with retries
  // ───────────────────────────────────────────────────────────────────────────

  let lastError: unknown;


  for (
    let attempt = 1;
    attempt <= maxRetries;
    attempt += 1
  ) {

    try {

      log.info(
        'Downloader',
        `Starting download attempt ${attempt}/${maxRetries}`
      );


      await runExecFile(
        YOUTUBE_DL_PATH,
        args
      );


      // ── Locate downloaded file ──────────────────────────────────────────────

      const files = fs
        .readdirSync(tempDir)
        .filter(
          (file) => file.startsWith(videoId)
        );


      log.info(
        'Downloader',
        `Files in temp dir matching videoId "${videoId}"`,
        {
          'Matches':
            files.length > 0
              ? files.join(', ')
              : '(none)',

          'Attempt':
            attempt,
        }
      );


      if (files.length === 0) {

        throw new YouTubeDownloadError(
          `yt-dlp exited 0 but no file found starting with ` +
          `"${videoId}" in ${tempDir}`,
          'YOUTUBE_DOWNLOAD_FAILED',
          true
        );

      }


      const resolvedPath = path.join(
        tempDir,
        files[0]
      );


      const stats = fs.statSync(
        resolvedPath
      );


      if (stats.size === 0) {

        throw new YouTubeDownloadError(
          `Downloaded file is empty (0 bytes): ${resolvedPath}`,
          'YOUTUBE_DOWNLOAD_FAILED',
          true
        );

      }


      log.success(
        'Downloader',
        'Audio downloaded successfully',
        {
          'File': resolvedPath,

          'Size':
            `${(
              stats.size /
              1024 /
              1024
            ).toFixed(2)} MB`,

          'Bytes':
            stats.size,

          'Modified':
            stats.mtime.toISOString(),

          'Attempt':
            attempt,
        }
      );


      return resolvedPath;


    } catch (error) {

      lastError = error;


      // ── Non-retryable error ────────────────────────────────────────────────

      if (
        error instanceof YouTubeDownloadError &&
        !error.retryable
      ) {

        log.error(
          'Downloader',
          `Non-retryable yt-dlp error: ${error.code}`,
          error
        );

        throw error;

      }


      // ── Retry ───────────────────────────────────────────────────────────────

      if (attempt < maxRetries) {

        log.warn(
          'Downloader',
          `Download attempt ${attempt} failed; ` +
          `retrying in ${retryDelayMs}ms`
        );


        await delay(
          retryDelayMs
        );

      }

    }

  }


  // ───────────────────────────────────────────────────────────────────────────
  // 6. Retry exhaustion
  // ───────────────────────────────────────────────────────────────────────────

  if (
    lastError instanceof YouTubeDownloadError
  ) {

    throw new YouTubeDownloadError(
      lastError.message,
      'YOUTUBE_RETRY_EXHAUSTED',
      false,
      lastError.details
    );

  }


  throw new YouTubeDownloadError(
    'yt-dlp download failed after retries',
    'YOUTUBE_RETRY_EXHAUSTED',
    false
  );

}


/**
 * Executes yt-dlp directly.
 *
 * IMPORTANT:
 *
 * This is where the download timeout is enforced.
 *
 * Default:
 * 120 seconds.
 *
 * Can be overridden with:
 *
 * YOUTUBE_DOWNLOAD_TIMEOUT_MS
 *
 * Example:
 *
 * YOUTUBE_DOWNLOAD_TIMEOUT_MS=180000
 */
function runExecFile(
  binary: string,
  args: string[]
): Promise<void> {

  const timeoutMs = Number(
    process.env.YOUTUBE_DOWNLOAD_TIMEOUT_MS ||
    120_000
  );


  return new Promise(
    (resolve, reject) => {

      log.info(
        'Downloader',
        'Starting yt-dlp child process',
        {
          'Timeout': `${timeoutMs}ms`,
        }
      );


      execFile(
        binary,
        args,
        {

          // Never use a shell.
          shell: false,

          // Prevent a stuck yt-dlp process from hanging forever.
          timeout: timeoutMs,

          // yt-dlp may produce substantial output.
          maxBuffer:
            100 *
            1024 *
            1024,

        },

        (
          error,
          stdout,
          stderr
        ) => {


          // ── Log process output ──────────────────────────────────────────────

          if (stdout?.trim()) {

            console.log(
              `  [yt-dlp stdout]\n${stdout.trim()}`
            );

          }


          if (stderr?.trim()) {

            console.log(
              `  [yt-dlp stderr]\n${stderr.trim()}`
            );

          }


          // ── Process failed ─────────────────────────────────────────────────

          if (error) {

            const combined =
              `${stdout ?? ''}\n` +
              `${stderr ?? ''}\n` +
              `${error.message}`;


            const lower =
              combined.toLowerCase();


            // ── Explicit timeout detection ───────────────────────────────────

            if (
              error.killed === true ||
              error.code === 'ETIMEDOUT' ||
              /timed out/i.test(lower) ||
              /timeout/i.test(lower)
            ) {

              reject(
                new YouTubeDownloadError(

                  `yt-dlp download timed out after ${timeoutMs}ms.`,

                  'YOUTUBE_DOWNLOAD_FAILED',

                  true,

                  combined

                )
              );

              return;

            }


            // ── YouTube access restriction ───────────────────────────────────

            const challengeMessage =
              classifyAccessError(lower);


            if (challengeMessage) {

              reject(
                new YouTubeDownloadError(

                  challengeMessage,

                  'YOUTUBE_ACCESS_DENIED',

                  false,

                  combined

                )
              );

              return;

            }


            // ── Other/transient error ─────────────────────────────────────────

            const isTransient =
              classifyTransientError(lower);


            reject(
              new YouTubeDownloadError(

                `yt-dlp failed (exit ${String(error.code)}):\n` +

                `stderr: ${
                  stderr?.trim() ||
                  '(empty)'
                }\n` +

                `stdout: ${
                  stdout?.trim() ||
                  '(empty)'
                }\n` +

                `message: ${error.message}`,

                'YOUTUBE_DOWNLOAD_FAILED',

                isTransient,

                combined

              )
            );


            return;

          }


          // ── Success ────────────────────────────────────────────────────────

          log.success(
            'Downloader',
            'yt-dlp exited 0'
          );


          resolve();

        }
      );

    }
  );

}


/**
 * Optional cookie support.
 */
function getCookieArgs(): string[] {

  const useCookies =
    process.env.YOUTUBE_USE_BROWSER_COOKIES === 'true' ||
    process.env.YOUTUBE_USE_BROWSER_COOKIES === '1';


  if (!useCookies) {

    return [];

  }


  const cookieFile =
    process.env.YOUTUBE_COOKIE_FILE?.trim();


  if (cookieFile) {

    log.info(
      'Downloader',
      'Using configured cookie file',
      {
        'Cookie file': cookieFile,
      }
    );


    return [
      '--cookies',
      cookieFile,
    ];

  }


  const browser =
    process.env.YOUTUBE_COOKIE_BROWSER?.trim() ||
    'chrome';


  log.info(
    'Downloader',
    'Using browser cookies',
    {
      'Browser': browser,
    }
  );


  return [
    '--cookies-from-browser',
    browser,
  ];

}


/**
 * Detect YouTube access restrictions.
 */
function classifyAccessError(
  output: string
): string | null {

  const patterns = [

    /sign in to confirm/i,

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


  return patterns.some(
    (pattern) =>
      pattern.test(output)
  )

    ? 'This video requires authentication or is not publicly accessible.'

    : null;

}


/**
 * Detect errors that may succeed on retry.
 */
function classifyTransientError(
  output: string
): boolean {

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


  return patterns.some(
    (pattern) =>
      pattern.test(output)
  );

}


/**
 * Retry delay helper.
 */
function delay(
  ms: number
): Promise<void> {

  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );

}


/**
 * Safely deletes a temporary file.
 *
 * Cleanup must never crash the processing pipeline.
 */
export function cleanupTempFile(
  filePath: string
): void {

  try {

    if (fs.existsSync(filePath)) {

      fs.unlinkSync(
        filePath
      );


      log.success(
        'Downloader',
        `Temp file deleted: ${filePath}`
      );

    } else {

      log.info(
        'Downloader',
        `No temp file found at: ${filePath}`
      );

    }

  } catch (err) {

    log.warn(
      'Downloader',
      `Failed to delete temp file "${filePath}": ${err}`
    );

  }

}