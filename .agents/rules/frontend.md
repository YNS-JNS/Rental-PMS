---
trigger: glob
globs: apps/client/**/*.{ts,tsx,js,jsx,css}
---

# Frontend Architecture & Strictness (React / Vite)

---

## 1. UI Quality & Strictness (Non-Negotiables)

- **Build small, responsive, and accessible (WCAG 2.1 AA) components.**
- **Explicitly handle all UX states:** loading (skeletons/spinners), empty (meaningful messaging), error (recovery actions), success (confirmation).
- **Prefer server-authoritative logic** for security-critical paths.
- **Minimize client-side interactivity scope and re-renders.** Code-split and lazy-load non-critical routes.

---

## 2. Feature-Based Directory Structure

- `src/components/ui/`: Strictly "Dumb components" (Shadcn UI: Buttons, Inputs). Absolutely **NO** business logic or API calls here.
- `src/components/common/`: Reusable cross-feature components (e.g., `<RoleGuard>`, `<Sidebar>`).
- `src/features/` (or `pages/`): "Smart components" managing complex display logic grouped by business domain.
- `src/store/`: Centralized Redux and RTK Query configuration.

---

## 3. Strict State Management & Separation of Concerns

- **Strictly separate UI** (rendering only) from state/business logic. No direct API calls inside UI components.
- **Server State (API):** Handled **EXCLUSIVELY** by RTK Query via API Slices (e.g., `usersApiSlice.ts`). You **MUST** use `providesTags` and `invalidatesTags` for caching and automated background refetching.
- **Client State (Global):** Handled by Redux Toolkit (e.g., `authSlice.ts` for user session).
- **Local State:** Use `useState` **ONLY** for ephemeral component UI state (e.g., toggling a menu, controlled form inputs).

---

## 4. Routing & Security (React Router)

- **Use nested layouts** (e.g., `ProtectedLayout` for auth checks).
- **Enforce strict RBAC** on UI elements using the proprietary `<RoleGuard allowedRoles={}>` component.

---

## 5. Styling Standards

- **Strict Mobile-First:** Default classes (`className="flex flex-col..."`) **MUST** target mobile screens. Use Tailwind prefixes (`md:`, `lg:`) for desktop scaling.
- **Tailwind Only:** Use exclusive Tailwind utility classes. **NO** custom `.css` or `.scss` files except for global config.
- **Loading States:** **ALWAYS** implement Skeleton Loaders or Spinners tied to RTK Query loading states (`isLoading`, `isFetching`).