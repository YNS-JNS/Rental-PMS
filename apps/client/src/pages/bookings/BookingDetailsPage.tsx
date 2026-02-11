import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetBookingQuery, useDeleteBookingMutation } from '@/features/bookings/bookingsApiSlice';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft, Pencil, Trash2, Calendar, Building2, Users, DollarSign,
  FileText, Hash, Clock,
} from 'lucide-react';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Custom Components
import { ConfirmModal } from '@/components/common/ConfirmModal';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Status config
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PENDING: { label: 'Pending', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
};

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: booking, isLoading, isError } = useGetBookingQuery(id!);
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();

  const handleDelete = async () => {
    try {
      await deleteBooking(id!).unwrap();
      toast({
        title: 'Booking Cancelled',
        description: 'The booking has been cancelled.',
      });
      navigate('/bookings');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not cancel the booking.',
      });
    }
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMMM dd, yyyy');
  };

  const getApartmentName = (b: any) => b.apartment?.name || b.apartmentId || '—';
  const getApartmentAddress = (b: any) => b.apartment?.address || '';
  const getTenantName = (b: any) => {
    if (b.tenant) return `${b.tenant.firstName} ${b.tenant.lastName}`;
    return b.tenantId || '—';
  };
  const getTenantEmail = (b: any) => b.tenant?.email || '';

  const getNights = (b: any) => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading booking details...</div>;
  if (isError || !booking) return <div className="p-8 text-center text-red-500">Failed to load booking.</div>;

  const config = statusConfig[booking.status] || statusConfig.PENDING;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/bookings')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Booking Details
              </h2>
              <p className="text-muted-foreground">
                {getApartmentName(booking)} • {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/bookings/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Summary Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{getNights(booking)} Nights</h3>
                <Badge variant={config.variant} className="text-sm">
                  {config.label}
                </Badge>
                <div className="text-2xl font-bold text-primary">
                  {booking.totalPrice.toLocaleString()} MAD
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Reservation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Apartment */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Apartment</p>
                  <p className="font-medium">{getApartmentName(booking)}</p>
                  {getApartmentAddress(booking) && (
                    <p className="text-xs text-muted-foreground">{getApartmentAddress(booking)}</p>
                  )}
                </div>
              </div>

              {/* Tenant */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tenant</p>
                  <p className="font-medium">{getTenantName(booking)}</p>
                  {getTenantEmail(booking) && (
                    <p className="text-xs text-muted-foreground">{getTenantEmail(booking)}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="font-medium">
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="font-medium">{booking.totalPrice.toLocaleString()} MAD</p>
                </div>
              </div>

              {/* Guest Count */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">{booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}</p>
                </div>
              </div>

              <Separator />

              {/* Created Date */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created On</p>
                  <p className="font-medium">{formatDate(booking.createdAt)}</p>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-medium whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? The status will be set to CANCELLED."
        confirmText="Cancel Booking"
        variant="destructive"
      />
    </>
  );
}
