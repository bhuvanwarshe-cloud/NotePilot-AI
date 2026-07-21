/**
 * lectureMetadata.service.ts
 *
 * Phase 3.5 — Lecture Metadata Enrichment
 *
 * Responsible for enriching an already-created lecture after
 * source understanding provides better information.
 *
 * Examples:
 *
 * YouTube:
 *
 * raw URL title
 *      ↓
 * AI-understood title
 *
 * no thumbnail
 *      ↓
 * deterministic YouTube thumbnail
 *
 * unknown language
 *      ↓
 * detected source language
 *
 * source-specific information
 *      ↓
 * extensible metadata JSON
 */

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
// Input
// ─────────────────────────────────────────────────────────────────────────────

export interface EnrichLectureMetadataInput {

  supabase:
    SupabaseClient;

  lectureId:
    string;

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
// Service
// ─────────────────────────────────────────────────────────────────────────────

export async function enrichLectureMetadata(
  input: EnrichLectureMetadataInput
): Promise<void> {

  log.info(
    'LectureMetadataService',
    'Enriching lecture metadata',
    {

      'Lecture ID':
        input.lectureId,

      'Has title':
        input.title
          ? 'yes'
          : 'no',

      'Has thumbnail':
        input.thumbnailUrl
          ? 'yes'
          : 'no',

      'Has language':
        input.language
          ? 'yes'
          : 'no',

      'Has metadata':
        input.metadata
          ? 'yes'
          : 'no',

    }
  );


  await updateLectureMetadata(

    input.supabase,

    input.lectureId,

    {

      title:
        input.title,

      thumbnailUrl:
        input.thumbnailUrl,

      language:
        input.language,

      metadata:
        input.metadata,

    }

  );


  log.success(
    'LectureMetadataService',
    'Lecture metadata enrichment completed',
    {

      'Lecture ID':
        input.lectureId,

    }
  );

}