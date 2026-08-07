/**
 * Gemini YouTube Source Understanding Provider
 *
 * Phase 2.2:
 *
 * Sends a public YouTube URL directly to Gemini for multimodal source
 * understanding and converts the response into NotePilot's validated
 * KnowledgeExtraction contract.
 *
 * Pipeline:
 *
 * YouTube URL
 *      ↓
 * Gemini multimodal understanding
 *      ↓
 * JSON response
 *      ↓
 * JSON parsing
 *      ↓
 * Zod structural validation
 *      ↓
 * Semantic integrity validation
 *      ↓
 * SourceUnderstandingResult
 */
import {
  withGeminiRetry,
} from './geminiResilience';

import {
  GoogleGenAI,
} from '@google/genai';

import {
  buildYouTubeKnowledgeExtractionPrompt,
} from '../prompts/youtubeKnowledgeExtraction.prompt';

import {
  safeValidateKnowledgeExtraction,
} from '../../knowledgeRepresentation/extraction.schema';

import {
  validateKnowledgeIntegrity,
} from '../../knowledgeRepresentation/integrity';

import type {
  KnowledgeExtraction,
} from '../../knowledgeRepresentation/extraction.schema';

import type {
  SourceUnderstandingResult,
  YouTubeSourceUnderstandingInput,
} from '../types';


const DEFAULT_MODEL =
  process.env.GEMINI_YOUTUBE_MODEL ||
  'gemini-3.5-flash';


export class GeminiYouTubeProvider {

  readonly name =
    'GeminiYouTubeProvider';


  private readonly client: GoogleGenAI;

  private readonly model: string;


  constructor(
    apiKey: string = process.env.GEMINI_API_KEY || '',
    model: string = DEFAULT_MODEL
  ) {

    if (!apiKey) {

      throw new Error(
        'GEMINI_API_KEY is not configured.'
      );

    }


    this.client =
      new GoogleGenAI({
        apiKey,
      });


    this.model =
      model;

  }


  /**
   * Extract structured educational knowledge directly from a public
   * YouTube video.
   */
  async extract(
    input: YouTubeSourceUnderstandingInput
  ): Promise<SourceUnderstandingResult> {

    const {
      videoId,
      canonicalUrl,
    } = input;


    const totalStartedAt =
      Date.now();


    console.log(
      '\n[GeminiYouTubeProvider] Starting structured YouTube extraction'
    );

    console.log(
      `[GeminiYouTubeProvider] Video ID: ${videoId}`
    );

    console.log(
      `[GeminiYouTubeProvider] URL: ${canonicalUrl}`
    );

    console.log(
      `[GeminiYouTubeProvider] Model: ${this.model}`
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 1 — Gemini multimodal understanding
    // ─────────────────────────────────────────────────────────────────────────

      // ─────────────────────────────────────────────────────────────────────────
    // Stage 1 — Gemini multimodal understanding
    //
    // The Gemini API call is wrapped with the resilience layer.
    //
    // Retryable failures:
    // - 429 rate limit
    // - 500 / 502 / 503 / 504 server failures
    // - temporary network failures
    // - connection timeouts
    //
    // Permanent failures:
    // - authentication / permission errors
    // - invalid requests
    // - unavailable / deprecated model
    //
    // IMPORTANT:
    // Only the remote Gemini API request is retried.
    // JSON parsing, Zod validation, and semantic integrity validation
    // are NOT automatically retried.
    // ─────────────────────────────────────────────────────────────────────────

    const geminiStartedAt =
      Date.now();


    const response =
      await withGeminiRetry(
        () =>
          this.client.models.generateContent({

            model:
              this.model,

            contents: [

              {
                role:
                  'user',

                parts: [

                  {
                    fileData: {

                      fileUri:
                        canonicalUrl,

                    },
                  },

                {
  text:
    buildYouTubeKnowledgeExtractionPrompt(),
},

                ],

              },

            ],

            config: {

              responseMimeType:
                'application/json',

              temperature:
                0.1,

            },

          })
      );


    const geminiProcessingTimeMs =
      Date.now() - geminiStartedAt;


    console.log(
      `[GeminiYouTubeProvider] Gemini completed in ${geminiProcessingTimeMs}ms`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Stage 2 — Read response text
    // ─────────────────────────────────────────────────────────────────────────

    const rawText =
      response.text?.trim();


    if (!rawText) {

      throw new Error(
        'Gemini returned an empty response for the YouTube source.'
      );

    }


    console.log(
      `[GeminiYouTubeProvider] Response size: ${rawText.length} characters`
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 3 — Parse JSON
    // ─────────────────────────────────────────────────────────────────────────

    const parsingStartedAt =
      Date.now();


    let parsed: unknown;


    try {

      parsed =
        JSON.parse(
          stripMarkdownCodeFence(
            rawText
          )
        );

    } catch (error) {

      const preview =
        rawText.slice(
          0,
          1000
        );


      throw new Error(
        `Gemini returned invalid JSON.\n\n` +
        `Response preview:\n${preview}\n\n` +
        `Parse error: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );

    }


    const jsonParsingTimeMs =
      Date.now() - parsingStartedAt;


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 4 — Zod structural validation
    // ─────────────────────────────────────────────────────────────────────────

    const zodStartedAt =
      Date.now();


    const structuralResult =
      safeValidateKnowledgeExtraction(
        parsed
      );


    const structuralValidationTimeMs =
      Date.now() - zodStartedAt;


    if (
      !structuralResult.success
    ) {

      const issues =
        structuralResult.error.issues
          .map(
            (issue, index) => {

              const path =
                issue.path.length > 0
                  ? issue.path.join('.')
                  : '(root)';


              return (
                `${index + 1}. ${path}: ${issue.message}`
              );

            }
          )
          .join('\n');


      throw new Error(
        `Gemini output failed KnowledgeExtraction structural validation:\n` +
        `${issues}`
      );

    }


    const extraction: KnowledgeExtraction =
      structuralResult.data;


    console.log(
      '[GeminiYouTubeProvider] Structural validation passed ✓'
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 5 — Semantic integrity validation
    // ─────────────────────────────────────────────────────────────────────────

    const integrityStartedAt =
      Date.now();


    const integrityResult =
      validateKnowledgeIntegrity(
        extraction
      );


    const integrityValidationTimeMs =
      Date.now() - integrityStartedAt;


    if (
      !integrityResult.valid
    ) {

      const issues =
        integrityResult.issues
          .map(
            (issue, index) =>
              `${index + 1}. ${issue.path}: ${issue.message}`
          )
          .join('\n');


      throw new Error(
        `Gemini output failed KnowledgeExtraction semantic integrity validation:\n` +
        `${issues}`
      );

    }


    console.log(
      '[GeminiYouTubeProvider] Semantic integrity validation passed ✓'
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 6 — Metrics
    // ─────────────────────────────────────────────────────────────────────────

    const totalProcessingTimeMs =
      Date.now() - totalStartedAt;


    console.log(
      '\n[GeminiYouTubeProvider] Extraction summary'
    );

    console.log(
      `  Title           : ${extraction.title}`
    );

    console.log(
      `  Language        : ${extraction.language}`
    );

    console.log(
      `  Topics          : ${extraction.topics.length}`
    );

    console.log(
      `  Concepts        : ${extraction.concepts.length}`
    );

    console.log(
      `  Definitions     : ${extraction.definitions.length}`
    );

    console.log(
      `  Formulas        : ${extraction.formulas.length}`
    );

    console.log(
      `  Examples        : ${extraction.examples.length}`
    );

    console.log(
      `  Visual insights : ${extraction.visualInsights.length}`
    );

    console.log(
      `  Timeline entries: ${extraction.timeline.length}`
    );

    console.log(
      ''
    );

    console.log(
      `  Gemini          : ${geminiProcessingTimeMs}ms`
    );

    console.log(
      `  JSON parsing    : ${jsonParsingTimeMs}ms`
    );

    console.log(
      `  Zod validation  : ${structuralValidationTimeMs}ms`
    );

    console.log(
      `  Integrity       : ${integrityValidationTimeMs}ms`
    );

    console.log(
      `  Total           : ${totalProcessingTimeMs}ms`
    );


    return {

      extraction,

      provider:
        this.name,

      model:
        this.model,

      processingTimeMs:
        totalProcessingTimeMs,

      metadata: {

        videoId,

        canonicalUrl,

        geminiProcessingTimeMs,

        jsonParsingTimeMs,

        structuralValidationTimeMs,

        integrityValidationTimeMs,

      },

    };

  }

}


// ─────────────────────────────────────────────────────────────────────────────
// Prompt Builder
// ─────────────────────────────────────────────────────────────────────────────




// ─────────────────────────────────────────────────────────────────────────────
// JSON Cleanup
// ─────────────────────────────────────────────────────────────────────────────

function stripMarkdownCodeFence(
  value: string
): string {

  const trimmed =
    value.trim();


  if (
    !trimmed.startsWith('```')
  ) {

    return trimmed;

  }


  return trimmed
    .replace(
      /^```(?:json)?\s*/i,
      ''
    )
    .replace(
      /\s*```$/,
      ''
    )
    .trim();

}