import type { IExpense, IApartment } from '@rental/shared';
import { useExpenseForm } from '../hooks/useExpenseForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ExpenseFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** If provided, form is in edit mode and pre-filled with this expense. */
  editTarget?: IExpense;
  /**
   * Available apartments — commission-based ones are filtered out client-side
   * because the backend enforces this constraint.
   */
  apartments: IApartment[];
}

/**
 * ExpenseFormDialog — Pure Presenter
 *
 * FIX: Removed the duplicate `useEffect` that previously called `form.reset()`
 * directly in this component. That created a race condition / SRP violation:
 * both the hook AND the dialog were managing reset logic.
 *
 * Now reset is exclusively owned by `useExpenseForm` (via the `open` prop).
 * This component only renders — it holds zero state and zero side effects.
 */
export function ExpenseFormDialog({
  open,
  onClose,
  editTarget,
  apartments,
}: ExpenseFormDialogProps) {
  // Pass `open` so the hook can reset the form at the right moment
  const { form, onSubmit, isLoading, isEditMode } = useExpenseForm({
    editTarget,
    open,
    onSuccess: onClose,
  });

  // Filter out COMMISSION_BASED apartments — they cannot have expenses
  const eligibleApartments = apartments.filter(
    (apt) => apt.rentalType !== 'COMMISSION_BASED',
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Expense' : 'Record New Expense'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of this expense record.'
              : 'Add a new expense entry to track property costs.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">

            {/* Apartment (optional — expenses can be general) */}
            <FormField
              control={form.control}
              name="apartmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apartment (optional)</FormLabel>
                  <Select
                    // FIX: pass undefined (not '') when no apartment is selected.
                    // Radix Select shows the placeholder when value is undefined.
                    // Passing '' causes the Select to render in a blank/non-placeholder state.
                    value={field.value ?? undefined}
                    onValueChange={(val) => {
                      // '_none' is a sentinel for "no selection" within Radix Select,
                      // which does not support clearing to undefined natively.
                      field.onChange(val === '_none' ? undefined : val);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an apartment..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="_none">
                        <span className="text-muted-foreground">No specific apartment</span>
                      </SelectItem>
                      {eligibleApartments.map((apt) => (
                        <SelectItem key={apt._id} value={apt._id}>
                          {apt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          // FIX: avoid writing NaN to RHF state when field is cleared
                          field.onChange(isNaN(val) ? '' : val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WATER">Water</SelectItem>
                        <SelectItem value="ELECTRICITY">Electricity</SelectItem>
                        <SelectItem value="CLEANING">Cleaning</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => {
                        // FIX: parse the date in local timezone to avoid UTC day-off-by-one
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        field.onChange(new Date(year, month - 1, day));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Replaced broken pipe in bathroom..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Saving...' : 'Recording...'}
                  </>
                ) : (
                  isEditMode ? 'Save Changes' : 'Record Expense'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
