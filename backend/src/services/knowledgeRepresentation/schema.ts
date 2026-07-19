import { z } from 'zod';
import { KNOWLEDGE_SCHEMA_VERSION } from './types';


// ─────────────────────────────────────────────────────────────────────────────
// Source Reference
// ─────────────────────────────────────────────────────────────────────────────

export const sourceReferenceSchema = z.object({
  timestampSeconds: z.number().nonnegative().optional(),

  pageNumber: z.number().int().positive().optional(),

  section: z.string().min(1).optional(),

  label: z.string().min(1).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Key Point
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeKeyPointSchema = z.object({
  id: z.string().min(1),

  text: z.string().min(1),

  sourceReference: sourceReferenceSchema.optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Concept
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeConceptSchema = z.object({
  id: z.string().min(1),

  name: z.string().min(1),

  explanation: z.string().min(1),

  relatedConceptIds: z.array(z.string().min(1)).optional(),

  sourceReferences: z.array(sourceReferenceSchema).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Definition
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeDefinitionSchema = z.object({
  id: z.string().min(1),

  term: z.string().min(1),

  definition: z.string().min(1),

  sourceReferences: z.array(sourceReferenceSchema).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Formula
// ─────────────────────────────────────────────────────────────────────────────

const formulaVariableSchema = z.object({
  symbol: z.string().min(1),

  meaning: z.string().min(1),

  unit: z.string().min(1).optional(),
});


export const knowledgeFormulaSchema = z.object({
  id: z.string().min(1),

  expression: z.string().min(1),

  name: z.string().min(1).optional(),

  explanation: z.string().min(1).optional(),

  variables: z.array(formulaVariableSchema).optional(),

  sourceReferences: z.array(sourceReferenceSchema).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Example
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeExampleSchema = z.object({
  id: z.string().min(1),

  title: z.string().min(1).optional(),

  description: z.string().min(1),

  relatedConceptIds: z.array(z.string().min(1)).optional(),

  sourceReferences: z.array(sourceReferenceSchema).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Visual Insight
// ─────────────────────────────────────────────────────────────────────────────

export const visualInsightSchema = z.object({
  id: z.string().min(1),

  type: z.enum([
    'diagram',
    'slide',
    'equation',
    'chart',
    'table',
    'drawing',
    'demonstration',
    'code',
    'other',
  ]),

  description: z.string().min(1),

  educationalSignificance: z.string().min(1).optional(),

  relatedConceptIds: z.array(z.string().min(1)).optional(),

  sourceReferences: z.array(sourceReferenceSchema).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Topic
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeTopicSchema = z.object({
  id: z.string().min(1),

  title: z.string().min(1),

  explanation: z.string().min(1),

  keyPoints: z.array(knowledgeKeyPointSchema),

  conceptIds: z.array(z.string().min(1)).optional(),

  definitionIds: z.array(z.string().min(1)).optional(),

  formulaIds: z.array(z.string().min(1)).optional(),

  exampleIds: z.array(z.string().min(1)).optional(),

  visualInsightIds: z.array(z.string().min(1)).optional(),

  sourceReferences: z.array(sourceReferenceSchema).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeTimelineEntrySchema = z.object({
  id: z.string().min(1),

  timestampSeconds: z.number().nonnegative(),

  label: z.string().min(1),

  description: z.string().min(1).optional(),

  relatedTopicIds: z.array(z.string().min(1)).optional(),

  relatedConceptIds: z.array(z.string().min(1)).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Source Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeSourceMetadataSchema = z.object({
  sourceType: z.enum([
    'youtube',
    'audio',
    'video',
    'pdf',
    'textbook',
    'handwritten',
    'text',
  ]),

  provider: z.string().min(1),

  sourceUri: z.string().min(1).optional(),

  externalId: z.string().min(1).optional(),

  durationSeconds: z.number().nonnegative().optional(),

  pageCount: z.number().int().positive().optional(),

  author: z.string().min(1).optional(),

  extra: z.record(
    z.string(),
    z.unknown()
  ).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Processing Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeProcessingMetadataSchema = z.object({
  processedAt: z.string().datetime(),

  processingTimeMs: z.number().nonnegative(),

  requestId: z.string().min(1).optional(),

  multimodal: z.boolean().optional(),

  visualContentDetected: z.boolean().optional(),

  warnings: z.array(z.string().min(1)).optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// Canonical Knowledge Representation
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeRepresentationSchema = z.object({
  schemaVersion: z.literal(KNOWLEDGE_SCHEMA_VERSION),

  source: knowledgeSourceMetadataSchema,

  title: z.string().min(1),

  language: z.string().min(1),

  overview: z.string().min(1),

  topics: z.array(knowledgeTopicSchema),

  concepts: z.array(knowledgeConceptSchema),

  definitions: z.array(knowledgeDefinitionSchema),

  formulas: z.array(knowledgeFormulaSchema),

  examples: z.array(knowledgeExampleSchema),

  visualInsights: z.array(visualInsightSchema).optional(),

  timeline: z.array(knowledgeTimelineEntrySchema).optional(),

  processing: knowledgeProcessingMetadataSchema,
});


// ─────────────────────────────────────────────────────────────────────────────
// Validation API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates unknown runtime data and returns a fully validated
 * KnowledgeRepresentation-compatible object.
 *
 * Throws ZodError when invalid.
 */
export function validateKnowledgeRepresentation(
  data: unknown
): z.infer<typeof knowledgeRepresentationSchema> {
  return knowledgeRepresentationSchema.parse(data);
}


/**
 * Non-throwing version useful when handling AI/provider responses.
 *
 * Example:
 *
 * const result = safeValidateKnowledgeRepresentation(data);
 *
 * if (!result.success) {
 *   // handle malformed AI output
 * }
 */
export function safeValidateKnowledgeRepresentation(
  data: unknown
) {
  return knowledgeRepresentationSchema.safeParse(data);
}