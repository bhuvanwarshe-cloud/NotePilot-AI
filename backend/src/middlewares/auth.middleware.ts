import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      token?: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, null, 'Authentication required. Missing Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // We decode the token to get the user ID. 
    // Supabase will verify the token's validity during RLS operations via the Supabase client initialized with this token.
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.sub) {
      return sendError(res, null, 'Invalid token format.', 401);
    }
    
    req.user = { id: decoded.sub };
    req.token = token;
    
    next();
  } catch (error) {
    return sendError(res, error, 'Authentication failed', 401);
  }
}
