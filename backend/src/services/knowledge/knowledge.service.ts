import {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  insertNote,
} from '../../repositories/notes.repository';

import {
  updateAIJobStatus,
} from '../aiJob.service';

import {
  log,
} from '../../utils/logger';

import {
  KnowledgeEngine,
} from './knowledgeEngine';

import {
  InMemoryKnowledgeArtifactRepository,
} from './knowledgeArtifact.repository';

import {
  ContentGenerator,
} from './contentGenerator';

import type {
  KnowledgeGenerationInput,
} from './types';

import type {
  KnowledgeRepresentation,
} from '../sourceUnderstanding/sourceUnderstanding.service';


// ─────────────────────────────────────────────────────────────────────────────
// Existing transcript notes options
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateNotesOptions {

  supabase:
    SupabaseClient;

  lectureId:
    string;

  aiJobId:
    string;

  input:
    KnowledgeGenerationInput;

}


// ─────────────────────────────────────────────────────────────────────────────
// Canonical knowledge notes options
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateNotesFromKnowledgeOptions {

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
// Knowledge Engine factory
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
// Existing transcript-based Smart Notes generation
//
// Preserved for current transcript-first sources.
// ─────────────────────────────────────────────────────────────────────────────

export async function generateNotesFromTranscript(
  opts: GenerateNotesOptions
): Promise<{
  noteId: string;
}> {

  const {
    supabase,
    lectureId,
    aiJobId,
    input,
  } = opts;


  const knowledgeEngine =
    createKnowledgeEngine();


  try {

    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'understanding',
      90
    );


    const result =
      await knowledgeEngine.generateNotes(
        input
      );


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'notes_generation',
      95
    );


    const {
      id: noteId,
    } =
      await insertNote(
        supabase,
        {

          lectureId,

          content:
            result.content,

          generatedBy:
            'knowledge-engine',

          status:
            'completed',

          version:
            1,

          title:
            input.title ??
            'Smart Notes',

          sourceType:
            'ai',

        }
      );


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'completed',
      'completed',
      100
    );


    log.success(
      'KnowledgeService',
      'Smart notes saved',
      {

        'Lecture ID':
          lectureId,

        'Note ID':
          noteId,

        'Provider':
          result.metadata.provider,

        'Model':
          result.metadata.model,

      }
    );


    return {
      noteId,
    };


  } catch (error: unknown) {

    const message =
      error instanceof Error
        ? error.message
        : 'Knowledge generation failed';


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'failed',
      'notes_generation',
      0,
      message
    ).catch(
      (statusError) =>

        log.error(
          'KnowledgeService',
          'Could not update AI job to failed',
          statusError
        )

    );


    throw error;

  }

}


// ─────────────────────────────────────────────────────────────────────────────
// Canonical KR → Smart Notes
//
// Used by the new source-understanding architecture.
//
// IMPORTANT:
//
// This function does NOT:
//
// - fetch YouTube
// - call Gemini multimodal understanding
// - create another KnowledgeRepresentation
//
// It consumes the already-created canonical KR.
// ─────────────────────────────────────────────────────────────────────────────

export async function generateNotesFromKnowledgeRepresentation(
  opts: GenerateNotesFromKnowledgeOptions
): Promise<{
  noteId: string;
}> {

  const {
    supabase,
    lectureId,
    aiJobId,
    knowledge,
  } = opts;


  const knowledgeEngine =
    createKnowledgeEngine();


  try {

    log.info(
      'KnowledgeService',
      'Starting Smart Notes generation from canonical knowledge',
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


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'notes_generation',
      90,
      undefined,
      {

        pipeline:
          'canonical_knowledge_to_notes',

      }
    );


    const result =
      await knowledgeEngine.generateNotesFromKnowledge(

        lectureId,

        knowledge

      );


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'saving_notes',
      97
    );


    const {
      id: noteId,
    } =
      await insertNote(
        supabase,
        {

          lectureId,

          content:
            result.content,

          generatedBy:
            'knowledge-engine',

          status:
            'completed',

          version:
            1,

          title:
            knowledge.title ||
            'Smart Notes',

          sourceType:
            'ai',

        }
      );


    log.success(
      'KnowledgeService',
      'Smart Notes generated and persisted from canonical knowledge',
      {

        'Lecture ID':
          lectureId,

        'Note ID':
          noteId,

        'Provider':
          result.metadata.provider,

        'Model':
          result.metadata.model,

      }
    );


    /*
     * Do NOT mark the source-understanding job completed here yet.
     *
     * The outer YouTube orchestration job owns final lifecycle completion.
     *
     * This prevents nested services from competing over the same job state.
     */


    return {

      noteId,

    };


  } catch (error: unknown) {

    const message =
      error instanceof Error
        ? error.message
        : 'Smart Notes generation failed';


    log.error(
      'KnowledgeService',
      'Smart Notes generation from canonical knowledge failed',
      error
    );


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'failed',
      'notes_generation',
      0,
      message
    ).catch(
      (statusError) =>

        log.error(
          'KnowledgeService',
          'Could not update AI job to failed',
          statusError
        )

    );


    throw error;

  }

}