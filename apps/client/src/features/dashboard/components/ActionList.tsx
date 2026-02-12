import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatCurrency';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

// ============================================
// Types
// ============================================
interface CheckInOutItem {
  bookingId: string;
  tenantName: string;
  apartmentName: string;
}

interface PendingPaymentItem {
  bookingId: string;
  tenantName: string;
  apartmentName: string;
  balanceDue: number;
  paymentStatus: string;
}

// ============================================
// Check-ins / Check-outs List
// ============================================
interface ActionListProps {
  title: string;
  items: CheckInOutItem[];
  emptyMessage?: string;
}

export function ActionList({ title, items, emptyMessage = 'All caught up! 🎉' }: ActionListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.bookingId}
                to={`/bookings/${item.bookingId}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium">{item.tenantName}</p>
                  <p className="text-xs text-muted-foreground">{item.apartmentName}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Pending Payments List
// ============================================
interface PendingPaymentsListProps {
  items: PendingPaymentItem[];
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  UNPAID: { label: 'Unpaid', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  PARTIALLY_PAID: { label: 'Partial', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
};

export function PendingPaymentsList({ items }: PendingPaymentsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pending Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            All payments up to date! 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const statusConfig = paymentStatusConfig[item.paymentStatus] || paymentStatusConfig.UNPAID;
              return (
                <Link
                  key={item.bookingId}
                  to={`/bookings/${item.bookingId}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{item.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{item.apartmentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-red-500">
                      {formatCurrency(item.balanceDue)}
                    </span>
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
