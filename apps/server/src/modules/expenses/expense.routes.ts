import { Router } from 'express';
import { ExpenseController } from './expense.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - amount
 *         - date
 *         - category
 *       properties:
 *         apartmentId:
 *           type: string
 *           description: MongoDB ObjectId of the linked apartment (optional for agency-wide expenses)
 *         amount:
 *           type: number
 *           description: Expense amount (positive)
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the expense
 *         category:
 *           type: string
 *           enum: [WATER, ELECTRICITY, CLEANING, MAINTENANCE, OTHER]
 *         description:
 *           type: string
 *           description: Optional description of the expense
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses (filterable by apartmentId, category, date range)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [WATER, ELECTRICITY, CLEANING, MAINTENANCE, OTHER]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ExpenseController.findAll
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense details
 *       404:
 *         description: Expense not found
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ExpenseController.findOne
);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense (Protected)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: Expense created
 *       400:
 *         description: Validation or domain error
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ExpenseController.create
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense (Protected)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated
 *       400:
 *         description: Domain error
 *       404:
 *         description: Expense not found
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ExpenseController.update
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense (Protected)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense deleted
 *       404:
 *         description: Expense not found
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ExpenseController.delete
);

export default router;
