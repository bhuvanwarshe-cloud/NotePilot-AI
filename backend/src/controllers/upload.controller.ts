import {
  Request,
  Response,
} from 'express';

import path from 'path';

import fs from 'fs';


import {
  sendSuccess,
  sendError,
} from '../utils/response.util';

import {
  getSupabaseClient,
} from '../config/supabase';

import {
  processUpload,
} from '../services/upload.service';

import {
  acquireTranscript,
} from '../acquisition/transcriptAcquisitionEngine';

import {
  runYouTubeSourceUnderstandingJob,
} from '../services/sourceUnderstanding/youtubeSourceUnderstanding.job';

import {
  log,
} from '../utils/logger';


// ─────────────────────────────────────────────────────────────────────────────
// Temp Directory
// ─────────────────────────────────────────────────────────────────────────────

const TEMP_DIR =
  path.resolve(
    __dirname,
    '../../temp'
  );


// ─────────────────────────────────────────────────────────────────────────────
// Processor Metadata
//
// These values are currently persisted into ai_jobs metadata.
//
// IMPORTANT:
//
// "youtubeProcessor" here is historical metadata only.
//
// YouTube runtime execution no longer goes through the legacy
// transcript-first youtubeProcessor.
//
// YouTube now uses:
//
// SourceUnderstandingService
//      ↓
// GeminiYouTubeProvider
//      ↓
// Canonical KnowledgeRepresentation
//
// We can rename this metadata key later without mixing that migration into
// the production pipeline switch.
// ─────────────────────────────────────────────────────────────────────────────

const processorMap:
  Record<string, string> =
{

  audio:
    'audioProcessor',

  video:
    'videoProcessor',

  pdf:
    'pdfProcessor',

  textbook:
    'ocrProcessor',

  handwritten:
    'ocrProcessor',

  youtube:
    'youtubeProcessor',

  text:
    'textProcessor',

};


// ─────────────────────────────────────────────────────────────────────────────
// Input Types
// ─────────────────────────────────────────────────────────────────────────────

const inputTypeMap:
  Record<string, string> =
{

  audio:
    'file',

  video:
    'file',

  pdf:
    'file',

  textbook:
    'file',

  handwritten:
    'file',

  youtube:
    'url',

  text:
    'text',

};


// ─────────────────────────────────────────────────────────────────────────────
// Upload Controller
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadLecture(
  req: Request,
  res: Response
) {

  try {

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Authenticate user
    // ─────────────────────────────────────────────────────────────────────────

    const userId =
      req.user?.id;


    if (
      !userId
    ) {

      return sendError(
        res,
        null,
        'User ID not found in request',
        401
      );

    }


    // ─────────────────────────────────────────────────────────────────────────
    // 2. Extract request input
    // ─────────────────────────────────────────────────────────────────────────

    const {

      source,

      title,

      url,

      text,

    } =
      req.body;


    let file:
      Express.Multer.File |
      undefined;


    if (
      req.file
    ) {

      file =
        req.file;

    } else if (

      req.files &&

      Array.isArray(
        req.files
      ) &&

      req.files.length >
        0

    ) {

      file =
        req.files[0];

    }


    // ─────────────────────────────────────────────────────────────────────────
    // 3. Log incoming request
    // ─────────────────────────────────────────────────────────────────────────

    log.banner(
      'Upload Request Received',
      {

        'User ID':
          userId,

        'Source':
          source ??
          '(none)',

        'Title':
          title ??
          '(none)',

        'URL':
          url ??
          '(none)',

        'Text len':
          text
            ? `${(text as string).length} chars`
            : '(none)',

        'File':
          file
            ? `${file.originalname} (${(file.size / 1024).toFixed(1)} KB, ${file.mimetype})`
            : '(none)',

      }
    );


    // ─────────────────────────────────────────────────────────────────────────
    // 4. Resolve processor metadata
    // ─────────────────────────────────────────────────────────────────────────

    const processorKey =
      processorMap[
        source as string
      ] ||
      'unknown';


    const inputType =
      inputTypeMap[
        source as string
      ] ||
      'unknown';


    // ─────────────────────────────────────────────────────────────────────────
    // 5. Create authenticated Supabase client
    //
    // This client carries the logged-in user's JWT.
    //
    // Therefore downstream persistence obeys RLS:
    //
    // auth.uid() = user_id
    // ─────────────────────────────────────────────────────────────────────────

    const supabase =
      getSupabaseClient(
        req.token
      );


    // ─────────────────────────────────────────────────────────────────────────
    // 6. Register upload
    //
    // processUpload:
    //
    // - uploads file when applicable
    // - creates lecture
    // - creates lecture_file
    // - creates ai_job
    //
    // It does NOT perform source processing.
    // ─────────────────────────────────────────────────────────────────────────

    log.info(
      'UploadController',
      'Creating lecture & AI job rows via upload transaction'
    );


    const result =
      await processUpload(

        supabase,

        userId,

        title as string,

        source as string,

        processorKey,

        inputType,

        file,

        text as
          string |
          undefined,

        url as
          string |
          undefined

      );


    log.success(
      'UploadController',
      'Lecture and AI Job created',
      {

        'Lecture ID':
          result.lectureId,

        'AI Job ID':
          result.aiJobId,

        'Source':
          result.source,

      }
    );


    // ─────────────────────────────────────────────────────────────────────────
    // 7A. YouTube — Direct Source Understanding
    //
    // IMPORTANT ARCHITECTURAL CHANGE:
    //
    // YouTube no longer enters TranscriptAcquisitionEngine.
    //
    // OLD:
    //
    // YouTube
    //   ↓
    // TAE
    //   ↓
    // captions
    //   ↓
    // yt-dlp
    //   ↓
    // Whisper
    //
    //
    // NEW:
    //
    // YouTube
    //   ↓
    // Source Understanding
    //   ↓
    // Gemini multimodal
    //   ↓
    // Canonical KnowledgeRepresentation
    //   ↓
    // persistence
    //
    // No transcript is required for this path.
    // ─────────────────────────────────────────────────────────────────────────

    if (

      source ===
        'youtube' &&

      url

    ) {

      log.info(
        'UploadController',
        'Starting direct source understanding for YouTube'
      );


      runYouTubeSourceUnderstandingJob({

        url:
          url as string,

        lectureId:
          result.lectureId,

        aiJobId:
          result.aiJobId,

        userId,

        supabase,

      }).catch(
        (
          err
        ) => {

          /*
           * Safety net only.
           *
           * The production job already:
           *
           * - catches normal failures
           * - logs them
           * - marks ai_job failed
           *
           * This prevents an unhandled promise rejection.
           */

          log.error(
            'UploadController',
            'Unhandled YouTube source understanding error',
            err
          );

        }
      );

    }


    // ─────────────────────────────────────────────────────────────────────────
    // 7B. Audio — Transcript Acquisition Engine
    //
    // Audio architecture remains unchanged.
    //
    // Audio
    //    ↓
    // TAE
    //    ↓
    // audioProcessor
    //    ↓
    // transcription
    //
    // We intentionally do NOT modify the working audio pipeline in Phase 3.3.
    // ─────────────────────────────────────────────────────────────────────────

    if (

      source ===
        'audio' &&

      file

    ) {

      log.info(
        'UploadController',
        'Preparing audio for transcript acquisition'
      );


      /*
       * Multer currently uses memory storage.
       *
       * The audio processor expects a physical path because the transcription
       * provider uses fs.createReadStream().
       */

      const tempFileName =
        `${result.lectureId}-${file.originalname}`;


      const tempFilePath =
        path.join(
          TEMP_DIR,
          tempFileName
        );


      // Ensure temp directory exists.

      if (
        !fs.existsSync(
          TEMP_DIR
        )
      ) {

        fs.mkdirSync(
          TEMP_DIR,
          {

            recursive:
              true,

          }
        );

      }


      // Write Multer memory buffer to temporary file.

      fs.writeFileSync(
        tempFilePath,
        file.buffer
      );


      log.info(
        'UploadController',
        'Audio buffer written to temp',
        {

          'Path':
            tempFilePath,

        }
      );


      // Start Transcript Acquisition Engine.

      acquireTranscript({

        source:
          'audio',

        filePath:
          tempFilePath,

        fileName:
          file.originalname,

        mimeType:
          file.mimetype,

        lectureId:
          result.lectureId,

        aiJobId:
          result.aiJobId,

        supabase,

      }).catch(
        (
          err
        ) => {

          log.error(
            'UploadController',
            'Unhandled transcript acquisition error (Audio)',
            err
          );

        }
      );

    }


    // ─────────────────────────────────────────────────────────────────────────
    // 8. Return immediately
    //
    // Both processing architectures are asynchronous:
    //
    // YouTube → Source Understanding
    // Audio   → Transcript Acquisition
    //
    // The frontend receives lectureId + aiJobId immediately.
    // ─────────────────────────────────────────────────────────────────────────

    const processingMode =
      source === 'youtube'
        ? 'source understanding'
        : 'transcript acquisition';


    log.success(
      'UploadController',
      `Returning 201 to client — ${processingMode} started`
    );


    return sendSuccess(
      res,
      result,
      'Upload processed successfully',
      201
    );


  } catch (
    error
  ) {

    // ─────────────────────────────────────────────────────────────────────────
    // Request-level failure
    // ─────────────────────────────────────────────────────────────────────────

    log.error(
      'UploadController',
      'Request handler threw unexpectedly',
      error
    );


    return sendError(
      res,
      error,
      'Failed to process upload'
    );

  }

}