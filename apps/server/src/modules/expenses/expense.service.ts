import { Expense, IExpenseDocument } from './expense.model';
import { Apartment } from '../apartments/apartment.model';
import { ExpenseInput } from '@rental/shared';

/**
 * Custom error for domain constraint violations
 */
export class ExpenseDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpenseDomainError';
  }
}

/**
 * Custom error for resource not found
 */
export class ExpenseNotFoundError extends Error {
  constructor(id: string) {
    super(`Expense with ID ${id} not found`);
    this.name = 'ExpenseNotFoundError';
  }
}

/**
 * Expense Service
 * Handles business logic for expense CRUD operations.
 * Enforces domain rule: COMMISSION_BASED apartments cannot have expenses.
 */
export class ExpenseService {
  /**
   * Validate that the apartment exists and is not COMMISSION_BASED.
   * COMMISSION_BASED apartments are third-party owned; the agency pays zero expenses.
   */
  private static async validateApartmentForExpense(apartmentId: string): Promise<void> {
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      throw new ExpenseDomainError(`Apartment with ID ${apartmentId} not found`);
    }
    if (apartment.rentalType === 'COMMISSION_BASED') {
      throw new ExpenseDomainError(
        'Cannot assign expenses to a COMMISSION_BASED apartment. The agency does not pay expenses for third-party owned properties.'
      );
    }
  }

  /**
   * Create a new expense.
   * If linked to an apartment, validates the apartment exists and is eligible.
   */
  static async create(data: ExpenseInput): Promise<IExpenseDocument> {
    if (data.apartmentId) {
      await this.validateApartmentForExpense(data.apartmentId);
    }

    const expense = await Expense.create({
      apartment: data.apartmentId || undefined,
      amount: data.amount,
      date: data.date,
      category: data.category,
      description: data.description,
    });

    return expense;
  }

  /**
   * Get all expenses with optional filtering.
   * Supports: apartmentId, category, startDate, endDate
   */
  static async findAll(filters: {
    apartmentId?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<IExpenseDocument[]> {
    const query: Record<string, unknown> = {};

    if (filters.apartmentId) query.apartment = filters.apartmentId;
    if (filters.category) query.category = filters.category;

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.$gte = filters.startDate;
      if (filters.endDate) dateFilter.$lte = filters.endDate;
      query.date = dateFilter;
    }

    return Expense.find(query)
      .populate('apartment', 'name address rentalType')
      .sort({ date: -1 });
  }

  /**
   * Get a single expense by ID
   */
  static async findById(id: string): Promise<IExpenseDocument | null> {
    return Expense.findById(id)
      .populate('apartment', 'name address rentalType');
  }

  /**
   * Update an expense.
   * Re-validates apartment eligibility if apartmentId is being changed.
   */
  static async update(id: string, data: Partial<ExpenseInput>): Promise<IExpenseDocument | null> {
    const existing = await Expense.findById(id);
    if (!existing) return null;

    // If changing apartment, validate the new apartment
    if (data.apartmentId && data.apartmentId !== existing.apartment?.toString()) {
      await this.validateApartmentForExpense(data.apartmentId);
    }

    const updateData: Record<string, unknown> = {};
    if (data.apartmentId !== undefined) updateData.apartment = data.apartmentId || undefined;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;

    return Expense.findByIdAndUpdate(id, updateData, { new: true })
      .populate('apartment', 'name address rentalType');
  }

  /**
   * Delete an expense
   */
  static async delete(id: string): Promise<IExpenseDocument | null> {
    return Expense.findByIdAndDelete(id);
  }
}
