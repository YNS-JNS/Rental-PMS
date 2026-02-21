import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, Building2, Users } from 'lucide-react';
import { PageTitle } from '@/components/common/PageTitle';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { UserRole } from '@rental/shared';

const allSettingsNav = [
  {
    title: 'Profile & Security',
    href: '/settings/profile',
    icon: User,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: 'General Configuration',
    href: '/settings/general',
    icon: Building2,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Staff Management',
    href: '/settings/staff',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN],
  },
];

export default function SettingsLayout() {
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);

  // Filter tabs based on user role
  const settingsNav = allSettingsNav.filter(
    (item) => user && item.roles.includes(user.role)
  );

  // Redirect /settings to /settings/profile
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/profile" replace />;
  }

  return (
    <>
      <PageTitle title="Settings" />
      <div className="space-y-6">
        {/* Mobile: horizontal tabs */}
        <nav className="flex gap-2 overflow-x-auto md:hidden">
          {settingsNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>

        {/* Desktop: sidebar + content */}
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Settings Sidebar (desktop only) */}
          <aside className="hidden md:block w-64 shrink-0">
            <nav className="flex flex-col gap-1">
              {settingsNav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
