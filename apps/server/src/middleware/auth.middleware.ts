import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '@rental/shared';

/**
 * Authenticate Middleware
 * Reads the accessToken from HttpOnly cookies and verifies it.
 * On success, attaches decoded payload to req.user.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Authorize Roles Middleware (RBAC)
 * Checks if the authenticated user's role is in the allowed list.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req.user as jwt.JwtPayload)?.role;

    if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
};
