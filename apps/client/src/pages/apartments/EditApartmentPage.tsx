import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ApartmentInput, ApartmentSchema } from '@rental/shared';
import {
  useGetApartmentQuery,
  useUpdateApartmentMutation,
} from '@/features/apartments/apartmentsApiSlice';
import { RentalTypeFields } from '@/features/apartments/components/RentalTypeFields';

// Hooks
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Skeleton } from '@/components/ui/skeleton';

export default function EditApartmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. Fetch existing data
  const { data: apartment, isLoading: isFetching } = useGetApartmentQuery(id || '', {
    skip: !id,
  });

  // 2. Prepare Mutation
  const [updateApartment, { isLoading: isUpdating }] = useUpdateApartmentMutation();

  // 3. Form Initialization
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

  // 4. Prefill Form when data arrives
  useEffect(() => {
    if (apartment) {
      form.reset({
        name: apartment.name,
        description: apartment.description || '',
        address: apartment.address,
        price: apartment.price,
        status: apartment.status,
        rentalType: apartment.rentalType ?? 'OWNED_DAILY',
        monthlyRent: apartment.monthlyRent,
        commissionPercentage: apartment.commissionPercentage,
        facilities: apartment.facilities || [],
        images: apartment.images || [],
      });
    }
  }, [apartment, form]);

  // 5. Submission Handler
  const onSubmit = useCallback(async (values: ApartmentInput) => {
    if (!id) return;

    try {
      const payload: ApartmentInput = {
        ...values,
        price: Number(values.price),
        // Strip fields not relevant to the selected rentalType
        monthlyRent: values.rentalType === 'OWNED_MONTHLY' ? Number(values.monthlyRent) : undefined,
        commissionPercentage: values.rentalType === 'COMMISSION_BASED' ? Number(values.commissionPercentage) : undefined,
      };

      await updateApartment({ id, data: payload }).unwrap();

      toast({
        title: 'Success',
        description: 'Apartment updated successfully.',
      });

      navigate('/apartments');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update apartment.',
      });
    }
  }, [id, updateApartment, navigate, toast]);

  // Loading State (Skeleton)
  if (isFetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Property</h2>
        <p className="text-muted-foreground">
          Update the details of your apartment.
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
                      <Input placeholder="e.g. Sunset Villa" {...field} />
                    </FormControl>
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
                      <Input placeholder="Address" {...field} />
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
                        min="0"
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
                        // Reset conditional fields when type changes to avoid stale data
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

              {/* Conditional Financial Fields */}
              <RentalTypeFields control={form.control} selectedType={watchedRentalType} />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
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
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}