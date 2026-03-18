import { Request, Response } from 'express';
import { ExpenseService, ExpenseDomainError, ExpenseFilters } from './expense.service';

/**
 * Expense Controller
 * HTTP transport layer only — delegates all business logic to ExpenseService.
 * Maps domain errors to appropriate HTTP status codes.
 */
export class ExpenseController {
  /**
   * POST /api/expenses
   * @swagger
   * /api/expenses:
   *   post:
   *     summary: Create a new expense (Protected)
   *     description: |
   *       Creates an expense. If `apartmentId` is omitted, the expense is
   *       treated as an Agency-Wide Expense (Frais de structure) and
   *       `expenseType` will be set to `AGENCY` automatically.
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
   *       400:
   *         description: Validation or domain error
   */
  static async create(req: Request, res: Response) {
    try {
      const expense = await ExpenseService.create(req.body);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof ExpenseDomainError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error creating expense', error });
    }
  }

  /**
   * GET /api/expenses
   * Query params: apartmentId, category, startDate, endDate, agencyOnly
   * @swagger
   * /api/expenses:
   *   get:
   *     summary: Get all expenses (filterable)
   *     description: |
   *       Returns all expenses. Use `agencyOnly=true` to return only
   *       Agency-Wide Expenses (Frais de structure).
   *       Note: `agencyOnly` and `apartmentId` are mutually exclusive.
   *     tags: [Expenses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: apartmentId
   *         schema:
   *           type: string
   *         description: Filter by apartment (ignored when agencyOnly=true)
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
   */
  static async findAll(req: Request, res: Response) {
    try {
      const { apartmentId, category, startDate, endDate, agencyOnly } = req.query;

      const filters: ExpenseFilters = {};

      if (agencyOnly === 'true') {
        filters.agencyOnly = true;
      } else if (apartmentId) {
        filters.apartmentId = apartmentId as string;
      }

      if (category) filters.category = category as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const expenses = await ExpenseService.findAll(filters);
      res.status(200).json(expenses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching expenses', error });
    }
  }

  /**
   * GET /api/expenses/:id
   */
  static async findOne(req: Request, res: Response) {
    try {
      const expense = await ExpenseService.findById(req.params.id);
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      res.status(200).json(expense);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching expense', error });
    }
  }

  /**
   * PUT /api/expenses/:id
   * Pass `apartmentId: null` to convert an expense to an Agency Expense.
   */
  static async update(req: Request, res: Response) {
    try {
      const expense = await ExpenseService.update(req.params.id, req.body);
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      res.status(200).json(expense);
    } catch (error) {
      if (error instanceof ExpenseDomainError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error updating expense', error });
    }
  }

  /**
   * DELETE /api/expenses/:id
   */
  static async delete(req: Request, res: Response) {
    try {
      const expense = await ExpenseService.delete(req.params.id);
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting expense', error });
    }
  }
}
