import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management with anti-double booking logic
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - apartmentId
 *         - tenantId
 *         - startDate
 *         - endDate
 *         - totalPrice
 *         - guestCount
 *       properties:
 *         apartmentId:
 *           type: string
 *           description: ID of the apartment
 *         tenantId:
 *           type: string
 *           description: ID of the tenant
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Booking start date
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Booking end date (must be after startDate)
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *           default: CONFIRMED
 *           description: Booking status
 *         totalPrice:
 *           type: number
 *           description: Total booking price
 *         guestCount:
 *           type: integer
 *           minimum: 1
 *           description: Number of guests
 *         notes:
 *           type: string
 *           description: Additional notes
 */

/**
 * @swagger
 * /api/bookings/availability:
 *   get:
 *     summary: Check apartment availability for date range
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The apartment ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date to check
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date to check
 *     responses:
 *       200:
 *         description: Availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 apartmentId:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                 endDate:
 *                   type: string
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/availability', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), BookingController.checkAvailability);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings with optional filters
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentId
 *         schema:
 *           type: string
 *         description: Filter by apartment ID
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         description: Filter by tenant ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), BookingController.findAll);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID with populated relations
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID
 *     responses:
 *       200:
 *         description: The booking with apartment and tenant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), BookingController.findOne);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Apartment or Tenant not found
 *       409:
 *         description: Apartment not available for selected dates (conflict)
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), BookingController.create);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Apartment not available for new dates (conflict)
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), BookingController.update);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking (soft delete)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), BookingController.delete);

export default router;
