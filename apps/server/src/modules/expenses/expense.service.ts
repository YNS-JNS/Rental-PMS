import { Expense, IExpenseDocument } from './expense.model';
import { Apartment } from '../apartments/apartment.model';
import { ExpenseInput, ExpenseTypeValue } from '@rental/shared';

// ============================================
// Domain Error Classes (SRP: one reason to exist each)
// ============================================

/**
 * Thrown when a business rule is violated (e.g. assigning expense to a
 * COMMISSION_BASED apartment, or referencing a non-existent apartment).
 */
export class ExpenseDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpenseDomainError';
  }
}

/**
 * Thrown when an expense ID cannot be found in the database.
 */
export class ExpenseNotFoundError extends Error {
  constructor(id: string) {
    super(`Expense with ID ${id} not found`);
    this.name = 'ExpenseNotFoundError';
  }
}

// ============================================
// Filter Types
// ============================================

export interface ExpenseFilters {
  apartmentId?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  /** When true, returns only agency-wide expenses (expenseType === 'AGENCY'). */
  agencyOnly?: boolean;
}

// ============================================
// Expense Service
// ============================================

/**
 * ExpenseService
 *
 * Handles all business logic for expense CRUD operations.
 *
 * Domain rules enforced:
 *  1. If apartmentId is absent → expense is AGENCY-type (Frais de structure).
 *     No apartment validation is performed.
 *  2. If apartmentId is provided → apartment must exist AND must NOT be
 *     COMMISSION_BASED (third-party owned; agency pays zero direct expenses).
 *  3. On update: converting an expense to AGENCY-type MUST $unset the
 *     `apartment` field to prevent stale ObjectId references in queries.
 */
export class ExpenseService {
  // ──────────────────────────────────────────────────────
  // Private guards (SRP: isolated validation concerns)
  // ──────────────────────────────────────────────────────

  /**
   * Validates that an apartment exists and is eligible to receive expenses.
   * Throws ExpenseDomainError on violation.
   */
  private static async _assertApartmentEligible(apartmentId: string): Promise<void> {
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      throw new ExpenseDomainError(`Apartment with ID ${apartmentId} not found`);
    }
    if (apartment.rentalType === 'COMMISSION_BASED') {
      throw new ExpenseDomainError(
        'Cannot assign direct expenses to a commission-based property. ' +
          'The agency does not pay expenses for third-party owned properties.'
      );
    }
  }

  /**
   * Derives the ExpenseType from the incoming payload.
   * No side-effects — pure discriminator resolution.
   */
  private static _resolveExpenseType(apartmentId?: string | null): ExpenseTypeValue {
    return apartmentId ? 'APARTMENT' : 'AGENCY';
  }

  // ──────────────────────────────────────────────────────
  // Public CRUD Methods
  // ──────────────────────────────────────────────────────

  /**
   * Create a new expense.
   *
   * - apartmentId absent/null → AGENCY expense, no apartment validation.
   * - apartmentId present     → APARTMENT expense, apartment must be eligible.
   */
  static async create(data: ExpenseInput): Promise<IExpenseDocument> {
    const expenseType = this._resolveExpenseType(data.apartmentId);

    if (expenseType === 'APARTMENT') {
      await this._assertApartmentEligible(data.apartmentId!);
    }

    const expense = await Expense.create({
      expenseType,
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
   *
   * Filters: apartmentId, category, startDate, endDate, agencyOnly
   */
  static async findAll(filters: ExpenseFilters = {}): Promise<IExpenseDocument[]> {
    const query: Record<string, unknown> = {};

    if (filters.agencyOnly) {
      // Mutually exclusive with apartmentId filter
      query.expenseType = 'AGENCY';
    } else if (filters.apartmentId) {
      query.apartment = filters.apartmentId;
    }

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
   * Get a single expense by ID.
   */
  static async findById(id: string): Promise<IExpenseDocument | null> {
    return Expense.findById(id).populate('apartment', 'name address rentalType');
  }

  /**
   * Update an expense.
   *
   * Handles four scenarios:
   *  A. APARTMENT → APARTMENT (different apartment): re-validates new apartment.
   *  B. APARTMENT → AGENCY (apartmentId === null): $unsets apartment field.
   *  C. AGENCY → APARTMENT (apartmentId provided): validates new apartment.
   *  D. No change to apartmentId: skips apartment validation entirely.
   */
  static async update(
    id: string,
    data: Partial<ExpenseInput & { apartmentId: string | null }>
  ): Promise<IExpenseDocument | null> {
    const existing = await Expense.findById(id);
    if (!existing) return null;

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, number> = {};

    // ── Resolve apartment changes ──────────────────────────────────────────
    const isChangingApartment = 'apartmentId' in data;

    if (isChangingApartment) {
      const newApartmentId = data.apartmentId ?? null;
      const newExpenseType = this._resolveExpenseType(newApartmentId);

      if (newExpenseType === 'APARTMENT') {
        // Scenarios A and C: validate the new apartment
        await this._assertApartmentEligible(newApartmentId!);
        $set.apartment = newApartmentId;
        $set.expenseType = 'APARTMENT';
      } else {
        // Scenario B: converting to agency expense — remove stale DB reference
        $unset.apartment = 1;
        $set.expenseType = 'AGENCY';
      }
    }

    // ── Map remaining fields ───────────────────────────────────────────────
    if (data.amount !== undefined) $set.amount = data.amount;
    if (data.date !== undefined) $set.date = data.date;
    if (data.category !== undefined) $set.category = data.category;
    if (data.description !== undefined) $set.description = data.description;

    const updateOp: Record<string, unknown> = { $set };
    if (Object.keys($unset).length > 0) updateOp.$unset = $unset;

    return Expense.findByIdAndUpdate(id, updateOp, { new: true }).populate(
      'apartment',
      'name address rentalType'
    );
  }

  /**
   * Delete an expense.
   */
  static async delete(id: string): Promise<IExpenseDocument | null> {
    return Expense.findByIdAndDelete(id);
  }
}
