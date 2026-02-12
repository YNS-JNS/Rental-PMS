import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { StatusCodes } from 'http-status-codes';

/**
 * Dashboard Controller
 * Handles HTTP requests for Dashboard statistics.
 */
export class DashboardController {

  /**
   * GET /api/dashboard
   * Returns aggregated dashboard statistics
   */
  static async getStats(_req: Request, res: Response) {
    try {
      const stats = await DashboardService.getStats();
      res.status(StatusCodes.OK).json(stats);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error fetching dashboard statistics',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}
