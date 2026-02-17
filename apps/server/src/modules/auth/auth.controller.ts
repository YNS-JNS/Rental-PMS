import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema } from '@rental/shared';
import { ZodError } from 'zod';
import { setAuthCookies, clearAuthCookies } from './auth.utils';
import jwt from 'jsonwebtoken';

/**
 * Auth Controller
 * Handles incoming HTTP requests for authentication.
 * Tokens are sent via HttpOnly cookies, never in JSON body.
 */
export const AuthController = {
  /**
   * POST /api/auth/register
   */
  register: async (req: Request, res: Response) => {
    try {
      // 1. Validate request body against Zod Schema
      const validatedData = RegisterSchema.parse(req.body);

      // 2. Call business logic
      const { user, accessToken, refreshToken } = await AuthService.register(validatedData);

      // 3. Set HttpOnly cookies
      setAuthCookies(res, accessToken, refreshToken);

      // 4. Send response (NO token in body)
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      // Handle Zod Validation Errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errors: error.errors,
        });
      }

      // Handle Business Logic Errors (e.g., Email already exists)
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Handle Unknown Errors
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  },

  /**
   * POST /api/auth/login
   */
  login: async (req: Request, res: Response) => {
    try {
      // 1. Validate request body
      const validatedData = LoginSchema.parse(req.body);

      // 2. Call business logic
      const { user, accessToken, refreshToken } = await AuthService.login(validatedData);

      // 3. Set HttpOnly cookies
      setAuthCookies(res, accessToken, refreshToken);

      // 4. Send response (NO token in body)
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errors: error.errors,
        });
      }

      if (error instanceof Error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  },

  /**
   * POST /api/auth/refresh
   * Reads the refreshToken from cookies, rotates tokens.
   */
  refresh: async (req: Request, res: Response) => {
    try {
      const currentRefreshToken = req.cookies?.refreshToken;

      if (!currentRefreshToken) {
        return res.status(401).json({
          success: false,
          message: 'No refresh token provided',
        });
      }

      // Rotate tokens
      const { user, accessToken, refreshToken } = await AuthService.refreshTokens(currentRefreshToken);

      // Set new cookies
      setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      // On any failure, clear cookies to force re-login
      clearAuthCookies(res);

      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
  },

  /**
   * POST /api/auth/logout
   * Clears the refresh token from DB and removes cookies.
   */
  logout: async (req: Request, res: Response) => {
    try {
      // Extract user ID from the accessToken (already verified by authenticate middleware)
      const decoded = req.user as jwt.JwtPayload;
      if (decoded?.id) {
        await AuthService.logoutUser(decoded.id);
      }

      // Clear cookies
      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      // Even on error, clear cookies
      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: 'Logged out',
      });
    }
  },

  /**
   * GET /api/auth/me
   * Returns the current user's data (for session rehydration after page refresh).
   * Requires a valid accessToken cookie.
   */
  me: async (req: Request, res: Response) => {
    try {
      const decoded = req.user as jwt.JwtPayload;
      const user = await AuthService.getUserById(decoded.id);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
  },
};
