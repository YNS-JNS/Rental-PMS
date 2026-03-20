import { useState, useCallback } from 'react';
import { Building2, Filter, Plus, ReceiptText, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import type { IExpense, ExpenseCategoryType } from '@rental/shared';
import { useGetExpensesQuery, useDeleteExpenseMutation } from '@/features/expenses/api/expensesApiSlice';
import { useGetApartmentsQuery } from '@/features/apartments/apartmentsApiSlice';
import { ExpenseDataTable } from '@/features/expenses/components/ExpenseDataTable';
import { ExpenseFormDialog } from '@/features/expenses/components/ExpenseFormDialog';
import type { ExpenseFilters } from '@/features/expenses/types/expense.types';

import { PageTitle } from '@/components/common/PageTitle';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Category filter options (all 19) ─────────────────────────────────────

interface CategoryOption { value: ExpenseCategoryType; label: string }

const ALL_CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'WATER',           label: 'Water' },
  { value: 'ELECTRICITY',     label: 'Electricity' },
  { value: 'GAS',             label: 'Gas' },
  { value: 'INTERNET',        label: 'Internet' },
  { value: 'CLEANING',        label: 'Cleaning' },
  { value: 'MAINTENANCE',     label: 'Maintenance' },
  { value: 'RENOVATION',      label: 'Renovation' },
  { value: 'FURNITURE',       label: 'Furniture' },
  { value: 'SOFTWARE',        label: 'Software' },
  { value: 'MARKETING',       label: 'Marketing' },
  { value: 'INSURANCE',       label: 'Insurance' },
  { value: 'ACCOUNTING',      label: 'Accounting' },
  { value: 'LEGAL',           label: 'Legal' },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { value: 'SALARIES',        label: 'Salaries' },
  { value: 'TRAVEL',          label: 'Travel' },
  { value: 'EQUIPMENT',       label: 'Equipment' },
  { value: 'TAXES',           label: 'Taxes' },
  { value: 'OTHER',           label: 'Other' },
];

// ─── Loading skeleton ─────────────────────────────────────────────────────

function ExpensesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-[200px]" />
        <Skeleton className="h-9 w-[200px]" />
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border space-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-48" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

/**
 * ExpensesPage
 *
 * Smart container owns all filter and dialog state.
 * Delegates rendering to ExpenseDataTable (pure presenter).
 *
 * Filter UI:
 *   A collapsible `<FilterBar>` replaces the always-visible inline filters.
 *   On mobile, filters are collapsed by default to save vertical space.
 *   A badge on the "Filters" button shows how many active filters the user has.
 *
 * Scroll:
 *   This page lives inside ProtectedLayout's `overflow-y-auto` main zone —
 *   it does NOT need its own scroll container.
 */
export default function ExpensesPage() {
  const { toast } = useToast();

  // ── Filter State ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [apartmentFilter, setApartmentFilter] = useState<string>('_all');
  const [categoryFilter, setCategoryFilter] = useState<string>('_all');
  const [agencyOnly, setAgencyOnly] = useState(false);

  /*
   * filtersOpen — controls the collapsible filter panel.
   * Starts expanded on desktop, collapsed on mobile (CSS handles this via
   * the hidden/flex toggle — the state controls both via a single boolean).
   */
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Dialog State ──────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IExpense | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // ── API ───────────────────────────────────────────────────────────────────
  const { data: expenses, isLoading: isLoadingExpenses, isError } = useGetExpensesQuery(filters);
  const { data: apartments, isLoading: isLoadingApartments } = useGetApartmentsQuery();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  // ── Derived: count of active filters for badge ────────────────────────────
  const activeFilterCount =
    (agencyOnly ? 1 : 0) +
    (apartmentFilter !== '_all' ? 1 : 0) +
    (categoryFilter !== '_all' ? 1 : 0);

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

  const handleAgencyToggle = useCallback(() => {
    setAgencyOnly((prev) => {
      const next = !prev;
      if (next) {
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoadingExpenses || isLoadingApartments) {
    return <ExpensesPageSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load expenses</AlertTitle>
        <AlertDescription>
          There was a problem fetching your data. Please refresh the page or try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <PageTitle title="Expenses" />
      <div className="space-y-5">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Expenses</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {expenses?.length ?? 0} records tracked
            </p>
          </div>
          <Button size="sm" onClick={handleOpenCreate} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>

        {/* ── Collapsible Filter Bar ────────────────────────────────────── */}
        {/*
         * The filter bar is collapsed by default on mobile to save space.
         * A badge on the toggle button shows how many filters are active,
         * so the user always knows the data is filtered even when collapsed.
         */}
        <div className="space-y-3">
          {/* Toggle button — always visible */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen((v) => !v)}
              className="gap-2"
              aria-expanded={filtersOpen}
              aria-controls="expense-filter-panel"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-xs font-medium min-w-[1.25rem] text-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
              {filtersOpen
                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              }
            </Button>

            {/* Active filter summary chips — shown when collapsed */}
            {!filtersOpen && agencyOnly && (
              <Badge variant="outline" className="bg-agency/10 text-agency border-agency/20 gap-1.5">
                <Building2 className="h-3 w-3" />
                Agency Only
              </Badge>
            )}
          </div>

          {/* Collapsible filter panel */}
          <div
            id="expense-filter-panel"
            className={cn(
              'flex flex-wrap items-center gap-3 overflow-hidden transition-all duration-200',
              filtersOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
            )}
          >
            {/* Agency toggle */}
            <Button
              variant={agencyOnly ? 'default' : 'outline'}
              size="sm"
              onClick={handleAgencyToggle}
              className={agencyOnly ? 'bg-agency text-agency-foreground hover:bg-agency/90' : ''}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Agency-Wide Only
            </Button>

            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />

            {/* Apartment filter */}
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
                    <SelectItem key={apt._id} value={apt._id}>{apt.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All categories</SelectItem>
                {ALL_CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtersOpen && <Separator />}
        </div>

        {/* ── Table Card ───────────────────────────────────────────────── */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              {agencyOnly ? (
                <>
                  <Building2 className="h-4 w-4 text-agency" />
                  Agency Structural Expenses
                </>
              ) : 'All Expenses'}
            </CardTitle>
            <CardDescription>
              {agencyOnly
                ? 'Structural expenses not linked to a specific property.'
                : 'Detailed log of all management costs.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
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

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <ExpenseFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        editTarget={editTarget}
        apartments={apartments ?? []}
      />

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
