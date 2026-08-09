import {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  generateMindMapFromKnowledgeRepresentation,
} from '../mindmaps/mindmap.service';

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

import {

  AssessmentEngine,

} from "../assessments/assessmentEngine";

const assessmentEngine =
  new AssessmentEngine();

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

  noteId: string;

  flashcardsCount: number;

  quizQuestions: number;

  mindMapId: string;
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

   
    const flashcards =
      await generateFlashcardsFromKnowledgeRepresentation({

        supabase,

        lectureId,

        knowledge,

      });


await updateAIJobStatus(

  supabase,

  aiJobId,

  "processing",

  "quiz_generation",

  99,

);
      // --------------------------------------------------------------------------
// Quiz
// --------------------------------------------------------------------------

// ------------------------------------------------------------------------
// Quiz
// ------------------------------------------------------------------------

const quiz =
  await assessmentEngine.generateQuizFromKnowledge(
    supabase,
    lectureId,
    knowledge,
  );

  // ------------------------------------------------------------------------
// Mind Map
// ------------------------------------------------------------------------

await updateAIJobStatus(
  supabase,
  aiJobId,
  'processing',
  'mind_map_generation',
  99,
);

const mindMap =
  await generateMindMapFromKnowledgeRepresentation({
    supabase,
    lectureId,
    knowledge,
  });

    log.success(

      'ArtifactOrchestrator',

      'Knowledge artifacts generated successfully',

      {

  "Lecture ID":
    lectureId,

  "Note ID":
    notesResult.noteId,

  "Flashcards":
    String(
      flashcards.length,
    ),

  "Quiz Questions":
    String(
      quiz.questions.length,
    ),

    "Mind Map ID":
  mindMap.mindMapId,

}

    );
    
   

 return {

  noteId:
    notesResult.noteId,

  flashcardsCount:
    flashcards.length,

  quizQuestions:
    quiz.questions.length,

  mindMapId:
    mindMap.mindMapId,

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