import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../middleware/auth.middleware';

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
router.get('/', authenticate, SettingsController.getSettings);

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
router.put('/', authenticate, SettingsController.updateSettings);

export default router;
