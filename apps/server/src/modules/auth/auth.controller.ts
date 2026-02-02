import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema } from '@rental/shared';
import { ZodError } from 'zod';

/**
 * Auth Controller
 * Handles incoming HTTP requests for authentication.
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
      const { user, token } = await AuthService.register(validatedData);

      // 3. Send response
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
          token,
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
      const { user, token } = await AuthService.login(validatedData);

      // 3. Send response
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
          token,
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
        // For security, usually simply "Invalid credentials", but passing message for now
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  },
};
