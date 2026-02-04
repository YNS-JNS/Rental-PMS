import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * TYPE DECLARATION MERGING
 * We extend the standard Express Request interface globally
 * to include the 'user' property. This prevents TypeScript errors
 * when accessing req.user in controllers.
 */
declare global {
  namespace Express {
    interface Request {
      user?: string | jwt.JwtPayload;
    }
  }
}

/**
 * AUTHENTICATION MIDDLEWARE
 * 1. Checks for Authorization header (Bearer <token>)
 * 2. Verifies the token using the secret key
 * 3. Attaches the decoded user to the request object
 * 4. Passes control to the next handler
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    // 3. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 4. Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};