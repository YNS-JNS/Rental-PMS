import { useCallback } from 'react';
import type { ApartmentInput, RentalTypeValue } from '@rental/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApartmentSchema } from '@rental/shared';
import { RentalTypeFields } from './RentalTypeFields';
import { Loader2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// ── Types ──────────────────────────────────────────────────────────────────

type FormMode = 'create' | 'edit';

interface ApartmentFormProps {
  /** 'create' shows "Create Property", 'edit' shows "Save Changes" on submit */
  mode: FormMode;
  /** Pre-filled values for edit mode. Omit (or undefined) for create mode. */
  defaultValues?: Partial<ApartmentInput>;
  /** Called with valid, cleaned values on submit */
  onSubmit: (values: ApartmentInput) => Promise<void>;
  /** Controls the submit button loading spinner */
  isLoading: boolean;
  /** Called when the user clicks Cancel */
  onCancel: () => void;
}

// ── Default values ─────────────────────────────────────────────────────────

const DEFAULT_FORM_VALUES: ApartmentInput = {
  name: '',
  description: '',
  address: '',
  price: 0,
  status: 'AVAILABLE',
  rentalType: 'OWNED_DAILY',
  monthlyRent: undefined,
  commissionPercentage: undefined,
  facilities: [],
  images: [],
};

// ── Component ──────────────────────────────────────────────────────────────

/**
 * ApartmentForm — Shared Form Component
 *
 * Extracted from NewApartmentPage and EditApartmentPage to eliminate ~80%
 * JSX duplication. Both pages now render this single component and pass
 * their respective onSubmit handlers and defaultValues.
 *
 * Design System Alignment:
 * - Section groups separated by <Separator> for visual hierarchy
 * - `grid-cols-1 sm:grid-cols-2` — mobile-first (not fixed grid-cols-2)
 * - <Loader2> spinner on submit button — consistent with ExpenseFormDialog
 * - `p-0` on the card content margin is handled by the parent pages, not here
 *
 * Note on `defaultValues`:
 * - In edit mode, the parent fetches the apartment and calls `onSubmit`
 *   after `form.reset(data)` via useEffect. This component receives the
 *   current defaultValues and Zod validates on submit.
 */
export function ApartmentForm({
  mode,
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
}: ApartmentFormProps) {
  const form = useForm<ApartmentInput>({
    resolver: zodResolver(ApartmentSchema),
    defaultValues: { ...DEFAULT_FORM_VALUES, ...defaultValues },
  });

  // Watch rentalType to drive conditional field rendering in RentalTypeFields
  const watchedRentalType = form.watch('rentalType') as RentalTypeValue | undefined;

  const handleSubmit = useCallback(
    async (values: ApartmentInput) => {
      // Normalise numeric fields and strip fields irrelevant to the rental type
      const payload: ApartmentInput = {
        ...values,
        price: Number(values.price),
        monthlyRent:
          values.rentalType === 'OWNED_MONTHLY' ? Number(values.monthlyRent) : undefined,
        commissionPercentage:
          values.rentalType === 'COMMISSION_BASED'
            ? Number(values.commissionPercentage)
            : undefined,
      };
      await onSubmit(payload);
    },
    [onSubmit]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0" noValidate>

        {/* ── Section 1: Identity ─────────────────────────────────────── */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Property Identity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Basic identifying information for this property.
            </p>
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Sunset Villa, Apt 4B" {...field} />
                </FormControl>
                <FormDescription>The public display name of this property.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Casablanca" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price + Status — responsive 2-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1500"
                      min="0"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        // NaN guard: an empty field should not silently write NaN
                        field.onChange(isNaN(val) ? '' : val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="RENTED">Rented</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* ── Section 2: Business Model ───────────────────────────────── */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Business Model</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Determines how revenue and profitability are calculated.
            </p>
          </div>

          {/* Rental Type */}
          <FormField
            control={form.control}
            name="rentalType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rental Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Clear conditional fields to avoid stale data on type switch
                    form.setValue('monthlyRent', undefined);
                    form.setValue('commissionPercentage', undefined);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rental type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="OWNED_DAILY">Owned — Daily Rate</SelectItem>
                    <SelectItem value="OWNED_MONTHLY">Owned — Monthly Rent</SelectItem>
                    <SelectItem value="COMMISSION_BASED">Commission-Based</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional financial fields driven by selected type */}
          <RentalTypeFields control={form.control} selectedType={watchedRentalType} />
        </div>

        <Separator />

        {/* ── Section 3: Additional Details ──────────────────────────── */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Additional Details</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Optional context that improves listing quality.
            </p>
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the property features, view, amenities..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* ── Form Actions ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              mode === 'create' ? 'Create Property' : 'Save Changes'
            )}
          </Button>
        </div>

      </form>
    </Form>
  );
}
