import type { ExpenseCategoryType } from '@rental/shared';

/**
 * Filter parameters accepted by GET /api/expenses
 */
export interface ExpenseFilters {
  apartmentId?: string;
  category?: ExpenseCategoryType;
}
