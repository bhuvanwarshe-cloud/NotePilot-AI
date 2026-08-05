/**
 * youtubeSourceUnderstanding.job.ts
 *
 * Production orchestration layer for YouTube source understanding.
 *
 * Pipeline:
 *
 * YouTube URL
 *      ↓
 * validate + canonicalize
 *      ↓
 * Gemini multimodal source understanding
 *      ↓
 * Canonical KnowledgeRepresentation
 *      ↓
 * enrich lecture title / thumbnail / language / metadata
 *      ↓
 * persist canonical KR
 *      ↓
 * generate Smart Notes from canonical KR
 *      ↓
 * persist Smart Notes
 *      ↓
 * complete AI job
 *
 * IMPORTANT:
 *
 * Metadata enrichment is NON-FATAL.
 *
 * If title / thumbnail / metadata enrichment fails, the expensive successful
 * source-understanding result must still continue through:
 *
 * - KR persistence
 * - Smart Notes generation
 */

import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  understandYouTubeSource,
} from './sourceUnderstanding.service';

import {
  resolveYouTubeMetadata,
} from './youtubeMetadata.resolver';

import {
  enrichLectureMetadata,
} from '../lectureMetadata.service';

import {
  saveKnowledgeRepresentation,
} from '../knowledgeRepresentation/knowledgeRepresentation.service';

import {
  generateKnowledgeArtifacts,
} from '../artifacts/artifactOrchestrator.service';

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

  url:
    string;

  lectureId:
    string;

  aiJobId:
    string;

  userId:
    string;

  supabase:
    SupabaseClient;

}


// ─────────────────────────────────────────────────────────────────────────────
// YouTube URL Parsing
// ─────────────────────────────────────────────────────────────────────────────

function extractYouTubeVideoId(
  rawUrl: string
): string {

  let parsed:
    URL;


  try {

    parsed =
      new URL(
        rawUrl
      );

  } catch {

    throw new Error(
      'Invalid YouTube URL.'
    );

  }


  const hostname =
    parsed.hostname
      .toLowerCase()
      .replace(
        /^www\./,
        ''
      );


  let videoId:
    string | null =
    null;


  // youtube.com/watch?v=...

  if (
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com'
  ) {

    if (
      parsed.pathname === '/watch'
    ) {

      videoId =
        parsed.searchParams.get(
          'v'
        );

    } else {

      // youtube.com/shorts/<id>
      // youtube.com/embed/<id>

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
    !/^[A-Za-z0-9_-]{11}$/.test(
      videoId
    )
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
    // Stage 1 — Validate + canonicalize YouTube URL
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
    // Stage 2 — Direct multimodal source understanding
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
    // Stage 2.5 — Enrich lecture metadata
    //
    // At upload time, the lecture may initially contain:
    //
    // title:
    //   raw YouTube URL
    //
    // thumbnail:
    //   null
    //
    // language:
    //   null
    //
    // Now we have enough information to enrich it.
    //
    // IMPORTANT:
    //
    // This stage is intentionally NON-FATAL.
    //
    // Failure here must not discard a successful Gemini result.
    // ─────────────────────────────────────────────────────────────────────────

    try {

      const youtubeMetadata =
        resolveYouTubeMetadata(
          videoId
        );


      log.info(
        'YouTubeSourceUnderstandingJob',
        'Enriching lecture with resolved YouTube metadata',
        {

          'Lecture ID':
            lectureId,

          'Title':
            understanding.knowledge.title,

          'Thumbnail':
            youtubeMetadata.thumbnailUrl,

          'Language':
            understanding.knowledge.language,

        }
      );


      await enrichLectureMetadata({

        supabase,

        lectureId,

        title:
          understanding.knowledge.title,

        thumbnailUrl:
          youtubeMetadata.thumbnailUrl,

        language:
          understanding.knowledge.language,

        metadata: {

          youtube: {

            videoId:
              youtubeMetadata.videoId,

            canonicalUrl:
              youtubeMetadata.canonicalUrl,

            thumbnailUrl:
              youtubeMetadata.thumbnailUrl,

          },

          sourceUnderstanding: {

            provider:
              understanding.metadata.provider,

            model:
              understanding.metadata.model,

            schemaVersion:
              understanding.knowledge.schemaVersion,

          },

        },

      });


      log.success(
        'YouTubeSourceUnderstandingJob',
        'Lecture metadata enriched',
        {

          'Lecture ID':
            lectureId,

          'Title':
            understanding.knowledge.title,

          'Thumbnail':
            youtubeMetadata.thumbnailUrl,

          'Language':
            understanding.knowledge.language,

        }
      );


    } catch (
      metadataError: unknown
    ) {

      log.error(
        'YouTubeSourceUnderstandingJob',
        'Lecture metadata enrichment failed — continuing pipeline',
        metadataError
      );

    }


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 3 — Persist Canonical KnowledgeRepresentation
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
    // Stage 4 — Generate Smart Notes from canonical knowledge
    //
    // This is the critical bridge:
    //
    // Canonical KR
    //      ↓
    // Knowledge Engine
    //      ↓
    // Smart Notes
    //      ↓
    // notes table
    //
    // We no longer require a transcript for this direct YouTube pipeline.
    // ─────────────────────────────────────────────────────────────────────────

    await updateAIJobStatus(

      supabase,

      aiJobId,

      'processing',

      'notes_generation',

      95,

      undefined,

      {

        knowledgeRepresentationId:
          persisted.id,

      }

    );


    log.info(
      'YouTubeSourceUnderstandingJob',
      'Starting Smart Notes generation from canonical knowledge',
      {

        'Lecture ID':
          lectureId,

        'Knowledge Representation ID':
          persisted.id,

        'Topics':
          understanding.knowledge.topics.length,

        'Concepts':
          understanding.knowledge.concepts.length,

      }
    );


   const artifacts =
  await generateKnowledgeArtifacts({

    supabase,

    lectureId,

    aiJobId,

    knowledge:
      understanding.knowledge,

  });


log.success(

  'YouTubeSourceUnderstandingJob',

  'Knowledge artifacts generated successfully',

  {

    'Lecture ID':
      lectureId,

    'Knowledge Representation ID':
      persisted.id,

    'Note ID':
      artifacts.noteId,

    'Flashcards':
      String(
        artifacts.flashcardsCount
      ),

  }

);


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 5 — Complete AI job
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

   noteId:
  artifacts.noteId,

flashcardsCount:
  artifacts.flashcardsCount,

quizQuestions:
  artifacts.quizQuestions, 

        videoId,

        canonicalUrl,

        provider:
          understanding.metadata.provider,

        model:
          understanding.metadata.model,

        title:
          understanding.knowledge.title,

        language:
          understanding.knowledge.language,

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
      'YouTube source understanding and knowledge artifact generation completed',
      {

        'Lecture ID':
          lectureId,

        'AI Job ID':
          aiJobId,

        'KR ID':
          persisted.id,

        'Note ID':
  artifacts.noteId,

'Flashcards':
  String(
    artifacts.flashcardsCount,
  ),

'Quiz Questions':
  String(
    artifacts.quizQuestions,
  ),
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


    throw error;

  }

}