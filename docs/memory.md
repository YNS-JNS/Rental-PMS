# Project Memory

## Last Updated
2026-03-13

---

## Current Branch
`feat/expense-frontend` — Phase 13 Full Implementation & Bug Fixes

---

## Recent Changes — Expense Management & Profitability Engine (Phase 13)

### Architecture Decisions (Backend & Frontend)

1. **Integrated Financial Models**: Enforced `OWNED_MONTHLY`, `OWNED_DAILY`, and `COMMISSION_BASED` models across the stack.
2. **Populated Response Reliance**: Refactored `ExpenseDataTable` to read `expense.apartment.name` directly from the API. Removed artificial lookup maps to ensure a single source of truth.
3. **Controlled Form State**: Enforced explicit `defaultValues` in React Hook Form for conditional fields (monthlyRent, commissionPercentage) to prevent registration and state synchronization bugs.
4. **Expense Module Domain Guards**: Enforced rules (e.g., zero expenses for commission-based properties) at both Server (Joi/Mongoose) and Client (Zod) levels.
5. **Profitability Service**: Implemented a standalone calculation engine using MongoDB aggregation to compute net profit per apartment.
6. **API Response Alignment**: Synchronized RTK Query slices with raw backend JSON responses by removing redundant `transformResponse` layers that were causing "undefined" data issues.

### Files Modified/Created

| File | Change |
|---|---|
| `packages/shared/src/schemas/*` | Modified — Consolidated Apartment and Expense schemas with cross-field validation |
| `apps/server/src/modules/apartments/profitability.service.ts` | **NEW** — Core profitability calculation engine |
| `apps/server/src/modules/expenses/*` | **NEW MODULE** — Complete backend service for financial tracking |
| `apps/client/src/features/expenses/*` | **NEW FEATURE** — Redux slices, components, and hooks for expense UI |
| `apps/client/src/features/apartments/components/ProfitabilityCard.tsx` | **NEW** — Data visualization for property financial performance |
| `apps/client/src/pages/expenses/ExpensesPage.tsx` | **NEW PAGE** — Central dashboard for expense management |

### Bug Fixes

- **Fix**: Resolved "Objects are not valid as a React child" crash in `ProfitabilityCard` by formatting `period` object to string.
- **Fix**: Resolved uncontrolled input warnings and value persistence issues in `ApartmentFormFields` via proper RHF registration.
- **Fix**: Resolved silent table data failure by matching API envelope structures in `expensesApiSlice`.

### Verification
- `packages/shared` → ✅ `yarn typecheck` passed
- `apps/server` & `apps/client` → ✅ `yarn tsc --noEmit` passed (0 errors in client)
- Git Stage → ✅ Committed and pushed to `feat/expense-frontend`
- Deployment → ✅ Manual walkthrough verified all flows in dev environment
