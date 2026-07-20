import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import type {
  KnowledgeRepresentation,
} from './types';


// ─────────────────────────────────────────────────────────────────────────────
// Database Row
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeRepresentationRow {

  id: string;

  lecture_id: string;

  user_id: string;

  schema_version: string;

  source_type: string;

  provider: string;

  model: string | null;

  representation: KnowledgeRepresentation;

  created_at: string;

  updated_at: string;

}


// ─────────────────────────────────────────────────────────────────────────────
// Upsert Input
// ─────────────────────────────────────────────────────────────────────────────

export interface UpsertKnowledgeRepresentationInput {

  lectureId: string;

  userId: string;

  provider: string;

  model?: string;

  knowledge: KnowledgeRepresentation;

}


// ─────────────────────────────────────────────────────────────────────────────
// Upsert
//
// One lecture has one current canonical KnowledgeRepresentation.
//
// Because the database has:
//
//   UNIQUE (lecture_id)
//
// reprocessing the same lecture replaces the current representation.
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertKnowledgeRepresentation(
  supabase: SupabaseClient,
  input: UpsertKnowledgeRepresentationInput
): Promise<KnowledgeRepresentationRow> {

  const {
    lectureId,
    userId,
    provider,
    model,
    knowledge,
  } =
    input;


  const now =
    new Date().toISOString();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        'knowledge_representations'
      )
      .upsert(
        {

          lecture_id:
            lectureId,

          user_id:
            userId,

          schema_version:
            knowledge.schemaVersion,

          source_type:
            knowledge.source.sourceType,

          provider,

          model:
            model ?? null,

          representation:
            knowledge,

          updated_at:
            now,

        },
        {

          onConflict:
            'lecture_id',

        }
      )
      .select('*')
      .single();


  if (error) {

    throw new Error(
      `Failed to persist KnowledgeRepresentation: ${error.message}`
    );

  }


  if (!data) {

    throw new Error(
      'KnowledgeRepresentation upsert returned no database row.'
    );

  }


  return data as KnowledgeRepresentationRow;

}


// ─────────────────────────────────────────────────────────────────────────────
// Find by Lecture
// ─────────────────────────────────────────────────────────────────────────────

export async function findKnowledgeRepresentationByLectureId(
  supabase: SupabaseClient,
  lectureId: string
): Promise<KnowledgeRepresentationRow | null> {

  const {
    data,
    error,
  } =
    await supabase
      .from(
        'knowledge_representations'
      )
      .select('*')
      .eq(
        'lecture_id',
        lectureId
      )
      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to load KnowledgeRepresentation for lecture ${lectureId}: ${error.message}`
    );

  }


  if (!data) {

    return null;

  }


  return data as KnowledgeRepresentationRow;

}


// ─────────────────────────────────────────────────────────────────────────────
// Delete
//
// Mainly useful for rollback / reprocessing workflows.
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteKnowledgeRepresentationByLectureId(
  supabase: SupabaseClient,
  lectureId: string
): Promise<void> {

  const {
    error,
  } =
    await supabase
      .from(
        'knowledge_representations'
      )
      .delete()
      .eq(
        'lecture_id',
        lectureId
      );


  if (error) {

    throw new Error(
      `Failed to delete KnowledgeRepresentation for lecture ${lectureId}: ${error.message}`
    );

  }

}