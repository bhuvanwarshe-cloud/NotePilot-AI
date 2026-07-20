/**
 * sourceUnderstanding.service.ts
 *
 * Phase 2.4.1 — Source Understanding Orchestrator
 *
 * High-level orchestration boundary:
 *
 * Source
 *   ↓
 * Source-specific understanding provider
 *   ↓
 * Validated KnowledgeExtraction
 *   ↓
 * KnowledgeRepresentation Builder
 *   ↓
 * Canonical KnowledgeRepresentation
 *
 * This service deliberately does NOT:
 *
 * - persist anything to Supabase
 * - update lectures
 * - update ai_jobs
 * - generate notes / flashcards / quizzes
 * - depend on the legacy transcript-first pipeline
 *
 * Its responsibility is only:
 *
 * SOURCE → CANONICAL KNOWLEDGE
 */

import {
  GeminiYouTubeProvider,
} from './providers/geminiYouTube.provider';

import {
  buildKnowledgeRepresentation,
} from '../knowledgeRepresentation/knowledgeRepresentation.builder';

import type {
  YouTubeSourceUnderstandingInput,
} from './types';

import type {
  KnowledgeExtraction,
} from '../knowledgeRepresentation/extraction.schema';

import type {
  knowledgeRepresentationSchema,
} from '../knowledgeRepresentation/schema';

import type {
  z,
} from 'zod';


// ─────────────────────────────────────────────────────────────────────────────
// Canonical Result Type
// ─────────────────────────────────────────────────────────────────────────────

export type KnowledgeRepresentation =
  z.infer<typeof knowledgeRepresentationSchema>;


// ─────────────────────────────────────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────────────────────────────────────

export interface UnderstandYouTubeSourceInput
  extends YouTubeSourceUnderstandingInput {

  /**
   * Optional request/job identifier.
   *
   * Later, production integration can pass aiJobId here.
   */
  requestId?: string;

}


// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

export interface YouTubeKnowledgeUnderstandingResult {

  /**
   * Provider-neutral canonical knowledge representation.
   *
   * This is the primary output downstream systems should consume.
   */
  knowledge:
    KnowledgeRepresentation;


  /**
   * Validated intermediate extraction.
   *
   * Retained for:
   *
   * - debugging
   * - observability
   * - provider comparison
   * - future evaluation/testing
   */
  extraction:
    KnowledgeExtraction;


  metadata: {

    sourceType:
      'youtube';

    provider:
      string;

    model:
      string;

    processingTimeMs:
      number;

    providerProcessingTimeMs:
      number;

    videoId:
      string;

    canonicalUrl:
      string;

  };

}


// ─────────────────────────────────────────────────────────────────────────────
// YouTube Orchestrator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a public YouTube source directly into NotePilot's canonical
 * KnowledgeRepresentation.
 *
 * Pipeline:
 *
 * YouTube URL
 *      ↓
 * GeminiYouTubeProvider
 *      ↓
 * KnowledgeExtraction
 *      ↓
 * structural validation       [inside provider]
 *      ↓
 * semantic integrity          [inside provider]
 *      ↓
 * KnowledgeRepresentationBuilder
 *      ↓
 * semantic integrity          [defensive builder validation]
 *      ↓
 * canonical Zod validation
 *      ↓
 * KnowledgeRepresentation v1.0
 */
export async function understandYouTubeSource(
  input: UnderstandYouTubeSourceInput
): Promise<YouTubeKnowledgeUnderstandingResult> {

const {
  videoId,
  canonicalUrl,
  requestId,
} = input;


  const totalStartedAt =
    Date.now();


  console.log(
    '\n=============================================='
  );

  console.log(
    ' NotePilot — Source Understanding'
  );

  console.log(
    '==============================================\n'
  );


  console.log(
    '[SourceUnderstandingService] Starting YouTube understanding'
  );

  console.log(
    `[SourceUnderstandingService] Video ID: ${videoId}`
  );

  console.log(
    `[SourceUnderstandingService] Canonical URL: ${canonicalUrl}`
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 1 — Source-specific provider
  //
  // GeminiYouTubeProvider already performs:
  //
  // - direct YouTube multimodal understanding
  // - JSON parsing
  // - Zod structural validation
  // - semantic integrity validation
  //
  // Therefore this orchestrator must NOT duplicate those responsibilities.
  // ───────────────────────────────────────────────────────────────────────────

  const provider =
    new GeminiYouTubeProvider();


const providerResult =
  await provider.extract({

    videoId,

    canonicalUrl,

  });


  console.log(
    '\n[SourceUnderstandingService] Provider completed successfully'
  );

  console.log(
    `[SourceUnderstandingService] Provider: ${providerResult.provider}`
  );

  console.log(
    `[SourceUnderstandingService] Model: ${providerResult.model}`
  );

  console.log(
    `[SourceUnderstandingService] Provider processing: ${providerResult.processingTimeMs}ms`
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 2 — Canonical representation
  //
  // Convert provider-neutral KnowledgeExtraction into NotePilot's canonical
  // KnowledgeRepresentation v1.0.
  //
  // The builder itself performs defensive integrity validation and final
  // canonical schema validation.
  // ───────────────────────────────────────────────────────────────────────────

  const knowledge =
    buildKnowledgeRepresentation(
      providerResult.extraction,
      {

        sourceType:
          'youtube',

        provider:
          providerResult.provider,

        sourceUri:
          canonicalUrl,

        externalId:
          videoId,

        processingTimeMs:
          providerResult.processingTimeMs,

        requestId,

        multimodal:
          true,

       extra: {

  model:
    providerResult.model,

  providerMetrics:
    providerResult.metadata,

},

      }
    );


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 3 — Final metrics
  // ───────────────────────────────────────────────────────────────────────────

  const totalProcessingTimeMs =
    Date.now() -
    totalStartedAt;


  console.log(
    '\n[SourceUnderstandingService] Canonical KnowledgeRepresentation created ✓'
  );

  console.log(
    `[SourceUnderstandingService] Schema: ${knowledge.schemaVersion}`
  );

  console.log(
    `[SourceUnderstandingService] Title: ${knowledge.title}`
  );

  console.log(
    `[SourceUnderstandingService] Topics: ${knowledge.topics.length}`
  );

  console.log(
    `[SourceUnderstandingService] Concepts: ${knowledge.concepts.length}`
  );

  console.log(
    `[SourceUnderstandingService] Visual insights: ${knowledge.visualInsights?.length ?? 0}`
  );

  console.log(
    `[SourceUnderstandingService] Total processing: ${totalProcessingTimeMs}ms`
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 4 — Provider-neutral result
  // ───────────────────────────────────────────────────────────────────────────

  return {

    knowledge,

    extraction:
      providerResult.extraction,

    metadata: {

      sourceType:
        'youtube',

      provider:
        providerResult.provider,

      model:
        providerResult.model,

      processingTimeMs:
        totalProcessingTimeMs,

      providerProcessingTimeMs:
        providerResult.processingTimeMs,

      videoId,

      canonicalUrl,

    },

  };

}