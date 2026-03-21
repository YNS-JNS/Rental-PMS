import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated, setCredentials } from '@/features/auth/authSlice';
import { useGetMeQuery } from '@/features/auth/authApiSlice';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

/**
 * ProtectedLayout — App Shell
 *
 * Scroll Architecture (Premium SaaS pattern):
 * ─────────────────────────────────────────────────────────────────────────
 * The root <div> uses `h-dvh overflow-hidden` to lock the viewport. This
 * means the browser scrollbar NEVER appears on the shell itself.
 *
 * WHY h-dvh over h-screen:
 *   h-screen uses `100vh` which ignores mobile browser chrome (address bar).
 *   h-dvh uses the newer CSS `100dvh` unit which adapts to the real visual
 *   viewport — critical for mobile Safari / Chrome where the address bar
 *   collapses on scroll.
 *
 * WHY overflow-hidden on the root <div>, NOT on <body>:
 *   Dialog, Sheet, Toaster, and Tooltip primitives from Radix UI all portal
 *   their DOM nodes directly into document.body. Setting overflow-hidden on
 *   <body> would clip those portals on iOS and some desktop browsers.
 *   By locking the layout div instead, portals remain unaffected.
 *
 * Independent Scroll Zone:
 *   The <main> element uses `flex-1 overflow-y-auto` to create its own
 *   independent scroll context. Only the content area scrolls — the sidebar
 *   and header stay pinned at all times.
 * ─────────────────────────────────────────────────────────────────────────
 */
export default function ProtectedLayout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  // Rehydrate session from cookies on page refresh.
  // Skip if already authenticated to avoid redundant /me calls.
  const {
    data: meData,
    isLoading: isMeLoading,
    isError: isMeError,
  } = useGetMeQuery(undefined, { skip: isAuthenticated });

  useEffect(() => {
    if (meData?.data?.user) {
      dispatch(setCredentials({ user: meData.data.user }));
    }
  }, [meData, dispatch]);

  // Loading: show a branded skeleton shell — avoids layout shift
  if (!isAuthenticated && isMeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  }

  // Redirect unauthenticated visitors; preserve the intended destination
  if (!isAuthenticated && (isMeError || !meData)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Authenticated: render the full app shell ───────────────────────────
  return (
    /*
     * Root shell — locks the viewport. h-dvh + overflow-hidden means:
     *   - No outer page scroll (premium SaaS feel)
     *   - Dialog/Sheet/Toaster portals remain unaffected (they target body)
     */
    <div className="flex h-dvh overflow-hidden bg-background">

      {/* ── Desktop Sidebar — fixed height, never scrolls ─────────────── */}
      {/* Hidden on mobile; Header's Sheet handles mobile navigation.      */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-border h-full shrink-0">
        <Sidebar className="h-full" />
      </aside>

      {/* ── Main Column — owns the scroll context ────────────────────── */}
      {/* min-w-0 prevents flex children from overflowing their container. */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header stays pinned — it does NOT scroll with the content. */}
        <Header />

        {/*
         * Content scroll zone:
         *   flex-1        → fills remaining vertical height after Header
         *   overflow-y-auto → only THIS area scrolls; sidebar/header stay fixed
         * The page-enter class adds a subtle fade+slide animation on route change.
         */}
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6">
          <div className="space-y-4 page-enter">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}