/**
 * Unified number & currency formatting utilities.
 *
 * Single source of truth for formatting rules across the app.
 * Currency code and locale are passed explicitly — sourced from the
 * useCurrency() hook at the component level.
 */

const DEFAULT_LOCALE = 'fr-MA';
const DEFAULT_CURRENCY = 'MAD';

// ─── Full Currency Format ────────────────────────────────────────────
/**
 * Format a number as currency — full precision.
 * Use for inline display in tables, modals, and detail pages.
 *
 * @param amount  - The numeric amount to format
 * @param currency - ISO 4217 currency code (default: 'MAD')
 * @param locale   - Intl locale string (default: 'fr-MA')
 *
 * @example
 * formatCurrency(2500)                    // "2 500,00 MAD"
 * formatCurrency(2500, 'USD', 'en-US')    // "$2,500.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Abbreviated Display Format ──────────────────────────────────────
/**
 * Format a numeric value for dashboard KPI cards.
 *
 * Applies Stripe/Shopify-style abbreviation rules:
 *  - >= 1B  → "1.2B"
 *  - >= 1M  → "1.5M"
 *  - >= 100K → "152.2K"
 *  - >= 10K  → full number, no decimals ("45 678")
 *  - < 10K  → full number, 2 decimals ("1 234,50")
 *
 * @example
 * formatDisplayValue(152160, { suffix: 'MAD' })
 * // => { value: '152,2K', suffix: 'MAD' }
 *
 * formatDisplayValue(42)
 * // => { value: '42,00' }
 */
export interface FormattedDisplay {
  value: string;
  suffix?: string;
}

export function formatDisplayValue(
  raw: number | string,
  options?: { suffix?: string; locale?: string },
): FormattedDisplay {
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const suffix = options?.suffix;
  const num = typeof raw === 'number' ? raw : parseFloat(String(raw));

  // If the input is not a valid number, return it as-is
  if (isNaN(num)) {
    return { value: String(raw), suffix };
  }

  const abs = Math.abs(num);
  let formatted: string;

  if (abs >= 1_000_000_000) {
    formatted = (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (abs >= 1_000_000) {
    formatted = (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (abs >= 100_000) {
    formatted = (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else if (abs >= 10_000) {
    formatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(num);
  } else {
    formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  return { value: formatted, suffix };
}
