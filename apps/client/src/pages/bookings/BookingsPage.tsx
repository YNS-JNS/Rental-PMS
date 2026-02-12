import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Calendar as CalendarIcon, List } from 'lucide-react';
import { useGetBookingsQuery, useDeleteBookingMutation } from '@/features/bookings/bookingsApiSlice';
import type { IBooking } from '@rental/shared';
import { formatCurrency } from '@/lib/formatCurrency';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Custom Components
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { BookingsCalendar } from '@/features/bookings/components/BookingsCalendar';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Status badge styling
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PENDING: { label: 'Pending', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  PARTIALLY_PAID: { label: 'Partial', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  UNPAID: { label: 'Unpaid', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
};

type ViewMode = 'list' | 'calendar';

export default function BookingsPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bookingIdToDelete, setBookingIdToDelete] = useState<string | null>(null);

  // Build query params
  const queryFilters = statusFilter !== 'ALL' ? { status: statusFilter } : undefined;
  const { data: bookings, isLoading, isError } = useGetBookingsQuery(queryFilters);
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();

  const handleDeleteConfirmed = async () => {
    if (!bookingIdToDelete) return;
    try {
      await deleteBooking(bookingIdToDelete).unwrap();
      toast({
        title: 'Booking Cancelled',
        description: 'The booking has been cancelled successfully.',
      });
      setBookingIdToDelete(null);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not cancel the booking. Please try again.',
      });
    }
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getApartmentName = (booking: IBooking) => {
    return (booking as any).apartment?.name || booking.apartmentId || '—';
  };

  const getTenantName = (booking: IBooking) => {
    const tenant = (booking as any).tenant;
    if (tenant) {
      return `${tenant.firstName} ${tenant.lastName}`;
    }
    return booking.tenantId || '—';
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load bookings.</div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
            <p className="text-muted-foreground">
              Manage your reservations ({bookings?.length || 0} total)
            </p>
          </div>
          <Button asChild>
            <Link to="/bookings/new">
              <Plus className="mr-2 h-4 w-4" /> New Booking
            </Link>
          </Button>
        </div>

        {/* Filters + View Toggle */}
        <div className="flex items-center justify-between gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border p-1 gap-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && bookings && (
          <BookingsCalendar bookings={bookings} />
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                A list of all reservations. Use the actions menu to manage each booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apartment</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead className="hidden md:table-cell">Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Payment</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Price</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No bookings found. <br />
                        <Link to="/bookings/new" className="text-primary hover:underline">
                          Create your first booking
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}

                  {bookings?.map((booking: IBooking) => {
                    const config = statusConfig[booking.status] || statusConfig.PENDING;
                    return (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">
                          {getApartmentName(booking)}
                        </TableCell>
                        <TableCell>
                          {getTenantName(booking)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {(() => {
                            const pConfig = paymentStatusConfig[booking.paymentStatus || 'UNPAID'];
                            return <Badge className={pConfig.className}>{pConfig.label}</Badge>;
                          })()}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right font-medium">
                          {formatCurrency(booking.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link to={`/bookings/${booking._id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/bookings/${booking._id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => setBookingIdToDelete(booking._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Cancel Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!bookingIdToDelete}
        onClose={() => setBookingIdToDelete(null)}
        onConfirm={handleDeleteConfirmed}
        loading={isDeleting}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? The booking status will be set to CANCELLED."
        confirmText="Cancel Booking"
        variant="destructive"
      />
    </>
  );
}
