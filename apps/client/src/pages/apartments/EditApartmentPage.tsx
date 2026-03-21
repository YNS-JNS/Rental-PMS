import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ApartmentInput } from '@rental/shared';
import {
  useGetApartmentQuery,
  useUpdateApartmentMutation,
} from '@/features/apartments/apartmentsApiSlice';
import { ApartmentForm } from '@/features/apartments/components/ApartmentForm';
import { useToast } from '@/hooks/use-toast';
import { PageTitle } from '@/components/common/PageTitle';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * EditApartmentPage
 *
 * Thin shell: fetches the apartment, passes defaultValues to <ApartmentForm>,
 * owns the update mutation, toast, and navigation.
 *
 * Prefill strategy:
 *   `defaultValues` is a Partial<ApartmentInput> built from the fetched apartment.
 *   The ApartmentForm component initialises react-hook-form with these values.
 *   When the apartment data arrives after an initial render, the form is
 *   re-initialised via react-hook-form's `defaultValues` prop.
 *
 * Note: if the apartment is not found (undefined after load), we redirect.
 */
export default function EditApartmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: apartment, isLoading: isFetching } = useGetApartmentQuery(id || '', {
    skip: !id,
  });

  const [updateApartment, { isLoading: isUpdating }] = useUpdateApartmentMutation();

  // Redirect if the apartment is not found after loading
  useEffect(() => {
    if (!isFetching && !apartment && id) {
      toast({ variant: 'destructive', title: 'Property not found' });
      navigate('/apartments');
    }
  }, [isFetching, apartment, id, navigate, toast]);

  const handleSubmit = useCallback(async (values: ApartmentInput) => {
    if (!id) return;
    try {
      await updateApartment({ id, data: values }).unwrap();
      toast({ title: 'Property updated', description: 'Changes have been saved.' });
      navigate('/apartments');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update property.',
      });
    }
  }, [id, updateApartment, navigate, toast]);

  // ── Loading state — mimics the ApartmentForm section layout ──────────────
  if (isFetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Card className="overflow-hidden shadow-card p-0">
          {/* Section 1 skeleton */}
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          </div>
          <div className="border-t border-border" />
          {/* Section 2 skeleton */}
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="border-t border-border" />
          {/* Actions skeleton */}
          <div className="flex justify-end gap-3 px-6 py-4">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </Card>
      </div>
    );
  }

  // Build defaultValues from the fetched apartment data
  const defaultValues: Partial<ApartmentInput> = apartment
    ? {
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
      }
    : {};

  return (
    <>
      <PageTitle title="Edit Property" />
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => navigate('/apartments')}
            aria-label="Back to properties"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Edit Property</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {apartment?.name ?? 'Update property details'}
            </p>
          </div>
        </div>

        {/* ── Form card ─────────────────────────────────────────────────── */}
        <Card className="overflow-hidden shadow-card p-0">
          <ApartmentForm
            mode="edit"
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
            onCancel={() => navigate('/apartments')}
          />
        </Card>

      </div>
    </>
  );
}