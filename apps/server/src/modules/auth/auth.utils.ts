import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';

// ============================================
// Token Generation
// ============================================

/**
 * Generates a short-lived Access Token (15 minutes).
 * Used for authenticating API requests via HttpOnly cookie.
 */
export const generateAccessToken = (userId: string, role: string): string => {
  const payload = { id: userId, role };
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

/**
 * Generates a long-lived Refresh Token (7 days).
 * Used only for obtaining new access tokens.
 * Stored hashed in the database for revocation capability.
 */
export const generateRefreshToken = (userId: string): string => {
  const payload = { id: userId };
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, options);
};

/**
 * Verifies a Refresh Token and returns the decoded payload.
 * Throws if the token is invalid or expired.
 */
export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
};

// ============================================
// Refresh Token Hashing (for DB storage)
// ============================================

/**
 * Hashes a refresh token before storing in the database.
 * Even if the DB is compromised, the raw token cannot be extracted.
 */
export const hashRefreshToken = async (token: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

/**
 * Compares a raw refresh token against a hashed one from the database.
 */
export const compareRefreshToken = async (token: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(token, hash);
};

// ============================================
// Cookie Helpers
// ============================================

const isProduction = env.NODE_ENV === 'production';

/**
 * Sets both accessToken and refreshToken as HttpOnly cookies.
 * - httpOnly: prevents JavaScript access (XSS protection)
 * - secure: HTTPS only in production
 * - sameSite: 'strict' prevents CSRF
 */
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

/**
 * Clears both auth cookies from the client.
 */
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/' });
};
