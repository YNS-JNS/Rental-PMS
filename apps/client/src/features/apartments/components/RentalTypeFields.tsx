import type { Control } from 'react-hook-form';
import type { ApartmentInput, RentalTypeValue } from '@rental/shared';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface RentalTypeFieldsProps {
  /** react-hook-form control from the parent ApartmentForm */
  control: Control<ApartmentInput>;
  /** Currently selected rental type — drives conditional visibility */
  selectedType: RentalTypeValue | undefined;
}

/**
 * RentalTypeFields
 *
 * SRP: This component has one job — render the conditional financial fields
 * that depend on the selected `rentalType`. It is a pure presenter; no
 * business logic. The parent form owns the state.
 *
 * - OWNED_MONTHLY  → monthlyRent input
 * - COMMISSION_BASED → commissionPercentage input
 * - OWNED_DAILY    → renders nothing
 */
export function RentalTypeFields({ control, selectedType }: RentalTypeFieldsProps) {
  if (selectedType === 'OWNED_MONTHLY') {
    return (
      <FormField
        control={control}
        name="monthlyRent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monthly Rent ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g. 2500"
                min="0.01"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  // FIX: `val || undefined` would strip `0` since 0 is falsy.
                  // Use an explicit NaN check to only strip truly empty input.
                  field.onChange(isNaN(val) ? undefined : val);
                }}
              />
            </FormControl>
            <FormDescription>
              Fixed monthly rent used to calculate owner revenue.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (selectedType === 'COMMISSION_BASED') {
    return (
      <FormField
        control={control}
        name="commissionPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Commission Percentage (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g. 15"
                min={0}
                max={100}
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  // FIX: `val || undefined` strips 0%, which is valid.
                  field.onChange(isNaN(val) ? undefined : val);
                }}
              />
            </FormControl>
            <FormDescription>
              Agency takes this % of each booking. Revenue = Bookings × Commission %.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // OWNED_DAILY — no additional fields required
  return null;
}
