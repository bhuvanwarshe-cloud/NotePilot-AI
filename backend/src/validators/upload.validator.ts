import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

const VALID_SOURCES = ['audio', 'video', 'youtube', 'pdf', 'textbook', 'handwritten', 'text'];

export function validateUpload(req: Request, res: Response, next: NextFunction) {
  const source = req.body.source;
  const title = req.body.title;
  
  if (!source || !VALID_SOURCES.includes(source)) {
    return sendError(res, null, `Invalid or missing source. Must be one of: ${VALID_SOURCES.join(', ')}`, 400);
  }

  if (!title || typeof title !== 'string') {
    return sendError(res, null, 'Title is required and must be a string', 400);
  }
  
  // Specific checks based on source
  if (['audio', 'video', 'pdf', 'textbook', 'handwritten'].includes(source)) {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return sendError(res, null, `A file is required for source type: ${source}`, 400);
    }
  }
  
  if (source === 'youtube') {
    if (!req.body.url || typeof req.body.url !== 'string') {
      return sendError(res, null, 'YouTube URL is required', 400);
    }
  }
  
  if (source === 'text') {
    if (!req.body.text || typeof req.body.text !== 'string') {
      return sendError(res, null, 'Text content is required', 400);
    }
  }

  next();
}
