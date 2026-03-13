import { TrendingUp, TrendingDown, DollarSign, CircleDollarSign, AlertCircle } from 'lucide-react';
import { useGetProfitabilityQuery } from '@/features/apartments/apartmentsApiSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyText } from '@/components/common/CurrencyText';

interface ProfitabilityCardProps {
  apartmentId: string;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  amount: number;
  className?: string;
}

/** Single financial stat display — extracted for DRY. */
function StatItem({ icon, label, amount, className }: StatItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
        {icon}
        {label}
      </span>
      <span className={`text-xl font-bold ${className}`}>
        <CurrencyText amount={amount} />
      </span>
    </div>
  );
}

/**
 * ProfitabilityCard
 * Displays the financial summary for a single apartment.
 * Fetches independently — does not block the parent page render.
 */
export function ProfitabilityCard({ apartmentId }: ProfitabilityCardProps) {
  const { data, isLoading, isError } = useGetProfitabilityQuery(apartmentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-2 pt-6 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          Profitability data unavailable for this property.
        </CardContent>
      </Card>
    );
  }

  const isProfit = data.netProfit >= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {isProfit
              ? <TrendingUp className="h-4 w-4 text-green-600" />
              : <TrendingDown className="h-4 w-4 text-red-500" />}
            Profitability Report
          </CardTitle>
          <span className="text-xs text-muted-foreground font-normal">
            {new Date(data.period.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {' - '}
            {new Date(data.period.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
            {' · '} 
            {data.rentalType.replace(/_/g, ' ')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 divide-x">
          <StatItem
            icon={<CircleDollarSign className="h-3 w-3" />}
            label="Total Revenue"
            amount={data.totalRevenue}
            className="text-foreground"
          />
          <div className="pl-4">
            <StatItem
              icon={<DollarSign className="h-3 w-3" />}
              label="Total Expenses"
              amount={data.totalExpenses}
              className="text-red-600"
            />
          </div>
          <div className="pl-4">
            <StatItem
              icon={isProfit
                ? <TrendingUp className="h-3 w-3 text-green-600" />
                : <TrendingDown className="h-3 w-3 text-red-500" />}
              label="Net Profit"
              amount={data.netProfit}
              className={isProfit ? 'text-green-600' : 'text-red-600'}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
