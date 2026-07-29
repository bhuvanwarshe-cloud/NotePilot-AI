import { log } from '../../utils/logger';

import {
  ContentGenerator,
} from './contentGenerator';

import type {
  KnowledgeArtifactRepository,
} from './knowledgeArtifact.repository';

import type {
  GenerationMetadata,
  KnowledgeArtifact,
  KnowledgeGenerationInput,
} from './types';

import type {
  KnowledgeRepresentation,
} from '../sourceUnderstanding/sourceUnderstanding.service';

import type {
  FlashcardDTO,
} from '../flashcards/flashcard.schema';


export class KnowledgeEngine {

  constructor(

    private readonly contentGenerator:
      ContentGenerator,

    private readonly artifactRepository:
      KnowledgeArtifactRepository

  ) {}


  // ───────────────────────────────────────────────────────────────────────────
  // Existing transcript-based generation
  //
  // Kept for backward compatibility.
  // ───────────────────────────────────────────────────────────────────────────

  async generateNotes(
    input: KnowledgeGenerationInput
  ): Promise<{
    content: string;
    metadata: GenerationMetadata;
    artifact: KnowledgeArtifact;
  }> {

    log.info(
      'KnowledgeEngine',
      'Starting transcript-based knowledge generation flow',
      {

        'Lecture ID':
          input.lectureId,

        'Language':
          input.language ?? 'unknown',

        'Source':
          input.source ?? 'unknown',

      }
    );


    const result =
      await this.contentGenerator.generateNotes({

        lectureId:
          input.lectureId,

        title:
          input.title,

        transcriptText:
          input.transcriptText,

        language:
          input.language,

        source:
          input.source,

        metadata:
          input.metadata,

      });


    await this.persistArtifactMetadata(
      input.lectureId,
      result
    );


    return result;

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Canonical KnowledgeRepresentation generation
  //
  // This is the preferred entry point for the new source-understanding
  // architecture.
  //
  // Source → Canonical KR → Knowledge Engine
  // ───────────────────────────────────────────────────────────────────────────

  async generateNotesFromKnowledge(
    lectureId: string,
    knowledge: KnowledgeRepresentation
  ): Promise<{
    content: string;
    metadata: GenerationMetadata;
    artifact: KnowledgeArtifact;
  }> {

    log.info(
      'KnowledgeEngine',
      'Starting canonical knowledge generation flow',
      {

        'Lecture ID':
          lectureId,

        'Title':
          knowledge.title,

        'Language':
          knowledge.language,

        'Source':
          knowledge.source.sourceType,

        'Topics':
          String(
            knowledge.topics.length
          ),

        'Concepts':
          String(
            knowledge.concepts.length
          ),

      }
    );


    const result =
      await this.contentGenerator.generateNotesFromKnowledge({

        lectureId,

        knowledge,

      });


    await this.persistArtifactMetadata(
      lectureId,
      result
    );


    return result;

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Canonical KnowledgeRepresentation → Flashcards
  //
  // Generates flashcards from the already validated canonical knowledge.
  //
  // Unlike Smart Notes, flashcards are persisted directly through the
  // Flashcard Repository, so no KnowledgeArtifact metadata is stored here.
  // ───────────────────────────────────────────────────────────────────────────

  async generateFlashcardsFromKnowledge(
    lectureId: string,
    knowledge: KnowledgeRepresentation
  ): Promise<FlashcardDTO[]> {

    log.info(
      'KnowledgeEngine',
      'Starting flashcard generation from canonical knowledge',
      {

        'Lecture ID':
          lectureId,

        'Title':
          knowledge.title,

        'Language':
          knowledge.language,

        'Source':
          knowledge.source.sourceType,

        'Topics':
          String(
            knowledge.topics.length
          ),

        'Concepts':
          String(
            knowledge.concepts.length
          ),

      }
    );


    return this.contentGenerator.generateFlashcardsFromKnowledge({

      lectureId,

      knowledge,

    });

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Shared artifact persistence
  // ───────────────────────────────────────────────────────────────────────────

  private async persistArtifactMetadata(
    lectureId: string,
    result: {
      content: string;
      metadata: GenerationMetadata;
      artifact: KnowledgeArtifact;
    }
  ): Promise<void> {

    await this.artifactRepository.saveArtifact(

      lectureId,

      result.artifact,

      {

        provider:
          result.metadata.provider,

        model:
          result.metadata.model,

        systemPromptVersion:
          result.metadata.systemPromptVersion,

        taskPromptVersion:
          result.metadata.taskPromptVersion,

        generatedAt:
          result.metadata.generatedAt,

      }

    );

  }

}