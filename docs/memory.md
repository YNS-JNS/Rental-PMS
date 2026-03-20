# Project Memory

## Last Updated
2026-03-20

---

## Current Branch
`feat/agency-expenses-logic` — Phase 15: UI Design System Refactor (in progress on same branch)

### Previous Branch
`feat/expense-frontend` — Phase 13 Full Implementation & Bug Fixes (merged)

---

## Recent Changes — Phase 16: Premium UI Polish

### Architecture Decisions

1. **Scroll Lock**: `h-dvh overflow-hidden` on layout root div (not body) — protects Radix UI portals (Dialog, Sheet, Toaster)
2. **Named Shadows**: `shadow-card`, `shadow-dialog`, `shadow-dropdown`, `shadow-card-hover` in `tailwind.config.js` — Stripe-style multi-layered
3. **Heading Letter-Spacing**: `h1,h2 { letter-spacing: -0.03em }` globally in CSS `@layer base`
4. **`page-enter` utility**: `animate-in fade-in slide-in-from-bottom-2 duration-300` wrapping all `<Outlet>` content for route transitions
5. **Global transition**: `button, a[href]` → `transition-colors duration-150` centralized in `index.css @layer utilities`
6. **`prefers-reduced-motion`**: Full override block disables all animations/transitions for accessibility
7. **TablePagination**: New reusable `components/common/TablePagination.tsx` with smart `buildPageRange` ellipsis logic — page state owned by `ExpenseDataTable`
8. **Client-side pagination**: `PAGE_SIZE = 10`, sliced in `ExpenseDataTable`; comment documents API migration path
9. **Collapsible filter bar**: `ExpensesPage` filter panel uses `max-h-0 → max-h-40 + opacity` CSS transition; active filter count badge on toggle button
10. **Shared `ApartmentForm`**: Extracted from `NewApartmentPage` and `EditApartmentPage` — 3 semantic sections (Identity / Business Model / Details) separated by `<Separator>`, sticky muted action bar

### Files Modified (Phase 16 — 9 files)

| File | Change |
|---|---|
| `tailwind.config.js` | Named shadows + heading letter-spacing |
| `src/index.css` | `.page-enter`, global transitions, reduced-motion |
| `components/layout/ProtectedLayout.tsx` | `h-dvh overflow-hidden` + `overflow-y-auto` main |
| `components/common/TablePagination.tsx` | NEW — reusable paginator |
| `features/expenses/components/ExpenseDataTable.tsx` | `overflow-x-auto`, client pagination |
| `pages/expenses/ExpensesPage.tsx` | Collapsible filter bar |
| `features/apartments/components/ApartmentForm.tsx` | NEW — shared form |
| `pages/apartments/NewApartmentPage.tsx` | Slimmed, uses ApartmentForm |
| `pages/apartments/EditApartmentPage.tsx` | Slimmed, uses ApartmentForm |

### Verification
- `apps/client` → ✅ `yarn tsc --noEmit` passed (0 errors, 15s)

---



### Design Direction
**Aesthetic:** *Utilitarian Precision* — Stripe/Linear-level minimalism. DFII 13/15.
**Font:** Inter (Google Fonts CDN), with `font-feature-settings: 'cv11' 'ss01'` for premium numeral rendering.

### Architecture Decisions

1. **`--agency` Semantic Token**: Replaced ALL hardcoded `violet-*` classes with `hsl(var(--agency))`. Single source of truth in `index.css` — changing the hue now updates 4 files automatically.
2. **Complete Token Layer**: Added `--success`, `--warning`, `--info`, `--agency`, `--sidebar` CSS variables with full light/dark variants. Tailwind config extended with matching semantic names.
3. **Linear Active State**: Sidebar active item uses `border-l-2 border-primary` left accent + `bg-accent text-foreground font-medium` — replaces the weak `bg-muted` pattern.
4. **Frosted-Glass Header**: `sticky top-0 z-40 bg-background/95 backdrop-blur-sm` — Stripe-style sticky header with translucency.
5. **Structural Skeleton**: `ExpensesPageSkeleton` simulates the actual page shape (header row, filter bar, 5 table rows) instead of a flat `h-[400px]` block.
6. **French Labels Fixed**: `PROPERTY_CATEGORIES` and `AGENCY_CATEGORIES` in `ExpenseFormDialog` translated to English (Eau→Water, Électricité→Electricity, etc.).
7. **`text-destructive` Convention**: All delete/error UI (dropdown items, icons) now use the semantic token — not raw `text-red-600`.

### Files Modified (Phase 15 — 10 files)

| File | Change |
|---|---|
| `tailwind.config.js` | `agency`, `success`, `warning`, `info`, `sidebar` tokens + `fontFamily` |
| `src/index.css` | Inter font, Slate palette, new semantic vars, fixed duplicate body rule |
| `components/layout/Sidebar.tsx` | Wordmark icon, Linear active state, semantic nav loop |
| `components/layout/Header.tsx` | Sticky + frosted glass, bg-sidebar Sheet |
| `components/layout/ProtectedLayout.tsx` | `bg-sidebar` token, Skeleton loader |
| `components/common/EmptyState.tsx` | Primary-tinted icon, `role="img"`, border-2 dashed |
| `pages/expenses/ExpensesPage.tsx` | `bg-agency` token, Alert error state, structural skeleton |
| `features/expenses/components/ExpenseFormDialog.tsx` | French→English labels, `text-agency` token, SelectSeparator |
| `features/expenses/components/ExpenseDataTable.tsx` | `bg-agency/10` token, `text-destructive`, `rounded-lg` |
| `features/expenses/components/ExpenseCategoryBadge.tsx` | All 10 agency categories use `bg-agency/10 text-agency` |

### Verification
- `apps/client` → ✅ `yarn tsc --noEmit` passed (0 errors, exit code 0, 28s)
- Git → ⏳ Not yet committed (next step)

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
