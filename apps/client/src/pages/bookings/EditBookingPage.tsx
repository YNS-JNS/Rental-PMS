import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { differenceInDays, format as formatDate } from 'date-fns';
import { z } from 'zod';

import { useGetBookingQuery, useUpdateBookingMutation } from '@/features/bookings/bookingsApiSlice';
import { useGetApartmentsQuery } from '@/features/apartments/apartmentsApiSlice';
import { useGetTenantsQuery } from '@/features/tenants/tenantsApiSlice';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Reusable Components
import { Combobox } from '@/components/common/Combobox';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

// Form-specific schema: use string for dates in the form
const BookingFormSchema = z.object({
  apartmentId: z.string().min(1, 'Apartment is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  totalPrice: z.coerce.number().min(0, 'Price must be positive'),
  guestCount: z.coerce.number().int().min(1, 'At least 1 guest'),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof BookingFormSchema>;

export default function EditBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: booking, isLoading: isFetching, isError } = useGetBookingQuery(id!);
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
  const { data: apartments } = useGetApartmentsQuery();
  const { data: tenants } = useGetTenantsQuery();

  // Combobox options
  const apartmentOptions = useMemo(() =>
    apartments?.map((a) => ({ value: a._id, label: `${a.name} — ${a.address}` })) || [],
    [apartments]
  );

  const tenantOptions = useMemo(() =>
    tenants?.map((t) => ({ value: t._id, label: `${t.firstName} ${t.lastName} (${t.email})` })) || [],
    [tenants]
  );

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      apartmentId: '',
      tenantId: '',
      startDate: '',
      endDate: '',
      status: 'CONFIRMED',
      totalPrice: 0,
      guestCount: 1,
      notes: '',
    },
  });

  // Populate form when booking data is loaded
  useEffect(() => {
    if (booking) {
      const aptId = (booking as any).apartment?._id || booking.apartmentId;
      const tntId = (booking as any).tenant?._id || booking.tenantId;
      form.reset({
        apartmentId: aptId,
        tenantId: tntId,
        startDate: formatDate(new Date(booking.startDate), 'yyyy-MM-dd'),
        endDate: formatDate(new Date(booking.endDate), 'yyyy-MM-dd'),
        status: booking.status,
        totalPrice: booking.totalPrice,
        guestCount: booking.guestCount,
        notes: booking.notes || '',
      });
    }
  }, [booking, form]);

  // Watch fields for dynamic price calculation
  const watchedApartmentId = useWatch({ control: form.control, name: 'apartmentId' });
  const watchedStartDate = useWatch({ control: form.control, name: 'startDate' });
  const watchedEndDate = useWatch({ control: form.control, name: 'endDate' });

  const priceEstimate = useMemo(() => {
    if (!watchedApartmentId || !watchedStartDate || !watchedEndDate) return null;

    const apartment = apartments?.find((a) => a._id === watchedApartmentId);
    if (!apartment) return null;

    const start = new Date(watchedStartDate);
    const end = new Date(watchedEndDate);
    const nights = differenceInDays(end, start);

    if (nights <= 0) return null;

    return {
      pricePerNight: apartment.price,
      nights,
      total: nights * apartment.price,
      apartmentName: apartment.name,
    };
  }, [watchedApartmentId, watchedStartDate, watchedEndDate, apartments]);

  async function onSubmit(values: BookingFormValues) {
    if (new Date(values.endDate) <= new Date(values.startDate)) {
      form.setError('endDate', { message: 'End date must be after start date' });
      return;
    }

    const payload = {
      ...values,
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate),
    };

    try {
      await updateBooking({ id: id!, data: payload }).unwrap();
      toast({
        title: 'Success',
        description: 'Booking updated successfully.',
      });
      navigate(`/bookings/${id}`);
    } catch (err: any) {
      if (err?.status === 409) {
        form.setError('endDate', {
          message: "Cet appartement est déjà occupé à ces dates.",
        });
        form.setError('startDate', {
          message: "Cet appartement est déjà occupé à ces dates.",
        });
      } else {
        const message = err?.data?.message || 'Failed to update booking.';
        toast({
          variant: 'destructive',
          title: 'Error',
          description: message,
        });
      }
    }
  }

  if (isFetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !booking) {
    return <div className="p-8 text-center text-red-500">Failed to load booking.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Booking</h2>
        <p className="text-muted-foreground">
          Update the reservation details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Apartment Selector */}
              <FormField
                control={form.control}
                name="apartmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apartment</FormLabel>
                    <FormControl>
                      <Combobox
                        options={apartmentOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select an apartment..."
                        searchPlaceholder="Search apartments..."
                        emptyText="No apartments found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tenant Selector */}
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant</FormLabel>
                    <FormControl>
                      <Combobox
                        options={tenantOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select a tenant..."
                        searchPlaceholder="Search tenants..."
                        emptyText="No tenants found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price Estimate Alert */}
              {priceEstimate && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{priceEstimate.apartmentName}</strong>: {priceEstimate.nights} night{priceEstimate.nights > 1 ? 's' : ''} ×{' '}
                    {priceEstimate.pricePerNight.toLocaleString()} MAD ={' '}
                    <strong>{priceEstimate.total.toLocaleString()} MAD</strong>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Total Price */}
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Price (MAD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Auto-calculated, but editable.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Guest Count */}
                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Guests</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
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
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes..."
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
                  onClick={() => navigate(`/bookings/${id}`)}
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
