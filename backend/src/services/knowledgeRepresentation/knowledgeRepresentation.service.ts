import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import type {
  KnowledgeRepresentation,
} from './types';

import {
  validateKnowledgeRepresentation,
} from './schema';

import {
  upsertKnowledgeRepresentation,
  findKnowledgeRepresentationByLectureId,
  deleteKnowledgeRepresentationByLectureId,
} from './knowledgeRepresentation.repository';


// ─────────────────────────────────────────────────────────────────────────────
// Save Input
// ─────────────────────────────────────────────────────────────────────────────

export interface SaveKnowledgeRepresentationInput {

  supabase: SupabaseClient;

  lectureId: string;

  userId: string;

  provider: string;

  model?: string;

  knowledge: KnowledgeRepresentation;

}


// ─────────────────────────────────────────────────────────────────────────────
// Save Canonical Knowledge Representation
//
// Validation occurs immediately before persistence.
//
// This ensures malformed or partially constructed knowledge can never be
// written through this service.
// ─────────────────────────────────────────────────────────────────────────────

export async function saveKnowledgeRepresentation(
  input: SaveKnowledgeRepresentationInput
): Promise<{

  id: string;

  knowledge: KnowledgeRepresentation;

}> {

  const {

    supabase,

    lectureId,

    userId,

    provider,

    model,

    knowledge,

  } =
    input;


  console.log(
    `[KnowledgeRepresentationService] Persisting canonical knowledge for lecture ${lectureId}`
  );


  // Validate before writing to DB.

  const validated =
    validateKnowledgeRepresentation(
      knowledge
    );


  const row =
    await upsertKnowledgeRepresentation(
      supabase,
      {

        lectureId,

        userId,

        provider,

        model,

        knowledge:
          validated,

      }
    );


  console.log(
    '[KnowledgeRepresentationService] Canonical knowledge persisted ✓'
  );

  console.log(
    `[KnowledgeRepresentationService] ID: ${row.id}`
  );

  console.log(
    `[KnowledgeRepresentationService] Schema: ${row.schema_version}`
  );

  console.log(
    `[KnowledgeRepresentationService] Source: ${row.source_type}`
  );


  return {

    id:
      row.id,

    knowledge:
      validated,

  };

}


// ─────────────────────────────────────────────────────────────────────────────
// Load Canonical Knowledge Representation
//
// IMPORTANT:
//
// JSONB data coming from PostgreSQL is runtime data.
//
// Therefore we validate it AGAIN when loading.
//
// This protects the application from:
// - manually edited DB rows
// - old incompatible schema versions
// - corrupted data
// - future migration mistakes
// ─────────────────────────────────────────────────────────────────────────────

export async function loadKnowledgeRepresentation(
  supabase: SupabaseClient,
  lectureId: string
): Promise<KnowledgeRepresentation | null> {

  const row =
    await findKnowledgeRepresentationByLectureId(
      supabase,
      lectureId
    );


  if (!row) {

    return null;

  }


  const validated =
    validateKnowledgeRepresentation(
      row.representation
    );


  return validated;

}


// ─────────────────────────────────────────────────────────────────────────────
// Require Canonical Knowledge Representation
//
// Useful for downstream systems such as the Knowledge Engine where missing
// canonical knowledge should be considered an error rather than "null".
// ─────────────────────────────────────────────────────────────────────────────

export async function requireKnowledgeRepresentation(
  supabase: SupabaseClient,
  lectureId: string
): Promise<KnowledgeRepresentation> {

  const knowledge =
    await loadKnowledgeRepresentation(
      supabase,
      lectureId
    );


  if (!knowledge) {

    throw new Error(
      `No KnowledgeRepresentation exists for lecture ${lectureId}.`
    );

  }


  return knowledge;

}


// ─────────────────────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteKnowledgeRepresentation(
  supabase: SupabaseClient,
  lectureId: string
): Promise<void> {

  await deleteKnowledgeRepresentationByLectureId(
    supabase,
    lectureId
  );

}