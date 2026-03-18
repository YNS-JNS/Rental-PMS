import type { ExpenseCategoryType } from '@rental/shared';

/**
 * Filter parameters accepted by GET /api/expenses.
 * agencyOnly and apartmentId are mutually exclusive.
 */
export interface ExpenseFilters {
  apartmentId?: string;
  category?: ExpenseCategoryType;
  /** When true, fetches only Agency-Wide expenses (expenseType === 'AGENCY'). */
  agencyOnly?: boolean;
}
