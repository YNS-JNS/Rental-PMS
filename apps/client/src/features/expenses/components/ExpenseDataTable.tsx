import { useState } from 'react';
import { format } from 'date-fns';
import type { IExpense } from '@rental/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge';
import { CurrencyText } from '@/components/common/CurrencyText';
import { TablePagination } from '@/components/common/TablePagination';

// ── Constants ─────────────────────────────────────────────────────────────

/**
 * PAGE_SIZE — number of expense rows shown per page.
 *
 * Client-side pagination: the full expenses[] array is fetched once and
 * sliced locally. When the backend grows to support offset/limit params,
 * move this constant to the RTK Query call and wire `totalItems` from the
 * API response into the <TablePagination> component.
 */
const PAGE_SIZE = 10;

// ── Sub-components (SRP) ──────────────────────────────────────────────────

/**
 * AgencyExpenseBadge
 * Rendered in the Property column for AGENCY-type rows.
 * Uses the `agency` semantic token — no hardcoded violet classes.
 */
function AgencyExpenseBadge() {
  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1.5 w-fit bg-agency/10 text-agency border-agency/20 font-medium"
    >
      <Building2 className="h-3 w-3" />
      Agency Expense
    </Badge>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────

interface ExpenseDataTableProps {
  expenses: IExpense[];
  onEdit: (expense: IExpense) => void;
  onDelete: (expenseId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

/**
 * ExpenseDataTable
 *
 * Dumb presenter: receives data and callbacks. Handles its own pagination
 * state internally (page/totalPages). If the parent starts passing pre-paginated
 * data from the API, remove the internal slice and lift `page` state up.
 *
 * Scroll behaviour:
 *   The outer `overflow-x-auto` wrapper allows the table to scroll
 *   horizontally on narrow viewports without breaking the page layout.
 *   The main content area (ProtectedLayout > main) handles vertical scroll.
 *
 * Row transitions:
 *   `table-row-interactive` (defined in index.css) applies
 *   `hover:bg-muted/50 transition-colors duration-100`.
 */
export function ExpenseDataTable({
  expenses,
  onEdit,
  onDelete,
}: ExpenseDataTableProps) {
  /*
   * Pagination state — owned here (not in parent) because the parent cares
   * about which expenses to show, not which page the table is on.
   * Reset to page 1 when the `expenses` prop changes (filter applied).
   */
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(expenses.length / PAGE_SIZE);

  // Slice the data for the current page
  const pageStart = (page - 1) * PAGE_SIZE;
  const visibleExpenses = expenses.slice(pageStart, pageStart + PAGE_SIZE);

  // If the current page becomes invalid (e.g. filter removes items), clamp it
  if (page > totalPages && totalPages > 0) {
    setPage(totalPages);
  }

  return (
    <div className="space-y-0">
      {/*
       * overflow-x-auto: allows horizontal scroll on mobile without affecting
       * the outer layout. The border + radius are on this wrapper, not <Table>.
       */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[110px]">Date</TableHead>
              <TableHead>Property / Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right w-[100px]">Amount</TableHead>
              {/* hidden on mobile — restored at md breakpoint */}
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="w-[52px] text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleExpenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              visibleExpenses.map((expense) => (
                <TableRow
                  key={expense._id}
                  className="table-row-interactive"
                >
                  {/* Date — tabular-nums for digit alignment across rows */}
                  <TableCell className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                    {format(new Date(expense.date), 'dd/MM/yyyy')}
                  </TableCell>

                  {/* Property — agency rows get a dedicated badge */}
                  <TableCell className="font-medium">
                    {expense.expenseType === 'AGENCY' ? (
                      <AgencyExpenseBadge />
                    ) : (
                      expense.apartment?.name ?? (
                        <span className="text-muted-foreground">—</span>
                      )
                    )}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <ExpenseCategoryBadge category={expense.category} />
                  </TableCell>

                  {/* Amount — right-aligned, tabular digits */}
                  <TableCell className="text-right font-semibold tabular-nums whitespace-nowrap">
                    <CurrencyText amount={expense.amount} />
                  </TableCell>

                  {/* Description — hidden on mobile, truncated on desktop */}
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {expense.description || '—'}
                  </TableCell>

                  {/* Row actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Row actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="shadow-dropdown">
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => onDelete(expense._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — rendered below the table, hidden when ≤1 page */}
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={expenses.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        className="px-1"
      />
    </div>
  );
}
