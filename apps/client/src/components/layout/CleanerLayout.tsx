import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectIsAuthenticated, setCredentials, logOut } from '@/features/auth/authSlice';
import { useGetMeQuery } from '@/features/auth/authApiSlice';
import { useLogoutMutation } from '@/features/auth/authApiSlice';
import { useEffect } from 'react';
import { UserRole } from '@rental/shared';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

/**
 * CleanerLayout
 * Minimal, mobile-first layout for CLEANER role users.
 * No sidebar, just a header with name + logout.
 */
export default function CleanerLayout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();
  const [logout] = useLogoutMutation();

  const { data: meData, isLoading: isMeLoading, isError: isMeError } = useGetMeQuery(undefined, {
    skip: isAuthenticated,
  });

  useEffect(() => {
    if (meData?.data?.user) {
      dispatch(setCredentials({ user: meData.data.user }));
    }
  }, [meData, dispatch]);

  // Loading spinner
  if (!isAuthenticated && isMeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated && (isMeError || !meData)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not a cleaner — redirect to dashboard
  if (user && user.role !== UserRole.CLEANER) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {}
    dispatch(logOut());
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Simple Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Cleaning Tasks</h1>
          {user && (
            <p className="text-xs text-muted-foreground">{user.name}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
