import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { UpdateSettingsSchema } from '@rental/shared';
import { ZodError } from 'zod';

/**
 * Settings Controller
 */
export const SettingsController = {
  /**
   * GET /api/settings
   */
  getSettings: async (_req: Request, res: Response) => {
    try {
      const settings = await SettingsService.getSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load settings' });
    }
  },

  /**
   * PUT /api/settings
   */
  updateSettings: async (req: Request, res: Response) => {
    try {
      const validatedData = UpdateSettingsSchema.parse(req.body);
      const settings = await SettingsService.updateSettings(validatedData);
      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: settings,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errors: error.errors,
        });
      }
      res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  },
};
