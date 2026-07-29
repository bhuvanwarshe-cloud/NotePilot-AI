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
  generateNotesFromKnowledgeRepresentation,
} from '../knowledge/knowledge.service';

import {
  generateFlashcardsFromKnowledgeRepresentation,
} from '../flashcards/flashcard.service';

import type {
  KnowledgeRepresentation,
} from '../sourceUnderstanding/sourceUnderstanding.service';


// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateArtifactsOptions {

  supabase:
    SupabaseClient;

  lectureId:
    string;

  aiJobId:
    string;

  knowledge:
    KnowledgeRepresentation;

}


// ─────────────────────────────────────────────────────────────────────────────
// Result
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratedArtifactsResult {

  noteId:
    string;

  flashcardsCount:
    number;

}


// ─────────────────────────────────────────────────────────────────────────────
// Artifact Orchestrator
//
// Coordinates generation of all AI artifacts from an already-created
// Knowledge Representation.
//
// Responsibilities:
//
// ✓ Job progress
// ✓ Service orchestration
// ✓ Logging
//
// Does NOT:
//
// ✗ Complete the AI job
// ✗ Mark the AI job as failed
//
// Those remain the responsibility of the outer pipeline.
// ─────────────────────────────────────────────────────────────────────────────

export async function generateKnowledgeArtifacts(
  opts: GenerateArtifactsOptions
): Promise<GeneratedArtifactsResult> {

  const {

    supabase,
    lectureId,
    aiJobId,
    knowledge,

  } = opts;


  log.info(

    'ArtifactOrchestrator',

    'Starting knowledge artifact generation',

    {

      'Lecture ID':
        lectureId,

      'Title':
        knowledge.title,

    }

  );


  try {

    // ------------------------------------------------------------------------
    // Smart Notes
    // ------------------------------------------------------------------------

    await updateAIJobStatus(

      supabase,

      aiJobId,

      'processing',

      'notes_generation',

      95

    );


    const notesResult =
      await generateNotesFromKnowledgeRepresentation({

        supabase,

        lectureId,

        knowledge,

      });


    // ------------------------------------------------------------------------
    // Flashcards
    // ------------------------------------------------------------------------

    await updateAIJobStatus(

      supabase,

      aiJobId,

      'processing',

      'flashcards_generation',

      97

    );


    const flashcards =
      await generateFlashcardsFromKnowledgeRepresentation({

        supabase,

        lectureId,

        knowledge,

      });


    log.success(

      'ArtifactOrchestrator',

      'Knowledge artifacts generated successfully',

      {

        'Lecture ID':
          lectureId,

        'Note ID':
          notesResult.noteId,

        'Flashcards':
          String(
            flashcards.length
          ),

      }

    );


    return {

      noteId:
        notesResult.noteId,

      flashcardsCount:
        flashcards.length,

    };

  }

  catch (error: unknown) {

    log.error(

      'ArtifactOrchestrator',

      'Knowledge artifact generation failed',

      error

    );

    throw error;

  }

}