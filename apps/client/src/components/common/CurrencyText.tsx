import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface CurrencyTextProps {
  /** Numeric amount to display */
  amount: number;
  /** Classes applied to the amount portion (e.g. "text-2xl font-bold") */
  className?: string;
}

/**
 * Renders a currency value with the amount and the currency code
 * visually separated. The currency code is always styled with a de-emphasized,
 * standard appearance for consistency across the application.
 *
 * The currency is read dynamically from the application settings.
 *
 * @example
 * <CurrencyText amount={2500} />
 * // Renders: 2 500,00 <span class="...">MAD</span>
 */
export const CurrencyText = memo(function CurrencyText({
  amount,
  className,
}: CurrencyTextProps) {
  const { currency, locale } = useCurrency();

  // Format the number without currency symbol
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span className={cn('tabular-nums', className)}>
      {formattedAmount}{' '}
      <span className="text-base font-medium text-muted-foreground/70">
        {currency}
      </span>
    </span>
  );
});
