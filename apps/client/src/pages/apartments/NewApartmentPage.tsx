import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { ApartmentInput, ApartmentSchema } from '@rental/shared';
import { useCreateApartmentMutation } from '@/features/apartments/apartmentsApiSlice';
import { RentalTypeFields } from '@/features/apartments/components/RentalTypeFields';

// Hooks
import { useToast } from '@/hooks/use-toast';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewApartmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // RTK Query Mutation
  const [createApartment, { isLoading }] = useCreateApartmentMutation();

  // 1. Form Initialization
  const form = useForm<ApartmentInput>({
    resolver: zodResolver(ApartmentSchema),
    defaultValues: {
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
    },
  });

  // Watch rentalType to drive conditional field rendering
  const watchedRentalType = form.watch('rentalType');

  // 2. Submission Handler
  const onSubmit = useCallback(async (values: ApartmentInput) => {
    try {
      const payload: ApartmentInput = {
        ...values,
        price: Number(values.price),
        // Clear fields not relevant to the selected rentalType
        monthlyRent: values.rentalType === 'OWNED_MONTHLY' ? Number(values.monthlyRent) : undefined,
        commissionPercentage: values.rentalType === 'COMMISSION_BASED' ? Number(values.commissionPercentage) : undefined,
      };

      await createApartment(payload).unwrap();

      toast({
        title: 'Success',
        description: 'Apartment created successfully.',
      });

      navigate('/apartments');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create apartment. Please check your inputs.',
      });
    }
  }, [createApartment, navigate, toast]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add New Property</h2>
        <p className="text-muted-foreground">
          Fill in the details below to list a new apartment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sunset Villa, Apt 4B" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the public name of the property.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Field */}
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

              <div className="grid grid-cols-2 gap-4">
                {/* Price Field */}
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
                            // FIX: NaN guard — without this, clearing the field
                            // writes NaN silently and Zod never shows the error.
                            field.onChange(isNaN(val) ? '' : val);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Field */}
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

              {/* Rental Type Field */}
              <FormField
                control={form.control}
                name="rentalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rental Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset conditional fields when type changes
                        form.setValue('monthlyRent', undefined);
                        form.setValue('commissionPercentage', undefined);
                      }}
                      defaultValue={field.value}
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
                    <FormDescription>
                      Determines how revenue and profitability are calculated.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Financial Fields (driven by rentalType) */}
              <RentalTypeFields control={form.control} selectedType={watchedRentalType} />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the property features, view, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate('/apartments')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Property'}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}