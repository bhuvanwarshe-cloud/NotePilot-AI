/**
 * youtubeSourceUnderstanding.job.ts
 *
 * Production orchestration layer for YouTube source understanding.
 *
 * Responsibility:
 *
 * YouTube URL
 *      ↓
 * validate + canonicalize
 *      ↓
 * SourceUnderstandingService
 *      ↓
 * Gemini multimodal understanding
 *      ↓
 * Canonical KnowledgeRepresentation
 *      ↓
 * persist canonical KR
 *      ↓
 * update AI job lifecycle
 *
 * IMPORTANT:
 *
 * This file intentionally sits ABOVE sourceUnderstanding.service.ts.
 *
 * sourceUnderstanding.service.ts remains pure:
 *
 * SOURCE → CANONICAL KNOWLEDGE
 *
 * This job layer owns production concerns:
 *
 * - ai_jobs lifecycle
 * - persistence
 * - logging
 * - production failure handling
 */

import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  understandYouTubeSource,
} from './sourceUnderstanding.service';

import {
  saveKnowledgeRepresentation,
} from '../knowledgeRepresentation/knowledgeRepresentation.service';

import {
  updateAIJobStatus,
} from '../aiJob.service';

import {
  log,
} from '../../utils/logger';


// ─────────────────────────────────────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────────────────────────────────────

export interface RunYouTubeSourceUnderstandingJobInput {

  url: string;

  lectureId: string;

  aiJobId: string;

  userId: string;

  supabase: SupabaseClient;

}


// ─────────────────────────────────────────────────────────────────────────────
// YouTube URL Parsing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts a YouTube video ID from supported public URL formats.
 *
 * Supported examples:
 *
 * https://www.youtube.com/watch?v=VIDEO_ID
 * https://youtube.com/watch?v=VIDEO_ID
 * https://youtu.be/VIDEO_ID
 * https://www.youtube.com/shorts/VIDEO_ID
 * https://www.youtube.com/embed/VIDEO_ID
 *
 * Returns a clean 11-character video ID.
 */
function extractYouTubeVideoId(
  rawUrl: string
): string {

  let parsed: URL;

  try {

    parsed =
      new URL(rawUrl);

  } catch {

    throw new Error(
      'Invalid YouTube URL.'
    );

  }


  const hostname =
    parsed.hostname
      .toLowerCase()
      .replace(/^www\./, '');


  let videoId:
    string | null =
    null;


  // Standard YouTube URL:
  //
  // youtube.com/watch?v=...

  if (
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com'
  ) {

    if (
      parsed.pathname === '/watch'
    ) {

      videoId =
        parsed.searchParams.get('v');

    } else {

      // /shorts/<id>
      // /embed/<id>

      const segments =
        parsed.pathname
          .split('/')
          .filter(Boolean);


      if (
        segments.length >= 2 &&
        (
          segments[0] === 'shorts' ||
          segments[0] === 'embed'
        )
      ) {

        videoId =
          segments[1];

      }

    }

  }


  // Short URL:
  //
  // youtu.be/<id>

  if (
    hostname === 'youtu.be'
  ) {

    const segments =
      parsed.pathname
        .split('/')
        .filter(Boolean);


    videoId =
      segments[0] ?? null;

  }


  if (
    !videoId ||
    !/^[A-Za-z0-9_-]{11}$/.test(videoId)
  ) {

    throw new Error(
      'Could not extract a valid YouTube video ID from the supplied URL.'
    );

  }


  return videoId;

}


// ─────────────────────────────────────────────────────────────────────────────
// Production Job
// ─────────────────────────────────────────────────────────────────────────────

export async function runYouTubeSourceUnderstandingJob(
  input: RunYouTubeSourceUnderstandingJobInput
): Promise<void> {

  const {

    url,

    lectureId,

    aiJobId,

    userId,

    supabase,

  } =
    input;


  const startedAt =
    Date.now();


  log.banner(
    'YouTube Source Understanding Job Started',
    {

      'Lecture ID':
        lectureId,

      'AI Job ID':
        aiJobId,

      'URL':
        url,

    }
  );


  try {

    // ─────────────────────────────────────────────────────────────────────────
    // Stage 1 — Validate + canonicalize
    // ─────────────────────────────────────────────────────────────────────────

    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'validating',
      5
    );


    const videoId =
      extractYouTubeVideoId(
        url
      );


    const canonicalUrl =
      `https://www.youtube.com/watch?v=${videoId}`;


    log.success(
      'YouTubeSourceUnderstandingJob',
      'YouTube URL validated',
      {

        'Video ID':
          videoId,

        'Canonical URL':
          canonicalUrl,

      }
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 2 — Understand source
    //
    // This is expected to be the longest-running stage.
    //
    // Gemini performs direct multimodal understanding of the YouTube source.
    // ─────────────────────────────────────────────────────────────────────────

    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'understanding_source',
      15,
      undefined,
      {

        videoId,

        canonicalUrl,

        understandingProvider:
          'GeminiYouTubeProvider',

      }
    );


    log.info(
      'YouTubeSourceUnderstandingJob',
      'Starting Gemini multimodal source understanding',
      {

        'Video ID':
          videoId,

      }
    );


    const understanding =
      await understandYouTubeSource({

        videoId,

        canonicalUrl,

        requestId:
          aiJobId,

      });


    log.success(
      'YouTubeSourceUnderstandingJob',
      'Canonical knowledge created',
      {

        'Title':
          understanding.knowledge.title,

        'Topics':
          understanding.knowledge.topics.length,

        'Concepts':
          understanding.knowledge.concepts.length,

        'Provider':
          understanding.metadata.provider,

        'Model':
          understanding.metadata.model,

      }
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 3 — Persist Canonical KR
    // ─────────────────────────────────────────────────────────────────────────

    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'saving_knowledge',
      90,
      undefined,
      {

        provider:
          understanding.metadata.provider,

        model:
          understanding.metadata.model,

        providerProcessingTimeMs:
          understanding.metadata.providerProcessingTimeMs,

      }
    );


    const persisted =
      await saveKnowledgeRepresentation({

        supabase,

        lectureId,

        userId,

        provider:
          understanding.metadata.provider,

        model:
          understanding.metadata.model,

        knowledge:
          understanding.knowledge,

      });


    log.success(
      'YouTubeSourceUnderstandingJob',
      'Canonical KnowledgeRepresentation persisted',
      {

        'Knowledge Representation ID':
          persisted.id,

      }
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 4 — Complete AI job
    // ─────────────────────────────────────────────────────────────────────────

    const totalProcessingTimeMs =
      Date.now() -
      startedAt;


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'completed',
      'done',
      100,
      undefined,
      {

        pipeline:
          'direct_source_understanding',

        knowledgeRepresentationId:
          persisted.id,

        videoId,

        canonicalUrl,

        provider:
          understanding.metadata.provider,

        model:
          understanding.metadata.model,

        title:
          understanding.knowledge.title,

        schemaVersion:
          understanding.knowledge.schemaVersion,

        topicsCount:
          understanding.knowledge.topics.length,

        conceptsCount:
          understanding.knowledge.concepts.length,

        totalProcessingTimeMs,

      }
    );


    log.success(
      'YouTubeSourceUnderstandingJob',
      'YouTube source understanding completed',
      {

        'Lecture ID':
          lectureId,

        'AI Job ID':
          aiJobId,

        'KR ID':
          persisted.id,

        'Duration':
          `${totalProcessingTimeMs}ms`,

      }
    );


  } catch (
    error: unknown
  ) {

    // ─────────────────────────────────────────────────────────────────────────
    // Failure handling
    // ─────────────────────────────────────────────────────────────────────────

    const message =
      error instanceof Error
        ? error.message
        : String(error);


    log.error(
      'YouTubeSourceUnderstandingJob',
      'YouTube source understanding failed',
      error
    );


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'failed',
      'source_understanding_failed',
      0,
      message,
      {

        pipeline:
          'direct_source_understanding',

        failedAt:
          new Date().toISOString(),

      }
    );


    /*
     * Re-throw so the controller's fire-and-forget safety catch can log
     * unexpected background failures.
     *
     * The AI job has already been marked failed above.
     */

    throw error;

  }

}