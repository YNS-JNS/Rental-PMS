import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '@rental/shared';
import jwt from 'jsonwebtoken';

/**
 * Dashboard Controller
 * Handles HTTP requests for Dashboard statistics.
 */
export class DashboardController {

  /**
   * GET /api/dashboard
   * Returns aggregated dashboard statistics.
   * Financial data is stripped for non-SUPER_ADMIN users.
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await DashboardService.getStats();
      const decoded = req.user as jwt.JwtPayload;

      // Strip financial data for non-SUPER_ADMIN
      if (decoded.role !== UserRole.SUPER_ADMIN) {
        stats.kpis.totalRevenue = 0;
        stats.kpis.monthlyRevenue = 0;
        stats.revenueChart = [];
        stats.actions.pendingPayments = [];
      }

      res.status(StatusCodes.OK).json(stats);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error fetching dashboard statistics',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}

