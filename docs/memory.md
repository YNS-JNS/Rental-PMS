# Project Memory

## Last Updated
2026-03-09

---

## Current Branch
`feat/smart-housekeeping-backend` — Implementation of Phase 12

---

## Recent Changes — Smart Housekeeping & Turnover Management (Phase 12)

### Architecture Decisions

1. **Dedicated CleaningTask Entity**: Separated cleaning from Booking. Housekeeping now has its own lifecycle, assignment capability, and immutable history.
2. **Automated Lifecycle Hooks**: Integrated directly into `BookingService`.
   - `CONFIRMED` booking → Auto-creates `CleaningTask`.
   - `CANCELLED` booking → Auto-deletes `CleaningTask`.
3. **Immutable History Pattern**: Status transitions are logged in an append-only `history[]` array. Transitions to backward states (e.g., `DONE -> TO_DO`) are restricted to `ADMIN` or `SUPER_ADMIN` at the service layer.
4. **Denormalized Apartment Data**: `apartmentId` is stored on `CleaningTask` for performant dashboard queries without requiring deep population through Booking.

### Files Modified/Created

| File | Change |
|---|---|
| `packages/shared/src/schemas/cleaning.schema.ts` | **NEW** — Shared types, Zod schemas, & interfaces |
| `apps/server/src/modules/cleaning/cleaningTask.model.ts` | **NEW** — Mongoose model with embedded history & unique indexed booking |
| `apps/server/src/modules/cleaning/cleaningTask.service.ts` | **NEW** — Business logic for task lifecycle & automation |
| `apps/server/src/modules/cleaning/cleaningTask.controller.ts` | **NEW** — HTTP layer with input validation & error mapping |
| `apps/server/src/modules/cleaning/cleaningTask.routes.ts` | **NEW** — RBAC-protected endpoints at `/api/cleaning-tasks` |
| `apps/server/src/modules/bookings/booking.service.ts` | Modified — Added `create`/`update` hooks for task sync |
| `apps/server/src/app.ts` | Modified — Mounted new routes (preserved legacy at `/api/tasks`) |
| `packages/shared/src/index.ts` | Modified — Exported new cleaning schema |

### Verification
- `yarn tsc --noEmit` on `apps/server` → ✅ Successfully passed (zero new errors)
- Shared package rebuild → ✅ Successful

---

## Previous Changes — Currency Formatting & Display Standardization
*(Phase 11 — 2026-03-04)*

### Architecture Decisions
1. **Unified formatting module** at `apps/client/src/lib/format.ts`
2. **`CurrencyText` component** at `apps/client/src/components/common/CurrencyText.tsx`
3. **`useCurrency()` hook** for reading settings from RTK Query cache.
