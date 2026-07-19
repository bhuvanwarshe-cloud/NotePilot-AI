/**
 * Knowledge Extraction Contract
 *
 * Defines the exact structured educational data that an AI provider
 * is allowed to extract from a source.
 *
 * IMPORTANT:
 *
 * This is NOT the full KnowledgeRepresentation.
 *
 * The AI generates:
 * - title
 * - language
 * - overview
 * - topics
 * - concepts
 * - definitions
 * - formulas
 * - examples
 * - visual insights
 * - timeline
 * - source-derived metadata such as author/duration when observable
 *
 * NotePilot itself adds:
 * - schemaVersion
 * - sourceType
 * - provider/model
 * - sourceUri
 * - externalId
 * - processedAt
 * - processingTimeMs
 * - acquisition metadata
 */

import { z } from 'zod';

import {
  knowledgeTopicSchema,
  knowledgeConceptSchema,
  knowledgeDefinitionSchema,
  knowledgeFormulaSchema,
  knowledgeExampleSchema,
  visualInsightSchema,
  knowledgeTimelineEntrySchema,
} from './schema';


// ─────────────────────────────────────────────────────────────────────────────
// AI Extraction Contract
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeExtractionSchema = z.object({

  /**
   * Best source-grounded title.
   *
   * For YouTube this will normally be the actual video title.
   */
  title: z.string().min(1),

  /**
   * Primary language of the educational content.
   *
   * Prefer ISO 639-1:
   *
   * en
   * hi
   * mr
   *
   * Mixed-language content may use a primary language here while preserving
   * the actual terminology in explanations.
   */
  language: z.string().min(1),

  /**
   * Concise source-level overview.
   *
   * This is NOT Smart Notes.
   */
  overview: z.string().min(1),

  /**
   * Duration if the provider can reliably determine it.
   *
   * Optional because not every source/provider exposes duration.
   */
  durationSeconds: z
    .number()
    .nonnegative()
    .optional(),

  /**
   * Instructor, author, channel, or creator if reliably identifiable.
   */
  author: z
    .string()
    .min(1)
    .optional(),

  /**
   * Ordered major educational topics.
   */
  topics: z.array(
    knowledgeTopicSchema
  ),

  /**
   * Canonical concepts extracted from the source.
   */
  concepts: z.array(
    knowledgeConceptSchema
  ),

  /**
   * Explicit or clearly taught definitions.
   */
  definitions: z.array(
    knowledgeDefinitionSchema
  ),

  /**
   * Equations/formulas actually taught or shown.
   *
   * Empty array when none exist.
   */
  formulas: z.array(
    knowledgeFormulaSchema
  ),

  /**
   * Examples, analogies, demonstrations, or worked examples
   * actually present in the source.
   */
  examples: z.array(
    knowledgeExampleSchema
  ),

  /**
   * Educationally meaningful visual information.
   *
   * Empty array when the source has no useful visual content.
   */
  visualInsights: z.array(
    visualInsightSchema
  ),

  /**
   * Chronological map for time-based sources.
   *
   * Empty array when unavailable or not applicable.
   */
  timeline: z.array(
    knowledgeTimelineEntrySchema
  ),

});


// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Type Derived From Runtime Schema
// ─────────────────────────────────────────────────────────────────────────────

export type KnowledgeExtraction =
  z.infer<typeof knowledgeExtractionSchema>;


// ─────────────────────────────────────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function validateKnowledgeExtraction(
  data: unknown
): KnowledgeExtraction {

  return knowledgeExtractionSchema.parse(
    data
  );

}


export function safeValidateKnowledgeExtraction(
  data: unknown
) {

  return knowledgeExtractionSchema.safeParse(
    data
  );

}