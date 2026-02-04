import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentToken } from '@/features/auth/authSlice';
import { Sidebar } from './Sidebar';
import Header from './Header';

export default function ProtectedLayout() {
  const token = useAppSelector(selectCurrentToken);
  const location = useLocation();

  // 1. Security Check
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Layout Structure
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}