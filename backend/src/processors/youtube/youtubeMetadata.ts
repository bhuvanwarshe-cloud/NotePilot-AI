import youtubeDl from 'youtube-dl-exec';

/**
 * YouTubeVideoMetadata
 *
 * Parsed output of yt-dlp --dump-json (via youtube-dl-exec).
 * rawJson is cached so the downloader can optionally reference it
 * without triggering a second network call.
 */
export interface YouTubeVideoMetadata {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  uploader: string;
  uploadDate: string; // YYYYMMDD string from yt-dlp
  rawJson: Record<string, unknown>;
}

/**
 * Fetches metadata for a YouTube video using a single yt-dlp --dump-json call.
 * Does NOT download any audio or video.
 *
 * Uses youtube-dl-exec which bundles and auto-downloads the yt-dlp binary
 * during npm install — no system-level installation required.
 */
export async function fetchYouTubeMetadata(url: string): Promise<YouTubeVideoMetadata> {
  console.log(`[youtubeMetadata] Fetching metadata for: ${url}`);

  const raw = await youtubeDl(url, {
    dumpSingleJson: true,
    noPlaylist: true,
    noWarnings: true,
  }) as Record<string, unknown>;

  const thumbnails = (raw.thumbnails as any[]) ?? [];
  const thumbnailUrl =
    (raw.thumbnail as string) ??
    thumbnails[thumbnails.length - 1]?.url ??
    '';

  const metadata: YouTubeVideoMetadata = {
    videoId: raw.id as string,
    title: (raw.title as string) ?? 'Untitled',
    thumbnailUrl,
    durationSeconds: (raw.duration as number) ?? 0,
    uploader: (raw.uploader as string) ?? (raw.channel as string) ?? 'Unknown',
    uploadDate: (raw.upload_date as string) ?? '',
    rawJson: raw,
  };

  console.log(`[youtubeMetadata] Metadata fetched:
  - Title    : ${metadata.title}
  - Uploader : ${metadata.uploader}
  - Duration : ${metadata.durationSeconds}s
  - videoId  : ${metadata.videoId}`);

  return metadata;
}
