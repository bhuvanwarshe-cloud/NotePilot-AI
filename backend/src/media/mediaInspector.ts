import { execFile } from 'child_process';
import fs from 'fs';
import { log } from '../utils/logger';

// ffprobe-static exports the path to the bundled binary
const ffprobePath: string = require('ffprobe-static').path;

/**
 * mediaInspector.ts
 *
 * Single responsibility: inspect any media file using ffprobe.
 * Returns structured metadata about every stream in the file.
 * Does NOT modify the file.
 *
 * Used by every processor (Audio, Video, YouTube) before normalization.
 */

export interface AudioStreamInfo {
  codec:      string;   // e.g. 'mp3', 'aac', 'pcm_s16le', 'opus'
  sampleRate: number;   // Hz, e.g. 44100
  channels:   number;   // 1 = mono, 2 = stereo
  bitrate:    number;   // bits per second
  duration:   number;   // seconds (may be 0 if container doesn't store it)
}

export interface MediaInfo {
  container:    string;          // e.g. 'mp3', 'matroska', 'mov,mp4,m4a,3gp,3g2,mj2'
  duration:     number;          // seconds — from container-level metadata
  hasAudio:     boolean;
  hasVideo:     boolean;
  audio:        AudioStreamInfo | null;
  sizeBytes:    number;
}

/**
 * Runs ffprobe on any media file and returns structured metadata.
 *
 * @param filePath  Absolute path to the media file.
 * @throws          If ffprobe cannot read the file or finds no streams.
 */
export async function inspectMedia(filePath: string): Promise<MediaInfo> {
  log.info('MediaInspector', 'Running ffprobe', { 'File': filePath });

  if (!fs.existsSync(filePath)) {
    throw new Error(`MediaInspector: file not found at: ${filePath}`);
  }

  const sizeBytes = fs.statSync(filePath).size;

  const args = [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    filePath,
  ];

  const raw = await runFfprobe(args);

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`MediaInspector: ffprobe returned invalid JSON for: ${filePath}`);
  }

  const streams: any[] = parsed.streams ?? [];
  const format:  any    = parsed.format  ?? {};

  const audioStream = streams.find((s) => s.codec_type === 'audio') ?? null;
  const videoStream = streams.find((s) => s.codec_type === 'video') ?? null;

  const container = (format.format_name as string) ?? 'unknown';
  const duration  = parseFloat(format.duration ?? '0') || 0;

  const audio: AudioStreamInfo | null = audioStream
    ? {
        codec:      audioStream.codec_name   ?? 'unknown',
        sampleRate: parseInt(audioStream.sample_rate ?? '0', 10),
        channels:   audioStream.channels     ?? 0,
        bitrate:    parseInt(audioStream.bit_rate  ?? format.bit_rate ?? '0', 10),
        duration:   parseFloat(audioStream.duration ?? '0') || duration,
      }
    : null;

  const info: MediaInfo = {
    container,
    duration,
    hasAudio: !!audioStream,
    hasVideo: !!videoStream,
    audio,
    sizeBytes,
  };

  log.success('MediaInspector', 'Inspection complete', {
    'Container':   container,
    'Duration':    `${duration.toFixed(1)}s`,
    'Has audio':   String(info.hasAudio),
    'Has video':   String(info.hasVideo),
    'Audio codec': audio?.codec       ?? '(none)',
    'Sample rate': audio ? `${audio.sampleRate} Hz` : '(none)',
    'Channels':    audio ? String(audio.channels)    : '(none)',
    'Bitrate':     audio ? `${Math.round(audio.bitrate / 1000)} kbps` : '(none)',
    'Size':        `${(sizeBytes / 1024 / 1024).toFixed(2)} MB`,
  });

  return info;
}

function runFfprobe(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      ffprobePath,
      args,
      { shell: false, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(
            `ffprobe failed (exit ${error.code}):\n` +
            `stderr: ${stderr?.trim() || '(empty)'}\n` +
            `message: ${error.message}`
          ));
        } else {
          resolve(stdout);
        }
      }
    );
  });
}
