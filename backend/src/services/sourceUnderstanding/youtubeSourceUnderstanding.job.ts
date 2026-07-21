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
 * SourceUnderstandingService
 *      ↓
 * Gemini multimodal understanding
 *      ↓
 * Canonical KnowledgeRepresentation
 *      ↓
 * persist canonical KR
 *      ↓
 * Knowledge Engine
 *      ↓
 * generate Smart Notes FROM KR
 *      ↓
 * persist notes
 *      ↓
 * complete AI job
 *
 * IMPORTANT:
 *
 * Gemini understands the original YouTube source only ONCE.
 *
 * Smart Notes generation consumes the already-created canonical
 * KnowledgeRepresentation. It does not re-fetch or re-process YouTube.
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
  generateNotesFromKnowledgeRepresentation,
} from '../knowledge/knowledge.service';

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


  /*
   * Track completed stages so failure logs and ai_jobs metadata can tell us
   * exactly how far the pipeline progressed.
   */

  let knowledgeRepresentationId:
    string | null =
    null;

  let noteId:
    string | null =
    null;

  let currentStage =
    'initializing';


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

    currentStage =
      'validating';


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
    //
    // IMPORTANT:
    //
    // This is the ONLY stage where the original YouTube source is understood.
    // ─────────────────────────────────────────────────────────────────────────

    currentStage =
      'understanding_source';


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
    // Stage 3 — Persist Canonical KnowledgeRepresentation
    // ─────────────────────────────────────────────────────────────────────────

    currentStage =
      'saving_knowledge';


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'saving_knowledge',
      80,
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


    knowledgeRepresentationId =
      persisted.id;


    log.success(
      'YouTubeSourceUnderstandingJob',
      'Canonical KnowledgeRepresentation persisted',
      {

        'Knowledge Representation ID':
          knowledgeRepresentationId,

      }
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 4 — Generate Smart Notes FROM Canonical KR
    //
    // This is the bridge introduced in Phase 3.4.
    //
    // IMPORTANT:
    //
    // We pass understanding.knowledge directly.
    //
    // We do NOT:
    //
    // - send the YouTube URL back into source understanding
    // - download the video
    // - generate another transcript
    // - regenerate the KR
    //
    // The Knowledge Engine transforms the existing KR into student-facing
    // Smart Notes and persists them into the existing "notes" table.
    // ─────────────────────────────────────────────────────────────────────────

    currentStage =
      'notes_generation';


    await updateAIJobStatus(
      supabase,
      aiJobId,
      'processing',
      'notes_generation',
      85,
      undefined,
      {

        pipeline:
          'youtube_knowledge_to_notes',

        knowledgeRepresentationId,

        videoId,

        canonicalUrl,

      }
    );


    log.info(
      'YouTubeSourceUnderstandingJob',
      'Starting Smart Notes generation from canonical knowledge',
      {

        'Lecture ID':
          lectureId,

        'Knowledge Representation ID':
          knowledgeRepresentationId,

        'Topics':
          understanding.knowledge.topics.length,

        'Concepts':
          understanding.knowledge.concepts.length,

      }
    );


    const notesResult =
      await generateNotesFromKnowledgeRepresentation({

        supabase,

        lectureId,

        aiJobId,

        knowledge:
          understanding.knowledge,

      });


    noteId =
      notesResult.noteId;


    log.success(
      'YouTubeSourceUnderstandingJob',
      'Smart Notes generated and persisted',
      {

        'Lecture ID':
          lectureId,

        'Note ID':
          noteId,

        'Knowledge Representation ID':
          knowledgeRepresentationId,

      }
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Stage 5 — Complete AI job
    //
    // Only the outer orchestration layer marks the complete YouTube pipeline
    // as finished.
    //
    // At this point BOTH durable outputs exist:
    //
    // 1. knowledge_representations row
    // 2. notes row
    // ─────────────────────────────────────────────────────────────────────────

    currentStage =
      'done';


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
          'youtube_source_understanding_to_smart_notes',

        knowledgeRepresentationId,

        noteId,

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
      'YouTube source understanding and Smart Notes generation completed',
      {

        'Lecture ID':
          lectureId,

        'AI Job ID':
          aiJobId,

        'KR ID':
          knowledgeRepresentationId,

        'Note ID':
          noteId,

        'Duration':
          `${totalProcessingTimeMs}ms`,

      }
    );


  } catch (
    error: unknown
  ) {

    // ─────────────────────────────────────────────────────────────────────────
    // Failure handling
    //
    // A useful property of this architecture:
    //
    // If KR persistence succeeds but Smart Notes generation fails,
    // the persisted KR remains available.
    //
    // We do NOT rerun Gemini source understanding automatically here.
    // A future retry mechanism can regenerate notes directly from the stored KR.
    // ─────────────────────────────────────────────────────────────────────────

    const message =
      error instanceof Error
        ? error.message
        : String(error);


    log.error(
      'YouTubeSourceUnderstandingJob',
      `YouTube pipeline failed at stage: ${currentStage}`,
      error
    );


    /*
     * knowledge.service.ts may already mark the job failed when notes
     * generation itself throws.
     *
     * This outer update is still useful because it records orchestration-level
     * context including the persisted KR ID and exact failed stage.
     */

    await updateAIJobStatus(
      supabase,
      aiJobId,
      'failed',
      currentStage,
      0,
      message,
      {

        pipeline:
          'youtube_source_understanding_to_smart_notes',

        failedStage:
          currentStage,

        knowledgeRepresentationId,

        noteId,

        knowledgePersisted:
          knowledgeRepresentationId !== null,

        notesPersisted:
          noteId !== null,

        failedAt:
          new Date().toISOString(),

        elapsedMs:
          Date.now() - startedAt,

      }
    );


    throw error;

  }

}