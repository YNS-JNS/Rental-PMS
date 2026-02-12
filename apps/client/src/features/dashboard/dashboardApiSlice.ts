import { apiSlice } from '@/features/api/apiSlice';

/**
 * Dashboard Stats response interface
 */
interface RevenueChartEntry {
  month: string;
  revenue: number;
}

interface CheckInOutEntry {
  bookingId: string;
  tenantName: string;
  apartmentName: string;
  startDate: string;
  endDate: string;
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

/**
 * Dashboard API Slice
 * Injects dashboard endpoint into the main apiSlice.
 */
export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard',
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApiSlice;
