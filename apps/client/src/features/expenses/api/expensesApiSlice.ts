import { apiSlice } from '@/features/api/apiSlice';
import type { IExpense, ExpenseInput } from '@rental/shared';
import type { ExpenseFilters } from '../types/expense.types';

// ============================================
// Expenses API Slice
// ============================================

/**
 * EXPENSES API SLICE
 * Injects full CRUD endpoints for expense management into the main API slice.
 *
 * FIX: agencyOnly=true is now appended to the query string when requested.
 * agencyOnly and apartmentId are mutually exclusive — agencyOnly takes precedence.
 */
export const expensesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /api/expenses (with optional filters)
    getExpenses: builder.query<IExpense[], ExpenseFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters?.agencyOnly) {
          // agencyOnly supersedes apartmentId filter
          params.append('agencyOnly', 'true');
        } else if (filters?.apartmentId) {
          params.append('apartmentId', filters.apartmentId);
        }

        if (filters?.category) params.append('category', filters.category);

        const qs = params.toString();
        return `/expenses${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Expense' as const, id: _id })),
              { type: 'Expense', id: 'LIST' },
            ]
          : [{ type: 'Expense', id: 'LIST' }],
    }),

    // POST /api/expenses
    createExpense: builder.mutation<IExpense, ExpenseInput>({
      query: (body) => ({
        url: '/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result) => [
        { type: 'Expense', id: 'LIST' },
        ...(result?.apartment?._id
          ? [{ type: 'Profitability' as const, id: result.apartment._id }]
          : []),
        { type: 'Profitability', id: 'LIST' },
      ],
    }),

    // PUT /api/expenses/:id
    updateExpense: builder.mutation<IExpense, { id: string; data: Partial<ExpenseInput & { apartmentId: string | null }> }>({
      query: ({ id, data }) => ({
        url: `/expenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
        ...(result?.apartment?._id
          ? [{ type: 'Profitability' as const, id: result.apartment._id }]
          : []),
        { type: 'Profitability', id: 'LIST' },
      ],
    }),

    // DELETE /api/expenses/:id
    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
        { type: 'Profitability', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApiSlice;
