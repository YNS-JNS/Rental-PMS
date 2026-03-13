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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge';
import { CurrencyText } from '@/components/common/CurrencyText';

interface ExpenseDataTableProps {
  expenses: IExpense[];
  onEdit: (expense: IExpense) => void;
  onDelete: (expenseId: string) => void;
}

/**
 * ExpenseDataTable
 * Dumb component: receives data and callbacks, renders table with dropdown actions.
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
            <TableHead>Apartment</TableHead>
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
                No expenses found. Record your first expense to get started.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(expense.date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="font-medium">
                  {expense.apartment?.name || 'General'}
                </TableCell>
                <TableCell>
                  <ExpenseCategoryBadge category={expense.category} />
                </TableCell>
                <TableCell className="text-right font-semibold">
                  <CurrencyText amount={expense.amount} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                  {expense.description || '—'}
                </TableCell>
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
