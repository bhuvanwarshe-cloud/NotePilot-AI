import { runYouTubeProcessor } from '../processors/youtube/youtubeProcessor';
import { runAudioProcessor } from '../processors/audio/audioProcessor';
import type { TranscriptAcquisitionInput } from './types';
import { log } from '../utils/logger';

export async function acquireTranscript(
  input: TranscriptAcquisitionInput
): Promise<void> {

  log.info(
    'TranscriptAcquisitionEngine',
    `Starting acquisition for source: ${input.source}`,
    {
      'Lecture ID': input.lectureId,
      'AI Job ID': input.aiJobId,
    }
  );

  switch (input.source) {

    case 'youtube':

      await runYouTubeProcessor({
        url: input.url,
        lectureId: input.lectureId,
        aiJobId: input.aiJobId,
        supabase: input.supabase,
      });

      return;

    case 'audio':

      await runAudioProcessor({
        filePath: input.filePath,
        fileName: input.fileName,
        mimeType: input.mimeType,
        lectureId: input.lectureId,
        aiJobId: input.aiJobId,
        supabase: input.supabase,
      });

      return;

    default: {
      const exhaustiveCheck: never = input;

      throw new Error(
        `Unsupported transcript acquisition source: ${String(exhaustiveCheck)}`
      );
    }
  }
}