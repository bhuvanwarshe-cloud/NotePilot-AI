/**
 * Knowledge Representation Contract
 *
 * This is the canonical intermediate representation of educational knowledge
 * understood from any NotePilot source.
 *
 * Examples of sources:
 * - YouTube lecture
 * - uploaded audio
 * - uploaded video
 * - PDF
 * - textbook
 * - handwritten notes
 * - raw text
 *
 * IMPORTANT ARCHITECTURAL RULE:
 *
 * KnowledgeRepresentation describes WHAT THE SOURCE TEACHES.
 *
 * It must NOT contain final user-facing artifacts such as:
 * - Smart Notes
 * - Flashcards
 * - Quizzes
 * - Mind Maps
 * - Exam Strategies
 *
 * Those artifacts are generated later by the Knowledge Engine.
 */


// ─────────────────────────────────────────────────────────────────────────────
// Schema Version
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Increment when the structure of KnowledgeRepresentation changes
 * incompatibly.
 *
 * Persisted representations should always store their schema version.
 */
export const KNOWLEDGE_SCHEMA_VERSION = '1.0' as const;

export type KnowledgeSchemaVersion =
  typeof KNOWLEDGE_SCHEMA_VERSION;


// ─────────────────────────────────────────────────────────────────────────────
// Supported Source Types
// ─────────────────────────────────────────────────────────────────────────────

export type KnowledgeSourceType =
  | 'youtube'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'textbook'
  | 'handwritten'
  | 'text';


// ─────────────────────────────────────────────────────────────────────────────
// Source Reference
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Identifies where a specific piece of knowledge came from.
 *
 * Different source types may populate different fields.
 *
 * Examples:
 *
 * YouTube:
 *   timestampSeconds = 174
 *
 * PDF:
 *   pageNumber = 12
 *
 * Text:
 *   section = "Introduction"
 */
export interface SourceReference {
  timestampSeconds?: number;

  pageNumber?: number;

  section?: string;

  /**
   * Optional human-readable locator.
   *
   * Examples:
   * "02:54"
   * "Page 12"
   * "Chapter 3 — PN Junction"
   */
  label?: string;
}


// ─────────────────────────────────────────────────────────────────────────────
// Key Point
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeKeyPoint {
  id: string;

  text: string;

  sourceReference?: SourceReference;
}


// ─────────────────────────────────────────────────────────────────────────────
// Concept
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeConcept {
  id: string;

  name: string;

  explanation: string;

  /**
   * Optional relationships to other concepts by concept ID.
   *
   * Useful later for:
   * - mind maps
   * - prerequisite graphs
   * - RAG
   */
  relatedConceptIds?: string[];

  sourceReferences?: SourceReference[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Definition
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeDefinition {
  id: string;

  term: string;

  definition: string;

  sourceReferences?: SourceReference[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Formula / Equation
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeFormula {
  id: string;

  /**
   * Human-readable or LaTeX-compatible equation.
   *
   * Example:
   * "V = IR"
   */
  expression: string;

  /**
   * Optional name.
   *
   * Example:
   * "Ohm's Law"
   */
  name?: string;

  explanation?: string;

  /**
   * Meaning of symbols if explicitly available.
   */
  variables?: Array<{
    symbol: string;
    meaning: string;
    unit?: string;
  }>;

  sourceReferences?: SourceReference[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Example
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeExample {
  id: string;

  title?: string;

  description: string;

  /**
   * Concept IDs demonstrated by this example.
   */
  relatedConceptIds?: string[];

  sourceReferences?: SourceReference[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Visual Insight
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Knowledge communicated visually rather than purely through speech/text.
 *
 * Especially important for:
 * - YouTube lectures
 * - uploaded videos
 * - diagrams
 * - slides
 * - handwritten material
 * - textbooks
 */
export interface VisualInsight {
  id: string;

  type:
    | 'diagram'
    | 'slide'
    | 'equation'
    | 'chart'
    | 'table'
    | 'drawing'
    | 'demonstration'
    | 'code'
    | 'other';

  description: string;

  /**
   * Educational meaning of the visual.
   *
   * This is more useful than simply saying:
   * "There is a diagram."
   *
   * Example:
   * "The nested circles demonstrate that LLMs are a subset
   * of foundation models."
   */
  educationalSignificance?: string;

  relatedConceptIds?: string[];

  sourceReferences?: SourceReference[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Topic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A major educational section or topic in the source.
 */
export interface KnowledgeTopic {
  id: string;

  title: string;

  /**
   * Explanation of what this topic teaches.
   */
  explanation: string;

  keyPoints: KnowledgeKeyPoint[];

  /**
   * IDs referencing the top-level concepts array.
   */
  conceptIds?: string[];

  /**
   * IDs referencing the top-level definitions array.
   */
  definitionIds?: string[];

  /**
   * IDs referencing the top-level formulas array.
   */
  formulaIds?: string[];

  /**
   * IDs referencing the top-level examples array.
   */
  exampleIds?: string[];

  /**
   * IDs referencing the top-level visualInsights array.
   */
  visualInsightIds?: string[];

  sourceReferences?: SourceReference[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chronological map of a time-based source.
 *
 * Primarily useful for:
 * - YouTube
 * - uploaded video
 * - audio lectures
 */
export interface KnowledgeTimelineEntry {
  id: string;

  timestampSeconds: number;

  label: string;

  description?: string;

  relatedTopicIds?: string[];

  relatedConceptIds?: string[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Source Metadata
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeSourceMetadata {
  sourceType: KnowledgeSourceType;

  /**
   * Provider that produced this knowledge representation.
   *
   * Examples:
   * "gemini-3.5-flash"
   * "groq-whisper-large-v3-turbo"
   */
  provider: string;

  /**
   * Original source locator when applicable.
   *
   * For YouTube this may be the canonical URL.
   *
   * Avoid putting secrets or signed private URLs here.
   */
  sourceUri?: string;

  /**
   * External source identifier.
   *
   * Example:
   * YouTube video ID.
   */
  externalId?: string;

  durationSeconds?: number;

  pageCount?: number;

  author?: string;

  /**
   * Arbitrary provider/source-specific metadata.
   *
   * Keep core educational information OUT of this field.
   */
  extra?: Record<string, unknown>;
}


// ─────────────────────────────────────────────────────────────────────────────
// Processing Metadata
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeProcessingMetadata {
  processedAt: string;

  processingTimeMs: number;

  /**
   * Optional model/provider request identifier for debugging.
   */
  requestId?: string;

  /**
   * Whether multimodal information was analyzed.
   */
  multimodal?: boolean;

  /**
   * Whether useful visual information was detected.
   */
  visualContentDetected?: boolean;

  /**
   * Optional warnings generated during acquisition.
   *
   * Examples:
   * - timestamps may be approximate
   * - some visuals could not be interpreted
   * - source language uncertain
   */
  warnings?: string[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Canonical Knowledge Representation
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeRepresentation {
  schemaVersion: KnowledgeSchemaVersion;

  /**
   * Source-level identity.
   */
  source: KnowledgeSourceMetadata;

  /**
   * Original source title.
   */
  title: string;

  /**
   * ISO 639-1 where possible.
   *
   * Examples:
   * "en"
   * "hi"
   * "mr"
   */
  language: string;

  /**
   * Concise description of what the source teaches.
   *
   * This is NOT the final Smart Notes artifact.
   */
  overview: string;

  /**
   * Ordered major topics.
   */
  topics: KnowledgeTopic[];

  /**
   * Canonical reusable concepts.
   */
  concepts: KnowledgeConcept[];

  definitions: KnowledgeDefinition[];

  formulas: KnowledgeFormula[];

  examples: KnowledgeExample[];

  /**
   * Optional because audio/text sources may contain no visual information.
   */
  visualInsights?: VisualInsight[];

  /**
   * Optional because PDFs/text may not be time-based.
   */
  timeline?: KnowledgeTimelineEntry[];

  processing: KnowledgeProcessingMetadata;
}