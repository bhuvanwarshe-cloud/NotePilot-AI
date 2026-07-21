import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  updateLectureMetadata,
} from '../repositories/lectures.repository';

import {
  log,
} from '../utils/logger';


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EnrichLectureMetadataInput {

  supabase: SupabaseClient;

  lectureId: string;

  title?: string;

  thumbnailUrl?: string | null;

  metadata?: Record<string, unknown>;

}


// ─────────────────────────────────────────────────────────────────────────────
// Lecture Metadata Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Production boundary for enriching an existing lecture after more accurate
 * information becomes available.
 *
 * Provider/source-specific code should call this service rather than updating
 * the lectures table directly.
 */
export async function enrichLectureMetadata(
  input: EnrichLectureMetadataInput
): Promise<void> {

  const {

    supabase,

    lectureId,

    title,

    thumbnailUrl,

    metadata,

  } =
    input;


  log.info(
    'LectureMetadataService',
    'Enriching lecture metadata',
    {

      'Lecture ID':
        lectureId,

      'Has title':
        title
          ? 'yes'
          : 'no',

      'Has thumbnail':
        thumbnailUrl
          ? 'yes'
          : 'no',

      'Has metadata':
        metadata
          ? 'yes'
          : 'no',

    }
  );


  await updateLectureMetadata(
    supabase,
    lectureId,
    {

      title,

      thumbnailUrl,

      metadata,

    }
  );


  log.success(
    'LectureMetadataService',
    'Lecture metadata enrichment completed',
    {

      'Lecture ID':
        lectureId,

    }
  );

}