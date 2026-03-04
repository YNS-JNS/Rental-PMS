import { useGetSettingsQuery } from '@/features/settings/settingsApiSlice';

/**
 * Maps ISO 4217 currency codes to the most appropriate Intl locale
 * for number formatting (decimal/grouping separators, symbol placement).
 */
const CURRENCY_LOCALE_MAP: Record<string, string> = {
  MAD: 'fr-MA',
  USD: 'en-US',
  EUR: 'fr-FR',
  GBP: 'en-GB',
};

const FALLBACK_CURRENCY = 'MAD';
const FALLBACK_LOCALE = 'fr-MA';

/**
 * Read the default currency from the application settings (RTK Query cache).
 *
 * Falls back to MAD / fr-MA if settings haven't been fetched yet.
 * Once settings are loaded, all consumers re-render automatically.
 *
 * @example
 * const { currency, locale } = useCurrency();
 * // currency = 'USD', locale = 'en-US'
 */
export function useCurrency() {
  const { data } = useGetSettingsQuery();
  const currency = data?.data?.defaultCurrency || FALLBACK_CURRENCY;
  const locale = CURRENCY_LOCALE_MAP[currency] ?? FALLBACK_LOCALE;

  return { currency, locale } as const;
}
