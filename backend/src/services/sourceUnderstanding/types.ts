/**
 * Source Understanding Provider Types
 *
 * Contracts for providers that understand source material directly
 * and return structured educational knowledge.
 */

import type {
  KnowledgeExtraction,
} from '../knowledgeRepresentation/extraction.schema';


export interface SourceUnderstandingResult {

  extraction: KnowledgeExtraction;

  provider: string;

  model: string;

  processingTimeMs: number;

  metadata?: Record<string, unknown>;

}


export interface YouTubeSourceUnderstandingInput {

  videoId: string;

  canonicalUrl: string;

}