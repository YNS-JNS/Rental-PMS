import { useState, useCallback } from 'react';
import { Building2, Filter, Plus, ReceiptText } from 'lucide-react';
import type { IExpense, ExpenseCategoryType } from '@rental/shared';
import { useGetExpensesQuery, useDeleteExpenseMutation } from '@/features/expenses/api/expensesApiSlice';
import { useGetApartmentsQuery } from '@/features/apartments/apartmentsApiSlice';
import { ExpenseDataTable } from '@/features/expenses/components/ExpenseDataTable';
import { ExpenseFormDialog } from '@/features/expenses/components/ExpenseFormDialog';
import type { ExpenseFilters } from '@/features/expenses/types/expense.types';

// Shared UI Components
import { PageTitle } from '@/components/common/PageTitle';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// ─── Category filter options (all 19, grouped) ────────────────────────────

interface CategoryOption { value: ExpenseCategoryType; label: string }

const ALL_CATEGORY_OPTIONS: CategoryOption[] = [
  // Apartment-specific
  { value: 'WATER', label: 'Water' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'GAS', label: 'Gas' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RENOVATION', label: 'Renovation' },
  { value: 'FURNITURE', label: 'Furniture' },
  // Agency-wide
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { value: 'SALARIES', label: 'Salaries' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'TAXES', label: 'Taxes' },
  // Catch-all
  { value: 'OTHER', label: 'Other' },
];

// ─── Page ─────────────────────────────────────────────────────────────────

/**
 * ExpensesPage
 *
 * Smart container: owns all filter state and delegates rendering to child
 * components. `agencyOnly` and `apartmentId` are mutually exclusive — when
 * the agency toggle is ON, the apartment filter is disabled.
 */
export default function ExpensesPage() {
  const { toast } = useToast();

  // ── Filter State ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [apartmentFilter, setApartmentFilter] = useState<string>('_all');
  const [categoryFilter, setCategoryFilter] = useState<string>('_all');
  const [agencyOnly, setAgencyOnly] = useState(false);

  // ── Dialog State ──────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IExpense | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // ── API ───────────────────────────────────────────────────────────────────
  const { data: expenses, isLoading: isLoadingExpenses, isError } = useGetExpensesQuery(filters);
  const { data: apartments, isLoading: isLoadingApartments } = useGetApartmentsQuery();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      toast({ title: 'Expense deleted', description: 'The record has been deleted.' });
      setExpenseToDelete(null);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete expense.' });
    }
  }, [expenseToDelete, deleteExpense, toast]);

  /** Toggle agencyOnly — clears apartment filter when activated (mutually exclusive). */
  const handleAgencyToggle = useCallback(() => {
    setAgencyOnly((prev) => {
      const next = !prev;
      if (next) {
        // Activating agency-only: clear apartment filter
        setApartmentFilter('_all');
        setFilters((f) => ({ ...f, apartmentId: undefined, agencyOnly: true }));
      } else {
        setFilters((f) => ({ ...f, agencyOnly: false }));
      }
      return next;
    });
  }, []);

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

  // ── Loading State ─────────────────────────────────────────────────────────
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

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
            <p className="text-muted-foreground">
              Tracking management costs ({expenses?.length ?? 0} records)
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Agency-only toggle — takes precedence over apartment filter */}
          <Button
            variant={agencyOnly ? 'default' : 'outline'}
            size="sm"
            onClick={handleAgencyToggle}
            className={agencyOnly ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Agency-Wide Only
            {agencyOnly && (
              <Badge variant="secondary" className="ml-2 text-xs bg-white/20 text-white">
                Active
              </Badge>
            )}
          </Button>

          {/* Separator / icon */}
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />

          {/* Apartment filter — disabled when agencyOnly is active */}
          <Select
            value={apartmentFilter}
            onValueChange={handleApartmentFilter}
            disabled={agencyOnly}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All properties</SelectItem>
              {apartments
                ?.filter((a) => a.rentalType !== 'COMMISSION_BASED')
                .map((apt) => (
                  <SelectItem key={apt._id} value={apt._id}>
                    {apt.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Category filter (all 19 values) */}
          <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All categories</SelectItem>
              {ALL_CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Table Card ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {agencyOnly ? (
                <>
                  <Building2 className="h-5 w-5 text-violet-600" />
                  Agency Structural Expenses
                </>
              ) : (
                'All Expenses'
              )}
            </CardTitle>
            <CardDescription>
              {agencyOnly
                ? 'Displaying structural expenses not linked to a specific property.'
                : 'Detailed log of all management costs.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses?.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title={agencyOnly ? 'No agency expenses recorded' : 'No expenses recorded'}
                description={
                  agencyOnly
                    ? 'Record your structural expenses (software, marketing, etc.).'
                    : 'Start tracking your costs by recording your first expense.'
                }
                actionLabel="New Expense"
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

      {/* ── Create / Edit Dialog ────────────────────────────────────────── */}
      <ExpenseFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        editTarget={editTarget}
        apartments={apartments ?? []}
      />

      {/* ── Delete Confirmation ─────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirmed}
        loading={isDeleting}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
