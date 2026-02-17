import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and account management
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile (name, email)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', authenticate, UserController.updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password (requires current password)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Password changed. Session revoked.
 *       401:
 *         description: Current password is incorrect
 */
router.put('/change-password', authenticate, UserController.changePassword);

export default router;
