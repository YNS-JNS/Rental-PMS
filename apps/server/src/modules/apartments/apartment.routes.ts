import { Router } from 'express';
import { ApartmentController } from './apartment.controller';
import { authenticate } from '../../middleware/auth.middleware';

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
router.get('/', ApartmentController.findAll);

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
router.get('/:id', ApartmentController.findOne);

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
router.post('/', authenticate, ApartmentController.create);

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
router.put('/:id', authenticate, ApartmentController.update);

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
router.delete('/:id', authenticate, ApartmentController.delete);

export default router;