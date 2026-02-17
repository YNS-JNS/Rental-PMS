import { Request, Response } from 'express';
import { User } from './user.model';
import { UpdateProfileSchema } from '@rental/shared';
import { clearAuthCookies } from './auth.utils';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

/**
 * User Controller
 * Handles profile updates and password changes.
 */
export const UserController = {
  /**
   * PUT /api/users/profile
   * Update the current user's name and email.
   */
  updateProfile: async (req: Request, res: Response) => {
    try {
      const decoded = req.user as jwt.JwtPayload;
      const validatedData = UpdateProfileSchema.parse(req.body);

      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: validatedData.email, _id: { $ne: decoded.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another account',
        });
      }

      const user = await User.findByIdAndUpdate(
        decoded.id,
        { name: validatedData.name, email: validatedData.email },
        { new: true, runValidators: true },
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
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
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  },

  /**
   * PUT /api/users/change-password
   * Verify current password, hash new one, revoke session.
   */
  changePassword: async (req: Request, res: Response) => {
    try {
      const decoded = req.user as jwt.JwtPayload;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters',
        });
      }

      // 1. Find user with password field
      const user = await User.findById(decoded.id).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // 2. Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // 3. Update password (pre-save hook handles hashing)
      user.password = newPassword;

      // 4. Revoke refresh token (force re-login)
      user.refreshToken = undefined;
      await user.save();

      // 5. Clear auth cookies
      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  },
};
