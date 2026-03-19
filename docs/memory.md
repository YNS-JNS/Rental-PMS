# Project Memory

## Last Updated
2026-03-18

---

## Current Branch
`feat/agency-expenses-logic` — Phase 14: Agency-Wide Expenses + Smart Frontend Integration

### Previous Branch
`feat/expense-frontend` — Phase 13 Full Implementation & Bug Fixes (merged)

---

## Recent Changes — Frontend Smart Expense Form & Agency UI (Phase 14b)

### Architecture Decisions

1. **`isAgencyExpense` via `useWatch`**: Reactive agency state is derived from the watched `apartmentId` form field using `useWatch()`. This avoids performance issues from `form.watch()` global subscriptions.
2. **Category Auto-Reset**: Switching apartment type (agency ↔ property) automatically resets `category` to a sensible default (`SOFTWARE` for agency, `OTHER` for property) via a `useEffect` on `isAgencyExpense`.
3. **`null` on Edit Conversion**: The hook sends `{ apartmentId: null }` explicitly when converting APARTMENT→AGENCY in edit mode, triggering the backend `$unset` path. For create, the field is omitted entirely.
4. **Tooltip via native `title`**: No `@/components/ui/tooltip` exists in the project. COMMISSION_BASED disabled items use a native HTML `title` attribute + `Ban` icon for the constraint explanation.
5. **`agencyOnly` Toggle**: A violet `<Button>` toggle in `ExpensesPage` clears the apartment filter when activated (the two filters are mutually exclusive). The filter appends `?agencyOnly=true` to the API query.
6. **English Translation**: All expense-related UI components (labels, placeholders, toasts, table headers) have been translated from French to English per user request.

### Files Modified (Frontend — 7 files)

| File | Change |
|---|---|
| `expense.types.ts` | Modified — `agencyOnly?: boolean` added to `ExpenseFilters` |
| `expensesApiSlice.ts` | Modified — `agencyOnly` query param, typed `null` in update mutation |
| `useExpenseForm.ts` | Modified — `useWatch`, `isAgencyExpense`, category reset, null on edit conversion, `AGENCY_SENTINEL` export |
| `ExpenseCategoryBadge.tsx` | Modified — 19 categories, French labels, distinct colour palettes |
| `ExpenseFormDialog.tsx` | Modified — agency static option, disabled COMMISSION_BASED, dynamic category list |
| `ExpenseDataTable.tsx` | Modified — `AgencyExpenseBadge` sub-component for AGENCY rows |
| `ExpensesPage.tsx` | Modified — `agencyOnly` toggle, all 19 category filters, contextual card title |

### Verification
- `apps/client` → ✅ `yarn tsc --noEmit` passed (0 errors, exit code 0)
- Git → ✅ Committed `ea1b0a8` to `feat/agency-expenses-logic`

---

## Backend Changes — Agency-Wide Expenses Domain Logic (Phase 14a — commit 07f869f)

### Architecture Decisions (Backend)

1. **ExpenseType Discriminator**: `expenseType: 'APARTMENT' | 'AGENCY'` field in model + schema. Set by service layer only. Default `'APARTMENT'` for legacy safety.
2. **Expanded Category Enum**: 5 → 19 values (apartment-specific + agency-wide + OTHER).
3. **Stale ObjectId Fix**: `update()` uses `$unset` to clear `apartment` on AGENCY conversion.
4. **agencyOnly Filter**: Indexed `{ expenseType: 'AGENCY' }` query vs. null-check.
5. **Domain Guard Retained**: COMMISSION_BASED → HTTP 400.

### Known Pre-existing Issue
- `apps/server/src/modules/settings/settings.service.ts:23` — pre-existing `string | undefined` type error. Not in scope.

### Future Scope
- **Profitability Engine**: Agency expenses should be proportionally distributed across apartments in `profitability.service.ts`.


---

## Current Branch
`feat/agency-expenses-logic` — Phase 14: Agency-Wide Expenses (Frais de structure)

### Previous Branch
`feat/expense-frontend` — Phase 13 Full Implementation & Bug Fixes (merged)

---

## Recent Changes — Agency-Wide Expenses Domain Logic (Phase 14)

### Architecture Decisions

1. **ExpenseType Discriminator**: Added `expenseType: 'APARTMENT' | 'AGENCY'` field to Mongoose model and shared schema. Set automatically by the service layer — never client-provided. Default `'APARTMENT'` for backward-compat with legacy documents.
2. **Expanded Category Enum**: `ExpenseCategory` expanded from 5 → 19 values. Apartment-specific (`WATER`, `ELECTRICITY`, `GAS`, `INTERNET`, `CLEANING`, `MAINTENANCE`, `RENOVATION`, `FURNITURE`). Agency-wide (`SOFTWARE`, `MARKETING`, `INSURANCE`, `ACCOUNTING`, `LEGAL`, `OFFICE_SUPPLIES`, `SALARIES`, `TRAVEL`, `EQUIPMENT`, `TAXES`). Catch-all: `OTHER`.
3. **Stale ObjectId Fix**: `update()` uses MongoDB `$unset` to clear the `apartment` field when converting an APARTMENT expense to AGENCY type, preventing silent stale reference bugs.
4. **agencyOnly Filter**: `GET /api/expenses?agencyOnly=true` uses indexed `{ expenseType: 'AGENCY' }` query instead of null-check on `apartment`.
5. **Domain Guard Retained**: COMMISSION_BASED apartments still rejected with HTTP 400 on create/update.
6. **SOLID Compliance**: Extracted `_assertApartmentEligible()` and `_resolveExpenseType()` as separate private methods (SRP). Existing APARTMENT logic unchanged (OCP).

### Files Modified

| File | Change |
|---|---|
| `packages/shared/src/schemas/expense.schema.ts` | Modified — ExpenseType enum, 19-value ExpenseCategory, nullable apartmentId |
| `apps/server/src/modules/expenses/expense.model.ts` | Modified — expenseType field, compound index on expenseType+date, 19 categories |
| `apps/server/src/modules/expenses/expense.service.ts` | Modified — domain guards, $unset fix, agencyOnly filter, ExpenseFilters type |
| `apps/server/src/modules/expenses/expense.controller.ts` | Modified — agencyOnly query param, updated Swagger JSDoc |
| `apps/server/src/modules/expenses/expense.routes.ts` | Modified — ExpenseInput/Expense schema split, nullable apartmentId, agencyOnly |

### Known Pre-existing Issue (Not in scope)
- `apps/server/src/modules/settings/settings.service.ts:23` — `string | undefined` assigned to `string` field. Pre-existed on `feat/expense-frontend`. Needs separate fix.

### Future Scope
- **Profitability Engine**: Agency expenses should be distributed proportionally across apartments in `profitability.service.ts`. Currently only apartment-specific expenses are counted.

### Verification
- `packages/shared` → ✅ `yarn typecheck` passed (0 errors)
- `apps/server` → ✅ Expense module files compile cleanly; 1 pre-existing unrelated error in `settings.service.ts`
- Git → ✅ Committed to `feat/agency-expenses-logic` (commit `07f869f`)
