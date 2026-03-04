import { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  suffix?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  /** Raw value shown on hover for exact precision */
  tooltipValue?: string;
}

export const StatCard = memo(function StatCard({
  title,
  value,
  suffix,
  subtitle,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  tooltipValue,
}: StatCardProps) {
  const isLongValue = value.length > 8;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className="text-sm font-medium text-muted-foreground truncate pr-2"
          title={title}
        >
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="flex items-baseline gap-1.5"
          title={tooltipValue ? `Valeur exacte: ${tooltipValue}` : undefined}
        >
          <span
            className={cn(
              'font-bold tabular-nums tracking-tight',
              isLongValue ? 'text-2xl' : 'text-3xl',
            )}
          >
            {value}
          </span>
          {suffix && (
            <span className="text-base font-medium text-muted-foreground/70">
              {suffix}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
});