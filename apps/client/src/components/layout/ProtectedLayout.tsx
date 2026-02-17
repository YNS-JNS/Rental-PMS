import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated, setCredentials } from '@/features/auth/authSlice';
import { useGetMeQuery } from '@/features/auth/authApiSlice';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { useEffect } from 'react';

export default function ProtectedLayout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  // Rehydrate session from cookies on page refresh.
  // If cookies are still valid but Redux state is lost (F5), this restores the session.
  const { data: meData, isLoading: isMeLoading, isError: isMeError } = useGetMeQuery(undefined, {
    skip: isAuthenticated, // Skip if already authenticated (no need to call /me)
  });

  // When /me succeeds, restore user in Redux
  useEffect(() => {
    if (meData?.data?.user) {
      dispatch(setCredentials({ user: meData.data.user }));
    }
  }, [meData, dispatch]);

  // Still loading session check — show spinner
  if (!isAuthenticated && isMeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated and /me failed or hasn't been called
  if (!isAuthenticated && (isMeError || !meData)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated — render layout
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar - Hidden on mobile, Visible on Desktop (md) */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-gray-50/40">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 space-y-4 p-8 pt-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}