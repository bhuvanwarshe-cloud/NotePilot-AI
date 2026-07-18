import { execFile, type ExecException } from 'child_process';
import fs from 'fs';
import { log } from '../../utils/logger';
import { YouTubeDownloadError } from './youtubeDownloader';

const { YOUTUBE_DL_PATH } = require('youtube-dl-exec/src/constants') as {
  YOUTUBE_DL_PATH: string;
};

export interface YouTubeVideoMetadata {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  uploader: string;
  uploadDate: string;
  rawJson: Record<string, unknown>;
}

/**
 * Fetch YouTube metadata using the bundled yt-dlp binary directly.
 *
 * We intentionally use execFile instead of the youtube-dl-exec wrapper so:
 *
 * - no shell is involved
 * - timeout behavior is explicit
 * - stdout/stderr can be inspected
 * - YouTube access errors are normalized into YouTubeDownloadError
 * - behavior matches the audio downloader more closely
 */
export async function fetchYouTubeMetadata(
  url: string
): Promise<YouTubeVideoMetadata> {

  log.info('YouTubeMetadata', 'Fetching metadata via yt-dlp', {
    'URL': url,
    'Binary': YOUTUBE_DL_PATH,
  });

  if (!fs.existsSync(YOUTUBE_DL_PATH)) {
    throw new YouTubeDownloadError(
      `yt-dlp binary not found at: ${YOUTUBE_DL_PATH}`,
      'YOUTUBE_DOWNLOAD_FAILED',
      false
    );
  }

  const timeoutMs = Number(
    process.env.YOUTUBE_METADATA_TIMEOUT_MS || 30_000
  );

  const args = [
    '--dump-single-json',
    '--no-playlist',
    '--no-warnings',
    ...getCookieArgs(),
    url,
  ];

  const stdout = await runMetadataCommand(
    YOUTUBE_DL_PATH,
    args,
    timeoutMs
  );

  let raw: Record<string, unknown>;

  try {
    raw = JSON.parse(stdout) as Record<string, unknown>;
  } catch (error) {
    throw new YouTubeDownloadError(
      `yt-dlp returned invalid metadata JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
      'YOUTUBE_DOWNLOAD_FAILED',
      false,
      stdout.slice(0, 5000)
    );
  }

  const thumbnails =
    (raw.thumbnails as Array<{ url?: string }> | undefined) ?? [];

  const thumbnailUrl =
    (raw.thumbnail as string | undefined) ??
    thumbnails[thumbnails.length - 1]?.url ??
    '';

  const metadata: YouTubeVideoMetadata = {
    videoId: (raw.id as string | undefined) ?? '',
    title: (raw.title as string | undefined) ?? 'Untitled',
    thumbnailUrl,
    durationSeconds: (raw.duration as number | undefined) ?? 0,
    uploader:
      (raw.uploader as string | undefined) ??
      (raw.channel as string | undefined) ??
      'Unknown',
    uploadDate: (raw.upload_date as string | undefined) ?? '',
    rawJson: raw,
  };

  log.success('YouTubeMetadata', 'Metadata fetched via yt-dlp', {
    'Video ID': metadata.videoId,
    'Title': metadata.title,
    'Uploader': metadata.uploader,
    'Duration': `${metadata.durationSeconds}s`,
  });

  return metadata;
}

function runMetadataCommand(
  binary: string,
  args: string[],
  timeoutMs: number
): Promise<string> {

  return new Promise((resolve, reject) => {

    execFile(
      binary,
      args,
      {
        shell: false,
        timeout: timeoutMs,
        maxBuffer: 50 * 1024 * 1024,
      },
      (error, stdout, stderr) => {

        if (error) {

          const combined =
            `${stdout ?? ''}\n${stderr ?? ''}\n${error.message}`;

          const lower = combined.toLowerCase();

          if (isAccessDenied(lower)) {

            reject(
              new YouTubeDownloadError(
                'YouTube denied yt-dlp access while fetching video metadata.',
                'YOUTUBE_ACCESS_DENIED',
                false,
                combined
              )
            );

            return;
          }

          if (isTimeout(error, lower)) {

            reject(
              new YouTubeDownloadError(
                `yt-dlp metadata request timed out after ${timeoutMs}ms.`,
                'YOUTUBE_DOWNLOAD_FAILED',
                true,
                combined
              )
            );

            return;
          }

          reject(
            new YouTubeDownloadError(
              `yt-dlp metadata fetch failed: ${error.message}`,
              'YOUTUBE_DOWNLOAD_FAILED',
              false,
              combined
            )
          );

          return;
        }

        if (!stdout?.trim()) {

          reject(
            new YouTubeDownloadError(
              'yt-dlp metadata command returned empty output.',
              'YOUTUBE_DOWNLOAD_FAILED',
              false,
              stderr
            )
          );

          return;
        }

        resolve(stdout);
      }
    );
  });
}

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
      'YouTubeMetadata',
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
    process.env.YOUTUBE_COOKIE_BROWSER?.trim() || 'chrome';

  log.info(
    'YouTubeMetadata',
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

function isAccessDenied(output: string): boolean {

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
    (pattern) => pattern.test(output)
  );
}

function isTimeout(
  error: ExecException,
  output: string
): boolean {

  return (
    error.killed === true ||
    error.code === 'ETIMEDOUT' ||
    error.signal === 'SIGTERM' ||
    /timed out/i.test(output) ||
    /timeout/i.test(output)
  );
}