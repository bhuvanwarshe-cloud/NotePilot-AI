import { systemPrompt } from './prompts/system.prompt';
import { notesPrompt } from './prompts/notes.prompt';
import { philosophyPrompt } from './prompts/shared/philosophy.prompt';
import { formattingPrompt } from './prompts/shared/formatting.prompt';

import { aiConfig } from './ai.config';

import { ProviderRouter } from './providers/provider.router';

import type {
  GenerationMetadata,
  KnowledgeArtifact,
} from './types';

import type {
  KnowledgeRepresentation,
} from '../sourceUnderstanding/sourceUnderstanding.service';

import { MarkdownFormatter } from './markdownFormatter';

import { log } from '../../utils/logger';


// ─────────────────────────────────────────────────────────────────────────────
// Transcript-based generation request
//
// Used by the existing transcript-first pipeline.
// ─────────────────────────────────────────────────────────────────────────────

export interface ContentGenerationRequest {

  lectureId: string;

  title?: string | null;

  transcriptText: string;

  language?: string;

  source?: string;

  metadata?: Record<string, unknown>;

}


// ─────────────────────────────────────────────────────────────────────────────
// Canonical knowledge-based generation request
//
// Used by the new Source Understanding architecture.
//
// IMPORTANT:
//
// The KnowledgeRepresentation is already:
//
// - structurally validated
// - semantically validated
// - source-normalized
//
// Therefore the notes generator should NOT re-understand the original source.
// It should transform the canonical knowledge into a student-facing artifact.
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeContentGenerationRequest {

  lectureId: string;

  knowledge: KnowledgeRepresentation;

  metadata?: Record<string, unknown>;

}


export class ContentGenerator {

  constructor(

    private readonly providerRouter =
      new ProviderRouter(),

    private readonly markdownFormatter =
      new MarkdownFormatter()

  ) {}


  // ───────────────────────────────────────────────────────────────────────────
  // Existing transcript path
  //
  // Kept unchanged for backward compatibility with:
  //
  // Audio → Transcript → Smart Notes
  // ───────────────────────────────────────────────────────────────────────────

  async generateNotes(
    request: ContentGenerationRequest
  ): Promise<{
    content: string;
    metadata: GenerationMetadata;
    artifact: KnowledgeArtifact;
  }> {

    const task =
      `${notesPrompt}

Lecture title: ${request.title ?? 'Untitled lecture'}

Transcript:
${request.transcriptText}`;


    return this.generateNotesArtifact(
      request.lectureId,
      task
    );

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Canonical KnowledgeRepresentation path
  //
  // Used by:
  //
  // YouTube
  //    ↓
  // Gemini multimodal understanding
  //    ↓
  // Canonical KR
  //    ↓
  // Smart Notes
  //
  // Gemini does NOT receive the YouTube URL again.
  // ───────────────────────────────────────────────────────────────────────────

  async generateNotesFromKnowledge(
    request: KnowledgeContentGenerationRequest
  ): Promise<{
    content: string;
    metadata: GenerationMetadata;
    artifact: KnowledgeArtifact;
  }> {

    const knowledge =
      request.knowledge;


    /*
     * We intentionally provide the structured canonical representation
     * instead of flattening it into pseudo-transcript text.
     *
     * This preserves:
     *
     * - topic hierarchy
     * - concepts
     * - definitions
     * - formulas
     * - examples
     * - visual insights
     * - timeline/source references
     */

    const serializedKnowledge =
      JSON.stringify(
        knowledge,
        null,
        2
      );


    const task =
      `${notesPrompt}

You are given a canonical structured knowledge representation of the source material.

This representation has already been extracted and validated.

Your task is to transform ONLY this supplied knowledge into polished,
student-facing Smart Notes.

Do not claim to watch, access, inspect, or re-process the original source.

Preserve important:
- concepts
- definitions
- formulas
- examples
- relationships
- visual explanations when educationally useful
- source timestamps/references when useful

Do not invent facts that are not supported by the supplied knowledge.

Lecture title:
${knowledge.title}

Language:
${knowledge.language}

Canonical Knowledge Representation:

${serializedKnowledge}`;


    log.info(
      'ContentGenerator',
      'Generating Smart Notes from canonical knowledge',
      {
        'Lecture ID':
          request.lectureId,

        'Title':
          knowledge.title,

        'Topics':
          String(
            knowledge.topics.length
          ),

        'Concepts':
          String(
            knowledge.concepts.length
          ),

        'Input chars':
          String(
            serializedKnowledge.length
          ),
      }
    );


    return this.generateNotesArtifact(
      request.lectureId,
      task
    );

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Shared generation implementation
  //
  // Both:
  //
  // Transcript → Notes
  //
  // and
  //
  // Canonical KR → Notes
  //
  // use the same provider, formatting, metadata, and artifact contract.
  // ───────────────────────────────────────────────────────────────────────────

  private async generateNotesArtifact(
    lectureId: string,
    task: string
  ): Promise<{
    content: string;
    metadata: GenerationMetadata;
    artifact: KnowledgeArtifact;
  }> {

    const provider =
      this.providerRouter.createProvider();


    const system =
      [
        systemPrompt,
        philosophyPrompt,
        formattingPrompt,
      ].join('\n\n');


    const generatedText =
      await provider.generate({

        systemPrompt:
          system,

        taskPrompt:
          task,

        model:
          aiConfig.model,

        temperature:
          aiConfig.temperature,

        maxTokens:
          aiConfig.maxTokens,

      });


    const formattedContent =
      this.markdownFormatter.format(
        generatedText
      );


    const artifact: KnowledgeArtifact = {

      topics: [],

      definitions: [],

      formulae: [],

      examples: [],

      importantConcepts: [],

      examInsights: [],

      rawMarkdown:
        formattedContent,

    };


    const metadata: GenerationMetadata = {

      provider:
        provider.providerName,

      model:
        aiConfig.model,

      systemPromptVersion:
        aiConfig.promptVersions.system,

      taskPromptVersion:
        aiConfig.promptVersions.notes,

      temperature:
        aiConfig.temperature,

      generatedAt:
        new Date().toISOString(),

    };


    log.success(
      'ContentGenerator',
      'Notes content generated',
      {

        'Lecture ID':
          lectureId,

        'Provider':
          metadata.provider,

        'Model':
          metadata.model,

        'Chars':
          String(
            formattedContent.length
          ),

      }
    );


    return {

      content:
        formattedContent,

      metadata,

      artifact,

    };

  }

}