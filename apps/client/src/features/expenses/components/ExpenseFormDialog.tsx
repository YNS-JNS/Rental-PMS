import type { IExpense, IApartment, ExpenseCategoryType } from '@rental/shared';
import { useExpenseForm, AGENCY_SENTINEL } from '../hooks/useExpenseForm';
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Building2, Loader2, Ban } from 'lucide-react';

// ─── Category definitions ─────────────────────────────────────────────────

interface CategoryOption {
  value: ExpenseCategoryType;
  label: string;
}

/** Property-specific categories — shown when an apartment is selected */
const PROPERTY_CATEGORIES: CategoryOption[] = [
  { value: 'WATER',       label: 'Water' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'GAS',         label: 'Gas' },
  { value: 'INTERNET',    label: 'Internet' },
  { value: 'CLEANING',    label: 'Cleaning' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RENOVATION',  label: 'Renovation' },
  { value: 'FURNITURE',   label: 'Furniture' },
];

/** Agency-wide structural categories — shown when Agency option is selected */
const AGENCY_CATEGORIES: CategoryOption[] = [
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
];

const CATCH_ALL: CategoryOption[] = [{ value: 'OTHER', label: 'Other' }];

// ─── Props ────────────────────────────────────────────────────────────────

interface ExpenseFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** If provided, form is in edit mode and pre-filled with this expense. */
  editTarget?: IExpense;
  /**
   * ALL apartments — COMMISSION_BASED are rendered disabled (not hidden).
   * The backend enforces this domain rule; the UI reflects it explicitly.
   */
  apartments: IApartment[];
}

// ─── Component ────────────────────────────────────────────────────────────

/**
 * ExpenseFormDialog — Pure Presenter
 *
 * Delegates all business logic to `useExpenseForm`.
 * Smart behaviours surfaced:
 *  - Agency option is always the first item in the property selector.
 *  - COMMISSION_BASED apartments are visible but disabled with a tooltip.
 *  - Category list dynamically filters based on `isAgencyExpense`.
 *  - Agency icon uses `text-agency` semantic token — no hardcoded violet.
 */
export function ExpenseFormDialog({
  open,
  onClose,
  editTarget,
  apartments,
}: ExpenseFormDialogProps) {
  const { form, onSubmit, isLoading, isEditMode, isAgencyExpense } = useExpenseForm({
    editTarget,
    open,
    onSuccess: onClose,
  });

  // Dynamic category list based on current expense type
  const availableCategories: CategoryOption[] = isAgencyExpense
    ? [...AGENCY_CATEGORIES, ...CATCH_ALL]
    : [...PROPERTY_CATEGORIES, ...CATCH_ALL];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Expense' : 'Record Expense'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of this expense record.'
              : isAgencyExpense
              ? 'Record an agency-wide structural expense.'
              : 'Record a property-related cost.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">

            {/* ── Property / Agency selector ───────────────────────────── */}
            <FormField
              control={form.control}
              name="apartmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select
                    value={field.value ?? AGENCY_SENTINEL}
                    onValueChange={(val) => {
                      field.onChange(val === AGENCY_SENTINEL ? undefined : val);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Static agency option — always first, uses agency token */}
                      <SelectItem value={AGENCY_SENTINEL}>
                        <span className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-agency" />
                          <span className="text-agency font-medium">
                            — Agency-Wide Expense —
                          </span>
                        </span>
                      </SelectItem>

                      {/* Visual separator between agency and property options */}
                      <SelectSeparator />

                      {/* All apartments — COMMISSION_BASED rendered as disabled */}
                      {apartments.map((apt) => {
                        const isCommission = apt.rentalType === 'COMMISSION_BASED';
                        return isCommission ? (
                          // Native title provides tooltip without extra deps
                          <div
                            key={apt._id}
                            title="Expenses do not apply to commission-based properties."
                          >
                            <SelectItem value={apt._id} disabled>
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <Ban className="h-3.5 w-3.5 text-destructive" />
                                {apt.name}
                              </span>
                            </SelectItem>
                          </div>
                        ) : (
                          <SelectItem key={apt._id} value={apt._id}>
                            {apt.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* ── Amount ──────────────────────────────────────────────── */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
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
                          field.onChange(isNaN(val) ? '' : val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Category — dynamically filtered ─────────────────────── */}
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
                        {availableCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Date ────────────────────────────────────────────────── */}
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
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        field.onChange(new Date(year, month - 1, day));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Description ─────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isAgencyExpense
                          ? 'e.g. Annual SaaS subscription...'
                          : 'e.g. Replaced bathroom faucet...'
                      }
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
