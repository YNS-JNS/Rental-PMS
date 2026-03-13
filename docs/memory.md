# Project Memory

## Last Updated
2026-03-13

---

## Current Branch
`feat/expense-backend` — Implementation of Phase 13

---

## Recent Changes — Expense Management & Profitability Engine (Phase 13)

### Architecture Decisions

1. **Economic Models Integration**: Enforced 3 specific models (`OWNED_MONTHLY`, `OWNED_DAILY`, `COMMISSION_BASED`) at the schema and service layers.
2. **Conditional Validation**: Used Zod `superRefine` in shared schemas to ensure `monthlyRent` or `commissionPercentage` are provided based on the selected `rentalType`.
3. **Expense Module Domain Guard**: Expenses are blocked for `COMMISSION_BASED` apartments as the agency should not incur costs for third-party properties.
4. **Profitability Service**: A dedicated service calculates net profit using MongoDB aggregation.
   - `OWNED_MONTHLY`: (Monthly Rent * Months) - Expenses.
   - `OWNED_DAILY`: (Booking Total) - Expenses.
   - `COMMISSION_BASED`: (Booking Total * Commission %).
5. **Route Precedence**: Placed dynamic profitability route before the ID resource route to prevent route matching conflicts in Express.

### Files Modified/Created

| File | Change |
|---|---|
| `packages/shared/src/schemas/apartment.schema.ts` | Modified — Added `RentalType` enum & conditional Zod validation |
| `packages/shared/src/schemas/expense.schema.ts` | **NEW** — Shared expense schema and category enums |
| `apps/server/src/modules/apartments/apartment.model.ts` | Modified — Added financial model fields |
| `apps/server/src/modules/apartments/profitability.service.ts` | **NEW** — Financial calculation engine |
| `apps/server/src/modules/expenses/*` | **NEW MODULE** — Model, Service, Controller, Routes for expense CRUD |
| `apps/server/src/app.ts` | Modified — Mounted expense routes at `/api/expenses` |

### Verification
- `yarn typecheck` on `packages/shared` → ✅ Passed
- `yarn tsc --noEmit` on `apps/server` → ✅ Passed (1 pre-existing error in settings.service.ts preserved)
- Git → ✅ Committed and pushed to `feat/expense-backend`
