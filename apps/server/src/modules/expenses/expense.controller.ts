import { Request, Response } from 'express';
import { ExpenseService, ExpenseDomainError } from './expense.service';

/**
 * Expense Controller
 * HTTP layer — delegates all business logic to ExpenseService.
 * Maps domain errors to appropriate HTTP status codes.
 */
export class ExpenseController {
  /**
   * POST /api/expenses
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
   * Query params: apartmentId, category, startDate, endDate
   */
  static async findAll(req: Request, res: Response) {
    try {
      const { apartmentId, category, startDate, endDate } = req.query;

      const filters: {
        apartmentId?: string;
        category?: string;
        startDate?: Date;
        endDate?: Date;
      } = {};

      if (apartmentId) filters.apartmentId = apartmentId as string;
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
