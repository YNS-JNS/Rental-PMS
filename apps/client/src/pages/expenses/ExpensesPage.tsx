import { useState, useCallback } from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import type { IExpense } from '@rental/shared';
import { useGetExpensesQuery, useDeleteExpenseMutation } from '@/features/expenses/api/expensesApiSlice';
import { useGetApartmentsQuery } from '@/features/apartments/apartmentsApiSlice';
import { ExpenseDataTable } from '@/features/expenses/components/ExpenseDataTable';
import { ExpenseFormDialog } from '@/features/expenses/components/ExpenseFormDialog';
import type { ExpenseFilters } from '@/features/expenses/types/expense.types';
import type { ExpenseCategoryType } from '@rental/shared';

// Shared UI Components
import { PageTitle } from '@/components/common/PageTitle';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

/**
 * ExpensesPage
 *
 * FIX: Filter <Select> components now use `value` (controlled) instead of
 * `defaultValue` (uncontrolled). Using `defaultValue` caused the displayed
 * value to diverge from the `filters` state after the first selection
 * because React treated them as uncontrolled inputs — the DOM value would
 * not update when `filters` state was reset or changed externally.
 */
export default function ExpensesPage() {
  const { toast } = useToast();

  // ─── Filter State ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<ExpenseFilters>({});
  // Mirror filter values in local state to drive controlled Selects
  const [apartmentFilter, setApartmentFilter] = useState<string>('_all');
  const [categoryFilter, setCategoryFilter] = useState<string>('_all');

  // ─── Dialog State ─────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IExpense | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // ─── API ──────────────────────────────────────────────────────────────────
  const { data: expenses, isLoading: isLoadingExpenses, isError } = useGetExpensesQuery(filters);
  const { data: apartments, isLoading: isLoadingApartments } = useGetApartmentsQuery();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditTarget(undefined);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((expense: IExpense) => {
    setEditTarget(expense);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditTarget(undefined);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete).unwrap();
      toast({ title: 'Expense Deleted', description: 'The expense record has been removed.' });
      setExpenseToDelete(null);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete expense.' });
    }
  }, [expenseToDelete, deleteExpense, toast]);

  const handleApartmentFilter = useCallback((value: string) => {
    setApartmentFilter(value);
    setFilters((prev) => ({ ...prev, apartmentId: value === '_all' ? undefined : value }));
  }, []);

  const handleCategoryFilter = useCallback((value: string) => {
    setCategoryFilter(value);
    setFilters((prev) => ({
      ...prev,
      category: value === '_all' ? undefined : (value as ExpenseCategoryType),
    }));
  }, []);

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoadingExpenses || isLoadingApartments) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load expenses. Please try again.
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Expenses" />
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
            <p className="text-muted-foreground">
              Track property running costs ({expenses?.length ?? 0} records)
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Record Expense
          </Button>
        </div>

        {/* ── Filter Bar (fully controlled) ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={apartmentFilter} onValueChange={handleApartmentFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Apartments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Apartments</SelectItem>
              {apartments
                ?.filter((a) => a.rentalType !== 'COMMISSION_BASED')
                .map((apt) => (
                  <SelectItem key={apt._id} value={apt._id}>
                    {apt.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Categories</SelectItem>
              <SelectItem value="WATER">Water</SelectItem>
              <SelectItem value="ELECTRICITY">Electricity</SelectItem>
              <SelectItem value="CLEANING">Cleaning</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Table ── */}
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>
              A detailed log of all property running costs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses?.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No expenses recorded"
                description="Start tracking your property costs by recording your first expense."
                actionLabel="Record Expense"
                onAction={handleOpenCreate}
              />
            ) : (
              <ExpenseDataTable
                expenses={expenses ?? []}
                onEdit={handleOpenEdit}
                onDelete={(id) => setExpenseToDelete(id)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Create / Edit Dialog ── */}
      <ExpenseFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        editTarget={editTarget}
        apartments={apartments ?? []}
      />

      {/* ── Delete Confirmation ── */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirmed}
        loading={isDeleting}
        title="Delete Expense"
        description="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmText="Delete Expense"
        variant="destructive"
      />
    </>
  );
}
