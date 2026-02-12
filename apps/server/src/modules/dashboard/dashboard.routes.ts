import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and KPIs
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics including KPIs, actions, and revenue chart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kpis:
 *                   type: object
 *                   properties:
 *                     totalApartments:
 *                       type: number
 *                     availableApartments:
 *                       type: number
 *                     activeBookings:
 *                       type: number
 *                     monthlyRevenue:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     occupancyRate:
 *                       type: number
 *                 actions:
 *                   type: object
 *                   properties:
 *                     checkInsToday:
 *                       type: array
 *                     checkOutsToday:
 *                       type: array
 *                     pendingPayments:
 *                       type: array
 *                 revenueChart:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       revenue:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, DashboardController.getStats);

export default router;
