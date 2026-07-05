import { Response } from 'express';

export function sendSuccess(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
  });
}

export function sendError(res: Response, error: any, message: string = 'An error occurred', statusCode: number = 500) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: error instanceof Error ? error.message : error,
  });
}
