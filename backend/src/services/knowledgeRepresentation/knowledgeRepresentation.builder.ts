/**
 * knowledgeRepresentation.builder.ts
 *
 * Converts a validated KnowledgeExtraction into NotePilot's canonical
 * KnowledgeRepresentation.
 *
 * Architectural boundary:
 *
 * Provider / AI
 *      ↓
 * KnowledgeExtraction
 *      ↓
 * integrity validation
 *      ↓
 * deterministic mapping
 *      ↓
 * canonical schema validation
 *      ↓
 * KnowledgeRepresentation
 *
 * This builder is:
 *
 * - provider-independent
 * - AI-independent
 * - database-independent
 * - side-effect free except for the default processedAt timestamp
 */

import type {
  KnowledgeExtraction,
} from './extraction.schema';

import {
  validateKnowledgeIntegrity,
} from './integrity';

import {
  validateKnowledgeRepresentation,
} from './schema';

import {
  KNOWLEDGE_SCHEMA_VERSION,
} from './types';


// ─────────────────────────────────────────────────────────────────────────────
// Builder Options
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildKnowledgeRepresentationOptions {

  /**
   * Original source type.
   */
  sourceType:
    | 'youtube'
    | 'audio'
    | 'video'
    | 'pdf'
    | 'textbook'
    | 'handwritten'
    | 'text';


  /**
   * Provider responsible for understanding/extracting the source.
   *
   * Examples:
   *
   * GeminiYouTubeProvider
   * GroqWhisperProvider
   * PDFTextProvider
   */
  provider: string;


  /**
   * Original URI when applicable.
   *
   * For YouTube:
   * https://www.youtube.com/watch?v=<videoId>
   */
  sourceUri?: string;


  /**
   * Provider-independent external identifier.
   *
   * For YouTube this can be the video ID.
   */
  externalId?: string;


  /**
   * Total processing time spent producing the extraction.
   */
  processingTimeMs: number;


  /**
   * Optional request/job identifier for observability.
   */
  requestId?: string;


  /**
   * Whether the source was understood multimodally.
   *
   * Example:
   * Gemini directly analyzing a YouTube video → true
   */
  multimodal?: boolean;


  /**
   * Explicit timestamp injection.
   *
   * Useful for deterministic tests.
   */
  processedAt?: string;


  /**
   * Non-fatal warnings produced during extraction/building.
   */
  warnings?: string[];


  /**
   * Additional source metadata.
   *
   * Example:
   * {
   *   model: 'gemini-3.5-flash'
   * }
   */
  extra?: Record<string, unknown>;

}


// ─────────────────────────────────────────────────────────────────────────────
// Builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildKnowledgeRepresentation(
  extraction: KnowledgeExtraction,
  options: BuildKnowledgeRepresentationOptions
) {

  // ───────────────────────────────────────────────────────────────────────────
  // Stage 1 — Defensive semantic integrity validation
  // ───────────────────────────────────────────────────────────────────────────

  const integrityResult =
    validateKnowledgeIntegrity(
      extraction
    );


  if (!integrityResult.valid) {

    const issues =
      integrityResult.issues
        .map(
          (issue, index) =>
            `${index + 1}. ${issue.path}: ${issue.message}`
        )
        .join('\n');


    throw new Error(
      `Cannot build KnowledgeRepresentation from an invalid extraction:\n` +
      issues
    );

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 2 — Determine source characteristics
  // ───────────────────────────────────────────────────────────────────────────

  const visualContentDetected =
    (extraction.visualInsights?.length ?? 0) > 0;


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 3 — Build canonical candidate
  // ───────────────────────────────────────────────────────────────────────────

  const candidate = {

    schemaVersion:
      KNOWLEDGE_SCHEMA_VERSION,


    source: {

      sourceType:
        options.sourceType,

      provider:
        options.provider,

      ...(options.sourceUri
        ? {
            sourceUri:
              options.sourceUri,
          }
        : {}),

      ...(options.externalId
        ? {
            externalId:
              options.externalId,
          }
        : {}),

      ...(extraction.durationSeconds !== undefined
        ? {
            durationSeconds:
              extraction.durationSeconds,
          }
        : {}),

      ...(extraction.author
        ? {
            author:
              extraction.author,
          }
        : {}),

      ...(options.extra
        ? {
            extra:
              options.extra,
          }
        : {}),

    },


    title:
      extraction.title,


    language:
      extraction.language,


    overview:
      extraction.overview,


    // ─────────────────────────────────────────────────────────────────────────
    // Topics
    // ─────────────────────────────────────────────────────────────────────────

    topics:
      extraction.topics.map(
        (topic) => ({

          id:
            topic.id,

          title:
            topic.title,

          explanation:
            topic.explanation,

          keyPoints:
            topic.keyPoints.map(
              (point) => ({

                id:
                  point.id,

                text:
                  point.text,

                ...(point.sourceReference
                  ? {
                      sourceReference:
                        {
                          ...point.sourceReference,
                        },
                    }
                  : {}),

              })
            ),

          ...(topic.conceptIds
            ? {
                conceptIds:
                  [...topic.conceptIds],
              }
            : {}),

          ...(topic.definitionIds
            ? {
                definitionIds:
                  [...topic.definitionIds],
              }
            : {}),

          ...(topic.formulaIds
            ? {
                formulaIds:
                  [...topic.formulaIds],
              }
            : {}),

          ...(topic.exampleIds
            ? {
                exampleIds:
                  [...topic.exampleIds],
              }
            : {}),

          ...(topic.visualInsightIds
            ? {
                visualInsightIds:
                  [...topic.visualInsightIds],
              }
            : {}),

          ...(topic.sourceReferences
            ? {
                sourceReferences:
                  topic.sourceReferences.map(
                    (reference) => ({
                      ...reference,
                    })
                  ),
              }
            : {}),

        })
      ),


    // ─────────────────────────────────────────────────────────────────────────
    // Concepts
    // ─────────────────────────────────────────────────────────────────────────

    concepts:
      extraction.concepts.map(
        (concept) => ({

          id:
            concept.id,

          name:
            concept.name,

          explanation:
            concept.explanation,

          ...(concept.relatedConceptIds
            ? {
                relatedConceptIds:
                  [...concept.relatedConceptIds],
              }
            : {}),

          ...(concept.sourceReferences
            ? {
                sourceReferences:
                  concept.sourceReferences.map(
                    (reference) => ({
                      ...reference,
                    })
                  ),
              }
            : {}),

        })
      ),


    // ─────────────────────────────────────────────────────────────────────────
    // Definitions
    // ─────────────────────────────────────────────────────────────────────────

    definitions:
      extraction.definitions.map(
        (definition) => ({

          id:
            definition.id,

          term:
            definition.term,

          definition:
            definition.definition,

          ...(definition.sourceReferences
            ? {
                sourceReferences:
                  definition.sourceReferences.map(
                    (reference) => ({
                      ...reference,
                    })
                  ),
              }
            : {}),

        })
      ),


    // ─────────────────────────────────────────────────────────────────────────
    // Formulas
    // ─────────────────────────────────────────────────────────────────────────

    formulas:
      extraction.formulas.map(
        (formula) => ({

          id:
            formula.id,

          expression:
            formula.expression,

          ...(formula.name
            ? {
                name:
                  formula.name,
              }
            : {}),

          ...(formula.explanation
            ? {
                explanation:
                  formula.explanation,
              }
            : {}),

          ...(formula.variables
            ? {
                variables:
                  formula.variables.map(
                    (variable) => ({

                      symbol:
                        variable.symbol,

                      meaning:
                        variable.meaning,

                      ...(variable.unit
                        ? {
                            unit:
                              variable.unit,
                          }
                        : {}),

                    })
                  ),
              }
            : {}),

          ...(formula.sourceReferences
            ? {
                sourceReferences:
                  formula.sourceReferences.map(
                    (reference) => ({
                      ...reference,
                    })
                  ),
              }
            : {}),

        })
      ),


    // ─────────────────────────────────────────────────────────────────────────
    // Examples
    // ─────────────────────────────────────────────────────────────────────────

    examples:
      extraction.examples.map(
        (example) => ({

          id:
            example.id,

          ...(example.title
            ? {
                title:
                  example.title,
              }
            : {}),

          description:
            example.description,

          ...(example.relatedConceptIds
            ? {
                relatedConceptIds:
                  [...example.relatedConceptIds],
              }
            : {}),

          ...(example.sourceReferences
            ? {
                sourceReferences:
                  example.sourceReferences.map(
                    (reference) => ({
                      ...reference,
                    })
                  ),
              }
            : {}),

        })
      ),


    // ─────────────────────────────────────────────────────────────────────────
    // Visual Insights
    // ─────────────────────────────────────────────────────────────────────────

    visualInsights:
      (extraction.visualInsights ?? []).map(
        (visual) => ({

          id:
            visual.id,

          type:
            visual.type,

          description:
            visual.description,

          ...(visual.educationalSignificance
            ? {
                educationalSignificance:
                  visual.educationalSignificance,
              }
            : {}),

          ...(visual.relatedConceptIds
            ? {
                relatedConceptIds:
                  [...visual.relatedConceptIds],
              }
            : {}),

          ...(visual.sourceReferences
            ? {
                sourceReferences:
                  visual.sourceReferences.map(
                    (reference) => ({
                      ...reference,
                    })
                  ),
              }
            : {}),

        })
      ),


    // ─────────────────────────────────────────────────────────────────────────
    // Timeline
    // ─────────────────────────────────────────────────────────────────────────

    timeline:
      (extraction.timeline ?? []).map(
        (entry) => ({

          id:
            entry.id,

          timestampSeconds:
            entry.timestampSeconds,

          label:
            entry.label,

          ...(entry.description
            ? {
                description:
                  entry.description,
              }
            : {}),

          ...(entry.relatedTopicIds
            ? {
                relatedTopicIds:
                  [...entry.relatedTopicIds],
              }
            : {}),

          ...(entry.relatedConceptIds
            ? {
                relatedConceptIds:
                  [...entry.relatedConceptIds],
              }
            : {}),

        })
      ),


    // ─────────────────────────────────────────────────────────────────────────
    // Processing Metadata
    // ─────────────────────────────────────────────────────────────────────────

    processing: {

      processedAt:
        options.processedAt ??
        new Date().toISOString(),

      processingTimeMs:
        options.processingTimeMs,

      ...(options.requestId
        ? {
            requestId:
              options.requestId,
          }
        : {}),

      ...(options.multimodal !== undefined
        ? {
            multimodal:
              options.multimodal,
          }
        : {}),

      visualContentDetected,

      ...(options.warnings &&
      options.warnings.length > 0
        ? {
            warnings:
              [...options.warnings],
          }
        : {}),

    },

  };


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 4 — Canonical schema validation
  //
  // This is deliberately the final authority.
  //
  // The builder never returns an object that has not passed the canonical
  // KnowledgeRepresentation Zod schema.
  // ───────────────────────────────────────────────────────────────────────────

  return validateKnowledgeRepresentation(
    candidate
  );

}