import { useGetDashboardStatsQuery } from '@/features/dashboard/dashboardApiSlice';
import { formatCurrency } from '@/lib/formatCurrency';
import {
  Building2,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  Percent,
  AlertTriangle,
} from 'lucide-react';

// UI Components
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageTitle } from '@/components/common/PageTitle';

// Dashboard Widgets
import { StatCard } from '@/features/dashboard/components/StatCard';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { ActionList, PendingPaymentsList } from '@/features/dashboard/components/ActionList';

// RBAC
import { RoleGuard } from '@/components/common/RoleGuard';
import { UserRole } from '@rental/shared';

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useGetDashboardStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // ============================
  // Error State
  // ============================
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <PageTitle title="Dashboard Error" />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Service Unavailable</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Unable to load dashboard data. Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  // ============================
  // Loading State (Skeletons)
  // ============================
  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <PageTitle title="Dashboard" />
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

        {/* KPI Skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart + Actions Skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
          </Card>
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // Main Dashboard
  // ============================
  const { kpis, actions, revenueChart } = stats;

  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" />
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* =============================== */}
      {/* KPI Cards                        */}
      {/* =============================== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Financial KPIs — SUPER_ADMIN only */}
        <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(kpis.totalRevenue)}
            subtitle="All-time earnings"
            icon={CreditCard}
            iconColor="text-green-500"
          />
        </RoleGuard>
        <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(kpis.monthlyRevenue)}
            subtitle="This month"
            icon={TrendingUp}
            iconColor="text-blue-500"
          />
        </RoleGuard>

        {/* Operational KPIs — All admins */}
        <StatCard
          title="Occupancy Rate"
          value={`${kpis.occupancyRate}%`}
          subtitle="This month"
          icon={Percent}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Active Bookings"
          value={kpis.activeBookings}
          subtitle="Currently active"
          icon={CalendarCheck}
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Properties"
          value={kpis.totalApartments}
          subtitle={`${kpis.availableApartments} available today`}
          icon={Building2}
          iconColor="text-violet-500"
        />
      </div>

      {/* =============================== */}
      {/* Chart + Actions                  */}
      {/* =============================== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart — SUPER_ADMIN only */}
        <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
          <div className="lg:col-span-4">
            <RevenueChart data={revenueChart} />
          </div>
        </RoleGuard>

        {/* Today's Actions — All admins */}
        <div className="lg:col-span-3 space-y-4">
          <ActionList
            title="🔑 Check-ins Today"
            items={actions.checkInsToday}
            emptyMessage="No check-ins today"
          />
          <ActionList
            title="🚪 Check-outs Today"
            items={actions.checkOutsToday}
            emptyMessage="No check-outs today"
          />
        </div>
      </div>

      {/* =============================== */}
      {/* Pending Payments — SUPER_ADMIN   */}
      {/* =============================== */}
      <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
        <PendingPaymentsList items={actions.pendingPayments} />
      </RoleGuard>
    </div>
  );
}