import Groq from 'groq-sdk';
import fs from 'fs';
import type { TranscriptionProvider, TranscriptResult } from '../types';
import { log } from '../../../utils/logger';

/**
 * GroqProvider
 *
 * Implements TranscriptionProvider using Groq's hosted Whisper API.
 * Uses whisper-large-v3-turbo — the fastest multilingual model.
 *
 * Sets result.provider automatically.
 * Callers are responsible for setting result.source after the call.
 */
export class GroqProvider implements TranscriptionProvider {
  private client: Groq;
  private readonly MODEL = 'whisper-large-v3-turbo';
  readonly providerName = `groq-${this.MODEL}`;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set. Add it to backend/.env');
    }
    log.info('GroqProvider', 'Initialised', {
      'API Key': `${apiKey.slice(0, 6)}…${apiKey.slice(-4)} (masked)`,
      'Model':   this.MODEL,
    });
    this.client = new Groq({ apiKey });
  }

  async transcribe(filePath: string): Promise<TranscriptResult> {
    // ── Pre-flight ────────────────────────────────────────────────────────────
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found at: ${filePath}`);
    }
    const fileStats = fs.statSync(filePath);

    log.info('GroqProvider', 'Starting transcription request', {
      'Audio file': filePath,
      'File size':  `${(fileStats.size / 1024 / 1024).toFixed(2)} MB`,
      'Model':      this.MODEL,
      'Format':     'verbose_json',
      'Language':   'auto-detect (no lang param)',
    });

    const startTime = Date.now();

    // ── API Call ──────────────────────────────────────────────────────────────
    let response: any;
    try {
      response = await this.client.audio.transcriptions.create({
        file:            fs.createReadStream(filePath),
        model:           this.MODEL,
        response_format: 'verbose_json',
        // No 'language' → Whisper auto-detects original language (no translation)
      });
    } catch (apiError: any) {
      log.error('GroqProvider', 'Groq API call failed', apiError);
      throw apiError;
    }

    const processingTimeMs = Date.now() - startTime;

    // ── Parse Response ────────────────────────────────────────────────────────
    const text     = response.text?.trim() ?? '';
    const language = response.language ?? 'unknown';
    const segments = response.segments ?? [];

    const durationSeconds =
      segments.length > 0
        ? Math.ceil(segments[segments.length - 1]?.end ?? 0)
        : 0;

    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const charCount = text.length;

    log.success('GroqProvider', 'Transcription received', {
      'Detected language': language,
      'Word count':        wordCount,
      'Char count':        charCount,
      'Duration':          `${durationSeconds}s`,
      'Segment count':     segments.length,
      'API time':          `${processingTimeMs}ms`,
      'Text preview':      text.length > 120 ? text.slice(0, 120) + '…' : text,
    });

    return {
      text,
      language,
      durationSeconds,
      wordCount,
      charCount,
      processingTimeMs,
      // provider is set here; source must be set by the calling processor
      source:   'audio', // default — callers override this
      provider: this.providerName,
    };
  }
}
