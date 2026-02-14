import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor = 'text-muted-foreground' }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate pr-2" title={title}>
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold break-words" title={String(value)}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 truncate" title={subtitle}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
