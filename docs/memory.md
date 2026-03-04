# Project Memory

## Last Updated
2026-03-04

---

## Recent Changes — Currency Formatting & Display Standardization

### Architecture Decisions

1. **Unified formatting module** at `apps/client/src/lib/format.ts`
   - `formatCurrency(amount, currency?, locale?)` — full precision for tables, modals, detail views
   - `formatDisplayValue(raw, options?)` — abbreviated KPI display (K/M/B suffix)
   - Shared `DEFAULT_LOCALE = 'fr-MA'`, `DEFAULT_CURRENCY = 'MAD'` as fallbacks

2. **`CurrencyText` component** at `apps/client/src/components/common/CurrencyText.tsx`
   - Splits numeric amount from currency code, applies standardized de-emphasized styling to the code: `text-base font-medium text-muted-foreground/70`
   - Uses `useCurrency()` hook internally for dynamic currency

3. **`useCurrency()` hook** at `apps/client/src/hooks/useCurrency.ts`
   - Reads `defaultCurrency` from `GET /settings` via RTK Query cache (`useGetSettingsQuery`)
   - Maps currency codes → Intl locales: MAD→fr-MA, USD→en-US, EUR→fr-FR, GBP→en-GB
   - Falls back to MAD / fr-MA if settings not loaded yet

4. **`StatCard` component** refactored to pure presentational (accepts pre-formatted `value` + `suffix` props)

### Files Modified

| File | Change |
|---|---|
| `src/lib/format.ts` | **NEW** — merged from `formatCurrency.ts` + `formatDisplayValue.ts` |
| `src/lib/formatCurrency.ts` | **DELETED** — merged into `format.ts` |
| `src/lib/formatDisplayValue.ts` | **DELETED** — merged into `format.ts` |
| `src/components/common/CurrencyText.tsx` | **NEW** — reusable currency display component |
| `src/hooks/useCurrency.ts` | **NEW** — dynamic currency from settings |
| `src/features/dashboard/components/StatCard.tsx` | Refactored to pure presentational |
| `src/pages/dashboard/DashboardPage.tsx` | Uses `formatDisplayValue` + dynamic currency |
| `src/pages/bookings/BookingsPage.tsx` | `CurrencyText` in table |
| `src/pages/bookings/BookingDetailsPage.tsx` | `CurrencyText` in 6 locations |
| `src/pages/bookings/NewBookingPage.tsx` | Dynamic `formatCurrency(amount, currency, locale)` |
| `src/pages/bookings/EditBookingPage.tsx` | Same |
| `src/pages/apartments/ApartmentsPage.tsx` | `CurrencyText` in table |
| `src/pages/apartments/ApartmentDetailsPage.tsx` | `CurrencyText` for monthly rent |
| `src/features/dashboard/components/ActionList.tsx` | `CurrencyText` for pending payments |
| `src/features/dashboard/components/RevenueChart.tsx` | Dynamic `formatCurrency` in tooltip |
| `src/features/finance/components/NewPaymentModal.tsx` | Dynamic `formatCurrency` in toast + dialog |
| `src/pages/settings/GeneralSettingsPage.tsx` | Currency selector **hidden** (code preserved in comments) |

### Dependencies
- No new packages added
- Uses existing: `Intl.NumberFormat`, RTK Query, React.memo, `cn()` utility

### Verification
- `yarn tsc --noEmit` → ✅ zero errors
- Feature manually validated by user
