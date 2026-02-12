/**
 * Format a number as MAD (Dirham Marocain) currency.
 * Uses Intl.NumberFormat with 'fr-MA' locale.
 *
 * @example
 * formatCurrency(2500)    // "2 500,00 MAD"
 * formatCurrency(0)       // "0,00 MAD"
 * formatCurrency(1234.5)  // "1 234,50 MAD"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
