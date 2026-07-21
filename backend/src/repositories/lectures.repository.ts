/**
 * lectures.repository.ts
 *
 * Repository helpers for the lectures table.
 *
 * Phase 3.5:
 * Supports post-processing enrichment of lecture metadata after
 * source understanding has completed.
 */

import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  log,
} from '../utils/logger';


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateLectureMetadataInput {

  title?:
    string;

  thumbnailUrl?:
    string;

  language?:
    string;

  metadata?:
    Record<string, unknown>;

}


// ─────────────────────────────────────────────────────────────────────────────
// Update Lecture Metadata
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enriches an existing lecture after source understanding.
 *
 * Supports:
 *
 * - AI-resolved title
 * - source thumbnail
 * - detected language
 * - extensible JSON metadata
 *
 * Existing JSON metadata is preserved and merged with incoming metadata.
 */
export async function updateLectureMetadata(
  supabase: SupabaseClient,
  lectureId: string,
  input: UpdateLectureMetadataInput
): Promise<void> {

  log.info(
    'LecturesRepo',
    'Updating lecture metadata',
    {

      'Lecture ID':
        lectureId,

      'Title':
        input.title ?? '(unchanged)',

      'Thumbnail':
        input.thumbnailUrl ?? '(unchanged)',

      'Language':
        input.language ?? '(unchanged)',

      'Metadata':
        input.metadata
          ? 'provided'
          : '(unchanged)',

    }
  );


  // ───────────────────────────────────────────────────────────────────────────
  // 1. Load existing metadata
  //
  // We preserve existing metadata instead of blindly replacing it.
  // ───────────────────────────────────────────────────────────────────────────

  let existingMetadata:
    Record<string, unknown> =
    {};


  if (
    input.metadata !== undefined
  ) {

    const {
      data,
      error,
    } =
      await supabase
        .from('lectures')
        .select('metadata')
        .eq('id', lectureId)
        .single();


    if (error) {

      throw new Error(
        `Failed to load existing lecture metadata: ${error.message}`
      );

    }


    if (
      data?.metadata &&
      typeof data.metadata === 'object' &&
      !Array.isArray(data.metadata)
    ) {

      existingMetadata =
        data.metadata as Record<string, unknown>;

    }

  }


  // ───────────────────────────────────────────────────────────────────────────
  // 2. Build partial update
  // ───────────────────────────────────────────────────────────────────────────

  const updates:
    Record<string, unknown> =
    {};


  if (
    input.title !== undefined
  ) {

    updates.title =
      input.title;

  }


  if (
    input.thumbnailUrl !== undefined
  ) {

    updates.thumbnail_url =
      input.thumbnailUrl;

  }


  if (
    input.language !== undefined
  ) {

    updates.language =
      input.language;

  }


  if (
    input.metadata !== undefined
  ) {

    updates.metadata = {

      ...existingMetadata,

      ...input.metadata,

    };

  }


  updates.updated_at =
    new Date().toISOString();


  // ───────────────────────────────────────────────────────────────────────────
  // 3. Persist
  // ───────────────────────────────────────────────────────────────────────────

  const {
    error,
  } =
    await supabase
      .from('lectures')
      .update(updates)
      .eq('id', lectureId);


  if (error) {

    throw new Error(
      `Failed to update lecture metadata: ${error.message}`
    );

  }


  log.success(
    'LecturesRepo',
    'Lecture metadata updated',
    {

      'Lecture ID':
        lectureId,

    }
  );

}