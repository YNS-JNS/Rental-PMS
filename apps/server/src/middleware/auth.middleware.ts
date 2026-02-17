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
 * 1. Reads the accessToken from HttpOnly cookies
 * 2. Verifies the token using the secret key
 * 3. Attaches the decoded user to the request object
 * 4. Passes control to the next handler
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};