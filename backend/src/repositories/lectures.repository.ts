import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  log,
} from '../utils/logger';


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LectureMetadataUpdate {

  title?: string;

  thumbnailUrl?: string | null;

  metadata?: Record<string, unknown>;

}


// ─────────────────────────────────────────────────────────────────────────────
// Update Lecture Metadata
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates metadata discovered after initial lecture creation.
 *
 * Typical lifecycle:
 *
 * Upload
 *   ↓
 * lecture row created with provisional information
 *   ↓
 * source understanding
 *   ↓
 * better metadata discovered
 *   ↓
 * updateLectureMetadata()
 *
 * This repository function contains no YouTube-specific logic.
 */
export async function updateLectureMetadata(
  supabase: SupabaseClient,
  lectureId: string,
  update: LectureMetadataUpdate
): Promise<void> {

  const payload:
    Record<string, unknown> =
    {};


  // ───────────────────────────────────────────────────────────────────────────
  // Title
  // ───────────────────────────────────────────────────────────────────────────

  if (
    typeof update.title === 'string' &&
    update.title.trim().length > 0
  ) {

    payload.title =
      update.title.trim();

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Thumbnail
  // ───────────────────────────────────────────────────────────────────────────

  if (
    update.thumbnailUrl !== undefined
  ) {

    payload.thumbnail_url =
      update.thumbnailUrl;

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Metadata
  //
  // IMPORTANT:
  //
  // We merge with existing metadata rather than blindly replacing it.
  // ───────────────────────────────────────────────────────────────────────────

  if (
    update.metadata !== undefined
  ) {

    const {
      data: existingLecture,
      error: fetchError,
    } =
      await supabase
        .from('lectures')
        .select('metadata')
        .eq('id', lectureId)
        .single();


    if (
      fetchError
    ) {

      throw new Error(
        `Failed to load existing lecture metadata: ${fetchError.message}`
      );

    }


    const existingMetadata =
      (
        existingLecture?.metadata &&
        typeof existingLecture.metadata === 'object' &&
        !Array.isArray(existingLecture.metadata)
      )
        ? existingLecture.metadata as Record<string, unknown>
        : {};


    payload.metadata = {

      ...existingMetadata,

      ...update.metadata,

    };

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Nothing to update
  // ───────────────────────────────────────────────────────────────────────────

  if (
    Object.keys(payload).length === 0
  ) {

    log.info(
      'LecturesRepo',
      'Lecture metadata update skipped — no fields supplied',
      {
        'Lecture ID':
          lectureId,
      }
    );

    return;

  }


  log.info(
    'LecturesRepo',
    'Updating lecture metadata',
    {

      'Lecture ID':
        lectureId,

      'Title':
        typeof payload.title === 'string'
          ? payload.title
          : '(unchanged)',

      'Thumbnail':
        payload.thumbnail_url !== undefined
          ? String(payload.thumbnail_url)
          : '(unchanged)',

    }
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Persist
  // ───────────────────────────────────────────────────────────────────────────

  const {
    error,
  } =
    await supabase
      .from('lectures')
      .update(payload)
      .eq('id', lectureId);


  if (
    error
  ) {

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