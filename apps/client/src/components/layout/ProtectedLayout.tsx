import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentToken } from '@/features/auth/authSlice';

/**
 * PROTECTED LAYOUT (Route Guard)
 * Acts as a gatekeeper for private routes.
 * * Logic:
 * 1. Checks for a valid token in the Redux store.
 * 2. If present: Renders the child routes (Outlet).
 * 3. If missing: Redirects to /login, preserving the attempted location in state.
 */
export default function ProtectedLayout() {
  const token = useAppSelector(selectCurrentToken);
  const location = useLocation();

  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Later, we will add the Sidebar and Header here.
        For now, we just render the content.
      */}
      <Outlet />
    </div>
  );
}