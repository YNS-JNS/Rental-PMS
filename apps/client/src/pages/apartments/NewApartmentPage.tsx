import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApartmentInput } from '@rental/shared';
import { useCreateApartmentMutation } from '@/features/apartments/apartmentsApiSlice';
import { ApartmentForm } from '@/features/apartments/components/ApartmentForm';
import { useToast } from '@/hooks/use-toast';
import { PageTitle } from '@/components/common/PageTitle';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * NewApartmentPage
 *
 * Thin shell: owns only the RTK mutation, toast, and navigation.
 * All form rendering and validation is delegated to <ApartmentForm>.
 */
export default function NewApartmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createApartment, { isLoading }] = useCreateApartmentMutation();

  const handleSubmit = useCallback(async (values: ApartmentInput) => {
    try {
      await createApartment(values).unwrap();
      toast({ title: 'Property created', description: 'The new property has been listed.' });
      navigate('/apartments');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create property. Please check your inputs.',
      });
    }
  }, [createApartment, navigate, toast]);

  return (
    <>
      <PageTitle title="New Property" />
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Page header with back navigation ────────────────────────── */}
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
            <h2 className="text-xl font-semibold">Add New Property</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fill in the details below to list a new apartment.
            </p>
          </div>
        </div>

        {/* ── Form card ─────────────────────────────────────────────────── */}
        {/* p-0 overrides Card's default padding — ApartmentForm owns its own section padding */}
        <Card className="overflow-hidden shadow-card p-0">
          <ApartmentForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => navigate('/apartments')}
          />
        </Card>

      </div>
    </>
  );
}