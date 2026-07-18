import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

import { sendSuccess, sendError } from '../utils/response.util';
import { getSupabaseClient } from '../config/supabase';
import { processUpload } from '../services/upload.service';
import { acquireTranscript } from '../acquisition/transcriptAcquisitionEngine';
import { log } from '../utils/logger';


const TEMP_DIR = path.resolve(__dirname, '../../temp');


/**
 * Maps each frontend source type to the processor key stored in ai_jobs.
 *
 * NOTE:
 * These values are currently persisted as job metadata.
 * Actual runtime transcript acquisition is now routed through TAE
 * (TranscriptAcquisitionEngine).
 */
const processorMap: Record<string, string> = {
  audio:       'audioProcessor',
  video:       'videoProcessor',
  pdf:         'pdfProcessor',
  textbook:    'ocrProcessor',
  handwritten: 'ocrProcessor',
  youtube:     'youtubeProcessor',
  text:        'textProcessor',
};


/**
 * Describes how each source enters the backend.
 */
const inputTypeMap: Record<string, string> = {
  audio:       'file',
  video:       'file',
  pdf:         'file',
  textbook:    'file',
  handwritten: 'file',
  youtube:     'url',
  text:        'text',
};


export async function uploadLecture(req: Request, res: Response) {
  try {

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Authenticate user
    // ─────────────────────────────────────────────────────────────────────────

    const userId = req.user?.id;

    if (!userId) {
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

    const { source, title, url, text } = req.body;

    let file: Express.Multer.File | undefined;

    if (req.file) {
      file = req.file;

    } else if (
      req.files &&
      Array.isArray(req.files) &&
      req.files.length > 0
    ) {
      file = req.files[0];
    }


    // ─────────────────────────────────────────────────────────────────────────
    // 3. Log incoming request
    // ─────────────────────────────────────────────────────────────────────────

    log.banner('Upload Request Received', {
      'User ID': userId,

      'Source':
        source ?? '(none)',

      'Title':
        title ?? '(none)',

      'URL':
        url ?? '(none)',

      'Text len':
        text
          ? `${(text as string).length} chars`
          : '(none)',

      'File':
        file
          ? `${file.originalname} (${(file.size / 1024).toFixed(1)} KB, ${file.mimetype})`
          : '(none)',
    });


    // ─────────────────────────────────────────────────────────────────────────
    // 4. Resolve processor metadata
    // ─────────────────────────────────────────────────────────────────────────

    const processorKey =
      processorMap[source as string] || 'unknown';

    const inputType =
      inputTypeMap[source as string] || 'unknown';


    // ─────────────────────────────────────────────────────────────────────────
    // 5. Create authenticated Supabase client
    // ─────────────────────────────────────────────────────────────────────────

    const supabase = getSupabaseClient(req.token);


    // ─────────────────────────────────────────────────────────────────────────
    // 6. Register upload
    //
    // processUpload is responsible for:
    //
    // - Storage upload
    // - Lecture creation
    // - Lecture file creation
    // - AI job creation
    //
    // It does NOT perform transcript acquisition.
    // ─────────────────────────────────────────────────────────────────────────

    log.info(
      'UploadController',
      'Creating lecture & AI job rows via upload transaction'
    );

    const result = await processUpload(
      supabase,
      userId,
      title as string,
      source as string,
      processorKey,
      inputType,
      file,
      text as string | undefined,
      url as string | undefined
    );


    log.success(
      'UploadController',
      'Lecture and AI Job created',
      {
        'Lecture ID': result.lectureId,
        'AI Job ID': result.aiJobId,
        'Source': result.source,
      }
    );


    // ─────────────────────────────────────────────────────────────────────────
    // 7. Start Transcript Acquisition Engine (TAE)
    //
    // The controller no longer directly calls source-specific processors.
    //
    // Instead:
    //
    // Controller
    //      ↓
    // TranscriptAcquisitionEngine
    //      ↓
    // Source-specific processor
    //
    // This allows future sources such as:
    //
    // video
    // PDF
    // text
    // OCR
    //
    // to be added without coupling the controller directly to their processors.
    // ─────────────────────────────────────────────────────────────────────────


    // ── YouTube Acquisition ──────────────────────────────────────────────────

    if (source === 'youtube' && url) {

      log.info(
        'UploadController',
        'Starting transcript acquisition for YouTube source'
      );

      acquireTranscript({
        source: 'youtube',

        url: url as string,

        lectureId: result.lectureId,
        aiJobId: result.aiJobId,

        supabase,
      }).catch((err) => {

        /*
         * Safety net.
         *
         * The processor itself handles normal acquisition failures
         * and updates ai_jobs / lecture status.
         *
         * This catch protects against unexpected unhandled errors.
         */

        log.error(
          'UploadController',
          'Unhandled transcript acquisition error (YouTube)',
          err
        );

      });
    }


    // ── Audio Acquisition ────────────────────────────────────────────────────

    if (source === 'audio' && file) {

      log.info(
        'UploadController',
        'Preparing audio for transcript acquisition'
      );


      /*
       * Multer currently uses memory storage.
       *
       * The audio processor expects a physical file path because
       * Groq transcription uses fs.createReadStream().
       *
       * Therefore the uploaded buffer must temporarily be written
       * to disk before TAE starts the audio acquisition pipeline.
       *
       * We will move this preparation responsibility out of the
       * controller in a later TAE refactor.
       */

      const tempFileName =
        `${result.lectureId}-${file.originalname}`;

      const tempFilePath =
        path.join(TEMP_DIR, tempFileName);


      // Ensure temp directory exists

      if (!fs.existsSync(TEMP_DIR)) {

        fs.mkdirSync(
          TEMP_DIR,
          { recursive: true }
        );

      }


      // Write Multer memory buffer to temporary file

      fs.writeFileSync(
        tempFilePath,
        file.buffer
      );


      log.info(
        'UploadController',
        'Audio buffer written to temp',
        {
          'Path': tempFilePath,
        }
      );


      // Start TAE

      acquireTranscript({
        source: 'audio',

        filePath: tempFilePath,
        fileName: file.originalname,
        mimeType: file.mimetype,

        lectureId: result.lectureId,
        aiJobId: result.aiJobId,

        supabase,

      }).catch((err) => {

        log.error(
          'UploadController',
          'Unhandled transcript acquisition error (Audio)',
          err
        );

      });

    }


    // ─────────────────────────────────────────────────────────────────────────
    // 8. Return immediately
    //
    // Transcript acquisition runs asynchronously in the background.
    //
    // The frontend receives the lecture + AI job IDs immediately and can
    // observe processing progress through the existing job/status system.
    // ─────────────────────────────────────────────────────────────────────────

    log.success(
      'UploadController',
      'Returning 201 to client — transcript acquisition started'
    );


    return sendSuccess(
      res,
      result,
      'Upload processed successfully',
      201
    );


  } catch (error) {

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