import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetBookingQuery, useDeleteBookingMutation } from '@/features/bookings/bookingsApiSlice';
import { useGetPaymentsByBookingQuery, useDeletePaymentMutation } from '@/features/finance/financeApiSlice';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft, Pencil, Trash2, Calendar, Building2, Users, DollarSign,
  FileText, Hash, Clock, CreditCard, Plus, Banknote, Landmark, CircleDollarSign,
} from 'lucide-react';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Utils

// Custom Components
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { NewPaymentModal } from '@/features/finance/components/NewPaymentModal';
import { PageTitle } from '@/components/common/PageTitle';
import { CurrencyText } from '@/components/common/CurrencyText';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ============================================
// Config maps
// ============================================
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PENDING: { label: 'Pending', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  PARTIALLY_PAID: { label: 'Partial', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  UNPAID: { label: 'Unpaid', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

const methodIcons: Record<string, typeof CreditCard> = {
  CASH: Banknote,
  BANK_TRANSFER: Landmark,
  CHECK: FileText,
  OTHER: CircleDollarSign,
};

const methodLabels: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CHECK: 'Check',
  OTHER: 'Other',
};

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentIdToDelete, setPaymentIdToDelete] = useState<string | null>(null);

  // Queries
  const { data: booking, isLoading, isError } = useGetBookingQuery(id!);
  const { data: payments, isLoading: paymentsLoading } = useGetPaymentsByBookingQuery(id!);
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();
  const [deletePayment, { isLoading: isDeletingPayment }] = useDeletePaymentMutation();

  // ============================================
  // Handlers
  // ============================================
  const handleDelete = async () => {
    try {
      await deleteBooking(id!).unwrap();
      toast({ title: 'Booking Cancelled', description: 'The booking has been cancelled.' });
      navigate('/bookings');
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not cancel the booking.' });
    }
  };

  const handleDeletePayment = async () => {
    if (!paymentIdToDelete) return;
    try {
      await deletePayment(paymentIdToDelete).unwrap();
      toast({ title: 'Payment Deleted', description: 'The payment has been removed and booking status updated.' });
      setPaymentIdToDelete(null);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete payment.' });
    }
  };

  // ============================================
  // Helpers
  // ============================================
  const formatDate = (date: string | Date) => format(new Date(date), 'MMMM dd, yyyy');
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

  // ============================================
  // Loading / Error states
  // ============================================
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading booking details...</div>;
  if (isError || !booking) return <div className="p-8 text-center text-red-500">Failed to load booking.</div>;

  const config = statusConfig[booking.status] || statusConfig.PENDING;
  const totalPaid = booking.totalPaid || 0;
  const balanceDue = Math.max(0, booking.totalPrice - totalPaid);
  const paymentConfig = paymentStatusConfig[booking.paymentStatus || 'UNPAID'];

  return (
    <>
      <PageTitle title={`Booking ${getApartmentName(booking)}`} />
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

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="financials" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Financials
            </TabsTrigger>
          </TabsList>

          {/* ================================ */}
          {/* TAB: DETAILS                     */}
          {/* ================================ */}
          <TabsContent value="details">
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
                      <CurrencyText amount={booking.totalPrice} className="text-2xl font-bold text-primary" />
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
                      <p className="font-medium"><CurrencyText amount={booking.totalPrice} /></p>
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
          </TabsContent>

          {/* ================================ */}
          {/* TAB: FINANCIALS                  */}
          {/* ================================ */}
          <TabsContent value="financials">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Total Booking */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Booking</p>
                        <p className="text-2xl font-bold"><CurrencyText amount={booking.totalPrice} className="text-2xl font-bold" /></p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Paid */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className={`text-2xl font-bold ${totalPaid >= booking.totalPrice ? 'text-green-600' : totalPaid > 0 ? 'text-orange-500' : ''}`}>
                          <CurrencyText amount={totalPaid} className={`text-2xl font-bold ${totalPaid >= booking.totalPrice ? 'text-green-600' : totalPaid > 0 ? 'text-orange-500' : ''}`} />
                        </p>
                      </div>
                      <Badge className={paymentConfig.className}>
                        {paymentConfig.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Balance Due */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Balance Due</p>
                        <p className={`text-2xl font-bold ${balanceDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          <CurrencyText amount={balanceDue} className={`text-2xl font-bold ${balanceDue > 0 ? 'text-red-500' : 'text-green-600'}`} />
                        </p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${balanceDue > 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
                        <CreditCard className={`h-6 w-6 ${balanceDue > 0 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payments Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Payment History</CardTitle>
                  <Button size="sm" onClick={() => setShowPaymentModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Record Payment
                  </Button>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
                  ) : !payments || payments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No payments recorded yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => {
                          const MethodIcon = methodIcons[payment.method] || CreditCard;
                          return (
                            <TableRow key={payment._id}>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(payment.date), 'MMM dd, yyyy')}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="gap-1">
                                  <MethodIcon className="h-3 w-3" />
                                  {methodLabels[payment.method] || payment.method}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {payment.reference || '—'}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                <CurrencyText amount={payment.amount} />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                  onClick={() => setPaymentIdToDelete(payment._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Booking Confirmation */}
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

      {/* Delete Payment Confirmation */}
      <ConfirmModal
        isOpen={!!paymentIdToDelete}
        onClose={() => setPaymentIdToDelete(null)}
        onConfirm={handleDeletePayment}
        loading={isDeletingPayment}
        title="Delete Payment"
        description="Are you sure you want to delete this payment? The booking balance will be recalculated."
        confirmText="Delete Payment"
        variant="destructive"
      />

      {/* New Payment Modal */}
      <NewPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingId={id!}
        balanceDue={balanceDue}
      />
    </>
  );
}
