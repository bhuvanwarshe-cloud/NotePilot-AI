/**
 * Transcription Provider Interface + Shared Types
 *
 * These types are the contract between ALL processors and the transcript service.
 * Every future processor (Video, PDF, OCR, Text) must produce a TranscriptResult
 * and pass it to TranscriptService — zero interface changes required.
 */

export type ProcessorSource =
  | 'youtube'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'textbook'
  | 'handwritten'
  | 'text';

export interface TranscriptResult {
  /** The raw transcript text in the original spoken language */
  text: string;
  /** ISO 639-1 language code detected by the model (e.g. 'en', 'hi', 'mr') */
  language: string;
  /** Approximate audio duration in seconds (from Whisper segments or file metadata) */
  durationSeconds: number;
  /** Number of whitespace-delimited words */
  wordCount: number;
  /** Total character count of the transcript */
  charCount: number;
  /** Wall-clock time taken for the transcription API call, in milliseconds */
  processingTimeMs: number;
  /** Which processor produced this result */
  source: ProcessorSource;
  /** Which transcription provider was used (e.g. 'groq-whisper-large-v3-turbo') */
  provider: string;
  /** Processor-specific metadata (duration, bitrate, sampleRate, channels, etc.) */
  metadata?: Record<string, unknown>;
}

export interface TranscriptionProvider {
  /**
   * Transcribe the audio file at the given path.
   * Must preserve the original spoken language — do NOT translate.
   */
  transcribe(filePath: string): Promise<TranscriptResult>;
}
