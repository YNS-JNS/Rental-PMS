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
 *     ExpenseInput:
 *       type: object
 *       required:
 *         - amount
 *         - date
 *         - category
 *       properties:
 *         apartmentId:
 *           type: string
 *           nullable: true
 *           description: |
 *             MongoDB ObjectId of the linked apartment.
 *             Omit or set to null for Agency-Wide Expenses (Frais de structure).
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           description: Expense amount (must be positive)
 *         date:
 *           type: string
 *           format: date
 *           description: Date the expense was incurred
 *         category:
 *           type: string
 *           enum:
 *             - WATER
 *             - ELECTRICITY
 *             - GAS
 *             - INTERNET
 *             - CLEANING
 *             - MAINTENANCE
 *             - RENOVATION
 *             - FURNITURE
 *             - SOFTWARE
 *             - MARKETING
 *             - INSURANCE
 *             - ACCOUNTING
 *             - LEGAL
 *             - OFFICE_SUPPLIES
 *             - SALARIES
 *             - TRAVEL
 *             - EQUIPMENT
 *             - TAXES
 *             - OTHER
 *         description:
 *           type: string
 *           description: Optional free-text description
 *     Expense:
 *       allOf:
 *         - $ref: '#/components/schemas/ExpenseInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *             expenseType:
 *               type: string
 *               enum: [APARTMENT, AGENCY]
 *               description: |
 *                 Derived discriminator set by the server.
 *                 APARTMENT = linked to a specific property.
 *                 AGENCY = agency-wide structural expense (Frais de structure).
 *             apartment:
 *               type: object
 *               nullable: true
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 rentalType:
 *                   type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses (filterable by apartmentId, agencyOnly, category, date range)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentId
 *         schema:
 *           type: string
 *         description: Filter by apartment ID (ignored if agencyOnly=true)
 *       - in: query
 *         name: agencyOnly
 *         schema:
 *           type: boolean
 *         description: If true, return only Agency-Wide expenses
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [WATER, ELECTRICITY, GAS, INTERNET, CLEANING, MAINTENANCE, RENOVATION, FURNITURE, SOFTWARE, MARKETING, INSURANCE, ACCOUNTING, LEGAL, OFFICE_SUPPLIES, SALARIES, TRAVEL, EQUIPMENT, TAXES, OTHER]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
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
 *     description: |
 *       Omit or set apartmentId to null to create an Agency-Wide Expense.
 *       COMMISSION_BASED apartments are rejected with HTTP 400.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseInput'
 *     responses:
 *       201:
 *         description: Expense created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
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
 *     description: |
 *       Pass `apartmentId: null` to convert an expense from APARTMENT-type
 *       to Agency-Wide (AGENCY-type). The apartment reference will be cleared.
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
 *             $ref: '#/components/schemas/ExpenseInput'
 *     responses:
 *       200:
 *         description: Expense updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
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
