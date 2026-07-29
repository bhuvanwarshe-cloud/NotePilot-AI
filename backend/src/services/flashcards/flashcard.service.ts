import {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  updateAIJobStatus,
} from '../aiJob.service';

import {
  log,
} from '../../utils/logger';

import {
  KnowledgeEngine,
} from '../knowledge/knowledgeEngine';

import {
  InMemoryKnowledgeArtifactRepository,
} from '../knowledge/knowledgeArtifact.repository';

import {
  ContentGenerator,
} from '../knowledge/contentGenerator';

import {
  saveFlashcards,
} from './flashcard.repository';

import type {
  FlashcardDTO,
} from './flashcard.schema';

import type {
  KnowledgeRepresentation,
} from '../sourceUnderstanding/sourceUnderstanding.service';


// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateFlashcardsOptions {

    supabase: SupabaseClient;

    lectureId: string;

    knowledge: KnowledgeRepresentation;

}


// ─────────────────────────────────────────────────────────────────────────────
// Knowledge Engine Factory
// ─────────────────────────────────────────────────────────────────────────────

function createKnowledgeEngine(): KnowledgeEngine {

  const artifactRepository =
    new InMemoryKnowledgeArtifactRepository();

  return new KnowledgeEngine(

    new ContentGenerator(),

    artifactRepository

  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Canonical Knowledge Representation → Flashcards
// ─────────────────────────────────────────────────────────────────────────────

export async function generateFlashcardsFromKnowledgeRepresentation(
  opts: GenerateFlashcardsOptions
): Promise<FlashcardDTO[]> {

  const {

    supabase,
    lectureId,
    knowledge,

  } = opts;


  const knowledgeEngine =
    createKnowledgeEngine();


  try {

    log.info(

      'FlashcardService',

      'Starting flashcard generation from canonical knowledge',

      {

        'Lecture ID':
          lectureId,

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

      }

    );




    const flashcards =
      await knowledgeEngine.generateFlashcardsFromKnowledge(

        lectureId,

        knowledge

      );


   await saveFlashcards(

  supabase,

  {

    lectureId,

    generatedBy:
      'knowledge-engine',

    flashcards,

  }

);


    log.success(

      'FlashcardService',

      'Flashcards generated and persisted',

      {

        'Lecture ID':
          lectureId,

        'Flashcards':
          String(
            flashcards.length
          ),

      }

    );


    /*
     * Do NOT complete the AI Job here.
     *
     * The orchestration job owns the lifecycle.
     */

    return flashcards;

  }

  catch (error: unknown) {

    const message =
      error instanceof Error
        ? error.message
        : 'Flashcard generation failed';


    log.error(

      'FlashcardService',

      'Flashcard generation failed',

      error

    );


    throw error;

  }

}