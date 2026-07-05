import { execFile } from 'child_process';
import fs from 'fs';
import { log } from '../utils/logger';
const ffprobePath: string = require('ffprobe-static').path;

export interface MediaProbeInfo {
  container: string;
  codec: string;
  sampleRate: number;
  channels: number;
  bitrate: number;
  duration: number;
  sizeBytes: number;
}

export async function probeMedia(filePath: string): Promise<MediaProbeInfo> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Media probe requested for missing file: ${filePath}`);
  }

  const args = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath];
  const raw = await runFfprobe(args);
  const parsed = JSON.parse(raw);
  const streams = parsed.streams ?? [];
  const format = parsed.format ?? {};
  const audioStream = streams.find((s: any) => s.codec_type === 'audio') ?? null;

  const info: MediaProbeInfo = {
    container: (format.format_name as string) ?? 'unknown',
    codec: (audioStream?.codec_name as string) ?? 'unknown',
    sampleRate: parseInt(audioStream?.sample_rate ?? '0', 10),
    channels: audioStream?.channels ?? 0,
    bitrate: parseInt(audioStream?.bit_rate ?? format.bit_rate ?? '0', 10),
    duration: parseFloat(audioStream?.duration ?? format.duration ?? '0') || 0,
    sizeBytes: fs.statSync(filePath).size,
  };

  log.info('MediaProbe', 'ffprobe results', {
    'File': filePath,
    'Container': info.container,
    'Codec': info.codec,
    'Sample rate': `${info.sampleRate} Hz`,
    'Channels': String(info.channels),
    'Bitrate': `${Math.round(info.bitrate / 1000)} kbps`,
    'Duration': `${info.duration.toFixed(2)}s`,
    'Size': `${(info.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
  });

  return info;
}

function runFfprobe(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(ffprobePath, args, { shell: false, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`ffprobe failed (exit ${error.code}): ${stderr?.trim() || error.message}`));
      } else {
        resolve(stdout);
      }
    });
  });
}
