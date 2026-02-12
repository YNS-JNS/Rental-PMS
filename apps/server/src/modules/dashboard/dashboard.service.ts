import {
  startOfMonth, endOfMonth, startOfDay, endOfDay,
  subMonths, format, getDaysInMonth, differenceInDays, max, min,
} from 'date-fns';
import { Apartment } from '../apartments/apartment.model';
import { Booking } from '../bookings/booking.model';
import { Payment } from '../finance/payment.model';

// ============================================
// Response Interfaces
// ============================================
interface RevenueChartEntry {
  month: string;
  revenue: number;
}

interface CheckInOutEntry {
  bookingId: string;
  tenantName: string;
  apartmentName: string;
  startDate: Date;
  endDate: Date;
}

interface PendingPaymentEntry {
  bookingId: string;
  tenantName: string;
  apartmentName: string;
  totalPrice: number;
  totalPaid: number;
  balanceDue: number;
  paymentStatus: string;
}

export interface DashboardStats {
  kpis: {
    totalApartments: number;
    availableApartments: number;
    activeBookings: number;
    monthlyRevenue: number;
    totalRevenue: number;
    occupancyRate: number;
  };
  actions: {
    checkInsToday: CheckInOutEntry[];
    checkOutsToday: CheckInOutEntry[];
    pendingPayments: PendingPaymentEntry[];
  };
  revenueChart: RevenueChartEntry[];
}

// ============================================
// Dashboard Service
// ============================================
export class DashboardService {

  /**
   * Get all dashboard statistics.
   * Uses Promise.all for parallel MongoDB queries.
   */
  static async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      kpis,
      actions,
      revenueChart,
    ] = await Promise.all([
      this.getKPIs(now, todayStart, todayEnd, monthStart, monthEnd),
      this.getActions(todayStart, todayEnd),
      this.getRevenueChart(now),
    ]);

    return { kpis, actions, revenueChart };
  }

  /**
   * KPIs: counts, revenue, occupancy rate
   */
  private static async getKPIs(
    now: Date,
    todayStart: Date,
    todayEnd: Date,
    monthStart: Date,
    monthEnd: Date,
  ) {
    const [
      totalApartments,
      activeBookingApartmentIds,
      activeBookings,
      monthlyRevenueResult,
      totalRevenueResult,
      monthBookings,
    ] = await Promise.all([
      // Total apartments
      Apartment.countDocuments(),

      // Apartment IDs with an active booking today (for availability calc)
      Booking.distinct('apartment', {
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
        startDate: { $lte: todayEnd },
        endDate: { $gte: todayStart },
      }),

      // Active bookings count
      Booking.countDocuments({
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
        startDate: { $lte: todayEnd },
        endDate: { $gte: todayStart },
      }),

      // Monthly revenue (from Payment collection = actual money received)
      Payment.aggregate([
        { $match: { date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Total revenue (all time)
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Bookings this month for occupancy calculation
      Booking.find({
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
        startDate: { $lte: monthEnd },
        endDate: { $gte: monthStart },
      }).select('apartment startDate endDate').lean(),
    ]);

    const availableApartments = totalApartments - activeBookingApartmentIds.length;
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Occupancy rate: total booked days / (totalApartments * daysInMonth) * 100
    const daysInMonth = getDaysInMonth(now);
    const totalPossibleDays = totalApartments * daysInMonth;

    let totalBookedDays = 0;
    if (totalPossibleDays > 0) {
      for (const booking of monthBookings) {
        // Clamp booking dates to current month boundaries
        const effectiveStart = max([new Date(booking.startDate), monthStart]);
        const effectiveEnd = min([new Date(booking.endDate), monthEnd]);
        const days = differenceInDays(effectiveEnd, effectiveStart);
        totalBookedDays += Math.max(0, days);
      }
    }

    const occupancyRate = totalPossibleDays > 0
      ? Math.round((totalBookedDays / totalPossibleDays) * 100)
      : 0;

    return {
      totalApartments,
      availableApartments: Math.max(0, availableApartments),
      activeBookings,
      monthlyRevenue,
      totalRevenue,
      occupancyRate,
    };
  }

  /**
   * Actions: check-ins/outs today, pending payments
   */
  private static async getActions(todayStart: Date, todayEnd: Date) {
    const [checkInsToday, checkOutsToday, pendingPayments] = await Promise.all([
      // Check-ins today (bookings starting today)
      Booking.find({
        status: { $in: ['CONFIRMED'] },
        startDate: { $gte: todayStart, $lte: todayEnd },
      })
        .populate('apartment', 'name')
        .populate('tenant', 'firstName lastName')
        .select('apartment tenant startDate endDate')
        .lean(),

      // Check-outs today (bookings ending today)
      Booking.find({
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
        endDate: { $gte: todayStart, $lte: todayEnd },
      })
        .populate('apartment', 'name')
        .populate('tenant', 'firstName lastName')
        .select('apartment tenant startDate endDate')
        .lean(),

      // Pending payments (active/completed bookings with unpaid balance)
      Booking.find({
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
        paymentStatus: { $in: ['UNPAID', 'PARTIALLY_PAID'] },
      })
        .populate('apartment', 'name')
        .populate('tenant', 'firstName lastName')
        .select('apartment tenant totalPrice totalPaid paymentStatus')
        .lean(),
    ]);

    return {
      checkInsToday: checkInsToday.map((b: any) => ({
        bookingId: b._id.toString(),
        tenantName: b.tenant ? `${b.tenant.firstName} ${b.tenant.lastName}` : '—',
        apartmentName: b.apartment?.name || '—',
        startDate: b.startDate,
        endDate: b.endDate,
      })),
      checkOutsToday: checkOutsToday.map((b: any) => ({
        bookingId: b._id.toString(),
        tenantName: b.tenant ? `${b.tenant.firstName} ${b.tenant.lastName}` : '—',
        apartmentName: b.apartment?.name || '—',
        startDate: b.startDate,
        endDate: b.endDate,
      })),
      pendingPayments: pendingPayments.map((b: any) => ({
        bookingId: b._id.toString(),
        tenantName: b.tenant ? `${b.tenant.firstName} ${b.tenant.lastName}` : '—',
        apartmentName: b.apartment?.name || '—',
        totalPrice: b.totalPrice,
        totalPaid: b.totalPaid || 0,
        balanceDue: b.totalPrice - (b.totalPaid || 0),
        paymentStatus: b.paymentStatus || 'UNPAID',
      })),
    };
  }

  /**
   * Revenue chart: last 6 months of revenue data.
   * Always returns exactly 6 entries, filling empty months with revenue: 0.
   */
  private static async getRevenueChart(now: Date): Promise<RevenueChartEntry[]> {
    // Build skeleton for last 6 months
    const skeleton: RevenueChartEntry[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      skeleton.push({
        month: format(monthDate, 'MMM'),
        revenue: 0,
      });
    }

    // Aggregate payments by month for the last 6 months
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));

    const result = await Payment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Merge aggregation results into skeleton
    for (const entry of result) {
      const entryDate = new Date(entry._id.year, entry._id.month - 1);
      const monthLabel = format(entryDate, 'MMM');
      const skeletonEntry = skeleton.find((s) => s.month === monthLabel);
      if (skeletonEntry) {
        skeletonEntry.revenue = entry.revenue;
      }
    }

    return skeleton;
  }
}
