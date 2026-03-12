import { Router } from 'express';
import { ApartmentController } from './apartment.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Apartments
 *   description: Property management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Apartment:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the apartment
 *         description:
 *           type: string
 *           description: Detailed description
 *         address:
 *           type: string
 *           description: Physical address
 *         price:
 *           type: number
 *           description: Monthly rent price
 *         status:
 *           type: string
 *           enum: [AVAILABLE, RENTED, MAINTENANCE]
 *           default: AVAILABLE
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/apartments:
 *   get:
 *     summary: Get all apartments
 *     tags: [Apartments]
 *     responses:
 *       200:
 *         description: List of all apartments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Apartment'
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), ApartmentController.findAll);

/**
 * @swagger
 * /api/apartments/{id}/profitability:
 *   get:
 *     summary: Get profitability report for an apartment
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The apartment ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Period start date (defaults to 1st of current month)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Period end date (defaults to last day of current month)
 *     responses:
 *       200:
 *         description: Profitability report
 *       404:
 *         description: Apartment not found
 *       400:
 *         description: Invalid date parameters
 */
router.get('/:id/profitability', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), ApartmentController.getProfitability);

/**
 * @swagger
 * /api/apartments/{id}:
 *   get:
 *     summary: Get apartment by ID
 *     tags: [Apartments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The apartment ID
 *     responses:
 *       200:
 *         description: The apartment description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Apartment'
 *       404:
 *         description: Apartment not found
 */
router.get('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), ApartmentController.findOne);

/**
 * @swagger
 * /api/apartments:
 *   post:
 *     summary: Create a new apartment (Protected)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Apartment'
 *     responses:
 *       201:
 *         description: The apartment was created successfully
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), ApartmentController.create);

/**
 * @swagger
 * /api/apartments/{id}:
 *   put:
 *     summary: Update an apartment (Protected)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The apartment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Apartment'
 *     responses:
 *       200:
 *         description: The apartment was updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Apartment not found
 */
router.put('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), ApartmentController.update);

/**
 * @swagger
 * /api/apartments/{id}:
 *   delete:
 *     summary: Delete an apartment (Protected)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The apartment ID
 *     responses:
 *       200:
 *         description: The apartment was deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Apartment not found
 */
router.delete('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), ApartmentController.delete);

export default router;