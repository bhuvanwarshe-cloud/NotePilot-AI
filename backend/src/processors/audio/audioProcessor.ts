import fs from 'fs';
import path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';
import { validateAudioFile } from './audioValidator';
import { inspectMedia } from '../../media/mediaInspector';
import { detectSilence, deleteTempFile } from '../../media/mediaNormalizer';
import { transcribe } from '../../services/transcription/transcription.service';
import { prepareMediaForTranscription } from '../../services/mediaPreparation.service';
import { saveTranscript } from '../../services/transcript/transcript.service';
import { updateLectureStatus } from '../../services/lecture.service';
import { updateAIJobStatus } from '../../services/aiJob.service';
import { log } from '../../utils/logger';

/**
 * audioProcessor.ts
 *
 * Production-grade Audio → Transcript orchestrator.
 *
 * Pipeline (6 stages):
 *   1. validate         — fast checks (size, MIME, extension)
 *   2. inspect          — ffprobe: codec, sample rate, channels, duration
 *   3. normalize        — ffmpeg: any format → WAV 16kHz mono PCM
 *   4. silence_check    — reject silent/empty recordings before Groq
 *   5. transcribe       — Groq Whisper on the normalized WAV
 *   6. save_transcript  — TranscriptService (DB + lecture + ai_job)
 *
 * Every processor in NotePilot produces a normalized WAV before
 * hitting Whisper. This is the universal ingestion path.
 *
 * No SQL. No business logic. Pure orchestration.
 */

const TEMP_DIR = path.resolve(__dirname, '../../../temp');

export interface AudioProcessorInput {
  /** Absolute path to the uploaded file on disk (written from multer buffer) */
  filePath:  string;
  /** Original filename from the upload */
  fileName:  string;
  /** MIME type reported by multer */
  mimeType:  string;
  lectureId: string;
  aiJobId:   string;
  supabase:  SupabaseClient;
}

export async function runAudioProcessor(input: AudioProcessorInput): Promise<void> {
  const { filePath, fileName, mimeType, lectureId, aiJobId, supabase } = input;
  let currentStage    = 'init';
  let normalizedPath: string | null = null;

  log.banner('Audio Processor Started', {
    'Lecture ID': lectureId,
    'AI Job ID':  aiJobId,
    'File':       fileName,
    'MIME':       mimeType,
    'Path':       filePath,
  });

  try {

    // ── Stage 1/6: Validate (fast, no binaries) ───────────────────────────────
    currentStage = 'validating';
    log.stage(1, 6, 'Validating File');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'validating', 5);

    const validated = validateAudioFile(filePath, mimeType, fileName);
    log.success('AudioProcessor', 'Validation passed', {
      'Extension': validated.extension,
      'MIME':      validated.mimeType,
      'Size':      `${(validated.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
    });

    // ── Stage 2/6: Inspect (ffprobe) ──────────────────────────────────────────
    currentStage = 'inspecting';
    log.stage(2, 6, 'Inspecting Media (ffprobe)');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'inspecting', 15);

    const mediaInfo = await inspectMedia(filePath);

    if (!mediaInfo.hasAudio) {
      throw new Error(
        `File "${fileName}" contains no audio stream.\n` +
        `Stage: inspecting\n` +
        `Container: ${mediaInfo.container}\n` +
        `Action: Upload a file that contains audio content.`
      );
    }

    log.success('AudioProcessor', 'Media inspection complete', {
      'Container':   mediaInfo.container,
      'Duration':    `${mediaInfo.duration.toFixed(1)}s`,
      'Codec':       mediaInfo.audio?.codec       ?? 'unknown',
      'Sample rate': `${mediaInfo.audio?.sampleRate ?? 0} Hz`,
      'Channels':    String(mediaInfo.audio?.channels ?? 0),
      'Bitrate':     `${Math.round((mediaInfo.audio?.bitrate ?? 0) / 1000)} kbps`,
    });

    // ── Stage 3/6: Normalize (ffmpeg → WAV 16kHz mono PCM) ───────────────────
    currentStage = 'normalizing';
    log.stage(3, 6, 'Normalizing Audio (ffmpeg)');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'normalizing', 30);

    const preparedMedia = await prepareMediaForTranscription(filePath, TEMP_DIR, lectureId);
    normalizedPath = preparedMedia.normalizedPath;

    log.success('AudioProcessor', 'Media preparation complete', {
      'Normalized path': normalizedPath,
      'Chunk count': String(preparedMedia.chunkPaths.length),
      'Chunk duration': `${preparedMedia.chunkLengthSeconds}s`,
    });

    // ── Stage 4/6: Silence Detection ──────────────────────────────────────────
    currentStage = 'checking_silence';
    log.stage(4, 6, 'Silence Detection');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'checking_silence', 45);

    const silence = await detectSilence(normalizedPath);

    if (silence.isSilent) {
      throw new Error(
        `Recording "${fileName}" appears to be silent ` +
        `(max volume: ${silence.maxVolumeDb} dB).\n` +
        `Stage: silence_detection\n` +
        `Reason: The file contains no audible speech. ` +
        `The microphone may have been muted, or the recording failed to capture audio.\n` +
        `Action: Check your recording setup and upload again.`
      );
    }

    log.success('AudioProcessor', 'Audio contains speech', {
      'Max volume':  `${silence.maxVolumeDb} dB`,
      'Mean volume': `${silence.meanVolumeDb} dB`,
    });

    // ── Stage 5/6: Transcribe (Groq Whisper on normalized WAV) ───────────────
    currentStage = 'transcribing';
    log.stage(5, 6, 'Transcribing');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'transcribing', 60);

    const transcriptResult = await transcribe(normalizedPath);

    // Annotate with audio-source fields
    transcriptResult.source = 'audio';
    transcriptResult.metadata = {
      // Original file info
      originalFileName:  fileName,
      originalExtension: validated.extension,
      originalMimeType:  validated.mimeType,
      originalSizeBytes: validated.sizeBytes,
      // Detected stream info
      container:         mediaInfo.container,
      audioCodec:        mediaInfo.audio?.codec,
      sampleRate:        mediaInfo.audio?.sampleRate,
      channels:          mediaInfo.audio?.channels,
      bitrate:           mediaInfo.audio?.bitrate,
      sourceDuration:    mediaInfo.duration,
      // Normalization
      normalizedFormat:  'WAV / pcm_s16le / 16kHz / mono',
      normalizationMs:   0,
      // Transcription
      durationSeconds:   transcriptResult.durationSeconds,
      wordCount:         transcriptResult.wordCount,
      charCount:         transcriptResult.charCount,
    };

    log.success('AudioProcessor', 'Transcription complete', {
      'Language':    transcriptResult.language,
      'Words':       transcriptResult.wordCount,
      'Chars':       transcriptResult.charCount,
      'Duration':    `${transcriptResult.durationSeconds}s`,
      'API time':    `${transcriptResult.processingTimeMs}ms`,
    });

    // ── Stage 6/6: Save Transcript (shared TranscriptService) ────────────────
    currentStage = 'saving_transcript';
    log.stage(6, 6, 'Saving Transcript');
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'saving_transcript', 85);

    const { transcriptId } = await saveTranscript({
      supabase,
      lectureId,
      aiJobId,
      result: transcriptResult,
    });

    log.banner('Audio Processor Complete ✓', {
      'Lecture ID':    lectureId,
      'Transcript ID': transcriptId,
      'Language':      transcriptResult.language,
      'Words':         transcriptResult.wordCount,
      'Duration':      `${transcriptResult.durationSeconds}s`,
      'Original fmt':  `${validated.extension} / ${mediaInfo.audio?.codec ?? '?'}`,
      'Normalized fmt':'WAV / pcm_s16le / 16kHz / mono',
    });

  } catch (error: any) {
    log.error(
      'AudioProcessor',
      `Pipeline FAILED at stage: ${currentStage} | Lecture: ${lectureId} | Job: ${aiJobId}`,
      error
    );

    await updateAIJobStatus(
      supabase, aiJobId, 'failed', currentStage, 0,
      error?.message?.split('\n')[0] ?? 'Unknown error'
    ).catch((e) => log.error('AudioProcessor', 'Could not update ai_job to failed', e));

    await updateLectureStatus(supabase, lectureId, 'failed')
      .catch((e) => log.error('AudioProcessor', 'Could not update lecture to failed', e));

  } finally {
    // ── Cleanup ───────────────────────────────────────────────────────────────
    // Delete the normalized WAV (temp file we created for Whisper)
    if (normalizedPath) {
      log.info('AudioProcessor', 'Cleanup: deleting normalized WAV');
      deleteTempFile(normalizedPath);
    }
    // Delete the original upload buffer (written from multer by the controller)
    log.info('AudioProcessor', 'Cleanup: deleting original upload buffer');
    if (fs.existsSync(filePath)) {
      deleteTempFile(filePath);
    } else {
      log.info('AudioProcessor', 'Original upload buffer already deleted');
    }
  }
}
