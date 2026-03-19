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

// ─── Sub-components (SRP) ──────────────────────────────────────────────────

/**
 * AgencyExpenseBadge
 * Displayed in the Apartment column when a row is an Agency-Wide expense.
 * SRP: single responsibility to render the "Frais d'Agence" visual indicator.
 */
function AgencyExpenseBadge() {
  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1.5 w-fit bg-violet-50 text-violet-700 border-violet-200 font-medium"
    >
      <Building2 className="h-3 w-3" />
      Agency Expense
    </Badge>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface ExpenseDataTableProps {
  expenses: IExpense[];
  onEdit: (expense: IExpense) => void;
  onDelete: (expenseId: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * ExpenseDataTable
 * Dumb component: receives data and callbacks, renders table with dropdown actions.
 *
 * Updated: Apartment column now renders an AgencyExpenseBadge for AGENCY-type
 * expenses instead of a blank or "General" fallback.
 */
export function ExpenseDataTable({
  expenses,
  onEdit,
  onDelete,
}: ExpenseDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Property / Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No expenses found.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense._id}>
                {/* Date */}
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(expense.date), 'dd/MM/yyyy')}
                </TableCell>

                {/* Apartment — agency expenses get a dedicated badge */}
                <TableCell className="font-medium">
                  {expense.expenseType === 'AGENCY' ? (
                    <AgencyExpenseBadge />
                  ) : (
                    expense.apartment?.name ?? (
                      <span className="text-muted-foreground italic">—</span>
                    )
                  )}
                </TableCell>

                {/* Category */}
                <TableCell>
                  <ExpenseCategoryBadge category={expense.category} />
                </TableCell>

                {/* Amount */}
                <TableCell className="text-right font-semibold">
                  <CurrencyText amount={expense.amount} />
                </TableCell>

                {/* Description */}
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                  {expense.description || '—'}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(expense)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
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
  );
}
