import { Router } from 'express';
import { FinanceController } from './finance.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management (manual recording)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - bookingId
 *         - amount
 *         - method
 *       properties:
 *         bookingId:
 *           type: string
 *           description: ID of the associated booking
 *         amount:
 *           type: number
 *           description: Payment amount
 *         date:
 *           type: string
 *           format: date-time
 *           description: Payment date (defaults to now)
 *         method:
 *           type: string
 *           enum: [CASH, BANK_TRANSFER, CHECK, OTHER]
 *           description: Payment method
 *         reference:
 *           type: string
 *           description: Check number, transaction ID, etc.
 *         notes:
 *           type: string
 *           description: Additional notes
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Record a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment recorded, booking status updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), FinanceController.create);

/**
 * @swagger
 * /api/payments/booking/{bookingId}:
 *   get:
 *     summary: Get all payments for a booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID
 *     responses:
 *       200:
 *         description: List of payments
 *       401:
 *         description: Unauthorized
 */
router.get('/booking/:bookingId', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), FinanceController.findByBooking);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get a single payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), FinanceController.findOne);

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     summary: Delete a payment (recalculates booking status)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The payment ID
 *     responses:
 *       200:
 *         description: Payment deleted, booking status recalculated
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), FinanceController.delete);

export default router;
