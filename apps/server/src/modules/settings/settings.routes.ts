import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Agency settings management
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get agency settings
 *     tags: [Settings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Returns agency settings
 */
router.get('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), SettingsController.getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update agency settings
 *     tags: [Settings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), SettingsController.updateSettings);

export default router;
