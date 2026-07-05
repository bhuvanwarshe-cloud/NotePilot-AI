import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { sendSuccess, sendError } from '../utils/response.util';
import { getSupabaseClient } from '../config/supabase';
import { processUpload } from '../services/upload.service';
import { runYouTubeProcessor } from '../processors/youtube/youtubeProcessor';
import { runAudioProcessor } from '../processors/audio/audioProcessor';
import { log } from '../utils/logger';


const TEMP_DIR = path.resolve(__dirname, '../../temp');

const processorMap: Record<string, string> = {
  audio:       'audioProcessor',
  video:       'videoProcessor',
  pdf:         'pdfProcessor',
  textbook:    'ocrProcessor',
  handwritten: 'ocrProcessor',
  youtube:     'youtubeProcessor',
  text:        'textProcessor',
};

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
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, null, 'User ID not found in request', 401);
    }

    const { source, title, url, text } = req.body;

    let file: Express.Multer.File | undefined;
    if (req.file) {
      file = req.file;
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      file = req.files[0];
    }

    // ── Log incoming request ──────────────────────────────────────────────────
    log.banner('Upload Request Received', {
      'User ID':  userId,
      'Source':   source   ?? '(none)',
      'Title':    title    ?? '(none)',
      'URL':      url      ?? '(none)',
      'Text len': text     ? `${(text as string).length} chars` : '(none)',
      'File':     file     ? `${file.originalname} (${(file.size / 1024).toFixed(1)} KB, ${file.mimetype})` : '(none)',
    });

    const processorKey = processorMap[source as string] || 'unknown';
    const inputType    = inputTypeMap[source as string] || 'unknown';

    const supabase = getSupabaseClient(req.token);

    log.info('UploadController', 'Creating lecture & AI job rows via upload transaction');

    const result = await processUpload(
      supabase,
      userId,
      title    as string,
      source   as string,
      processorKey,
      inputType,
      file,
      text as string | undefined,
      url  as string | undefined
    );

    log.success('UploadController', 'Lecture and AI Job created', {
      'Lecture ID': result.lectureId,
      'AI Job ID':  result.aiJobId,
      'Source':     result.source,
    });

    // ── Fire background processor ─────────────────────────────────────────────

    if (source === 'youtube' && url) {
      log.info('UploadController', 'Firing YouTube processor in background (fire-and-forget)');
      runYouTubeProcessor({
        url:       url as string,
        lectureId: result.lectureId,
        aiJobId:   result.aiJobId,
        supabase,
      }).catch((err) => {
        log.error('UploadController', 'Unhandled YouTube processor error (safety net)', err);
      });
    }

    if (source === 'audio' && file) {
      log.info('UploadController', 'Firing Audio processor in background (fire-and-forget)');

      // Multer uses memory storage — write the buffer to temp/ so the processor
      // can pass it to fs.createReadStream() for the Groq API.
      const tempFileName = `${result.lectureId}-${file.originalname}`;
      const tempFilePath = path.join(TEMP_DIR, tempFileName);

      if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
      }
      fs.writeFileSync(tempFilePath, file.buffer);
      log.info('UploadController', 'Audio buffer written to temp', { 'Path': tempFilePath });

      runAudioProcessor({
        filePath:  tempFilePath,
        fileName:  file.originalname,
        mimeType:  file.mimetype,
        lectureId: result.lectureId,
        aiJobId:   result.aiJobId,
        supabase,
      }).catch((err) => {
        log.error('UploadController', 'Unhandled Audio processor error (safety net)', err);
      });
    }

    log.success('UploadController', 'Returning 201 to client — background processing started');
    return sendSuccess(res, result, 'Upload processed successfully', 201);

  } catch (error) {
    log.error('UploadController', 'Request handler threw unexpectedly', error);
    return sendError(res, error, 'Failed to process upload');
  }
}
