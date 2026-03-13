import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { LayoutDashboard, Building2, CalendarDays, Users, Settings, DollarSign, UserCog, SprayCan, ReceiptText } from 'lucide-react';
import { RoleGuard } from '@/components/common/RoleGuard';
import { UserRole } from '@rental/shared';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    },
    {
      title: 'Properties',
      href: '/apartments',
      icon: Building2,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    },
    {
      title: 'Bookings',
      href: '/bookings',
      icon: CalendarDays,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    },
    {
      title: 'Tenants',
      href: '/tenants',
      icon: Users,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    },
    {
      title: 'Housekeeping',
      href: '/housekeeping',
      icon: SprayCan,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    },
    {
      title: 'Expenses',
      href: '/expenses',
      icon: ReceiptText,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    },
    {
      title: 'Finance',
      href: '/finance',
      icon: DollarSign,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      // Profile link — visible to ADMIN (who can't see full Settings)
      title: 'My Profile',
      href: '/settings/profile',
      icon: UserCog,
      roles: [UserRole.ADMIN],
    },
  ];

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Rental PMS
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <RoleGuard key={item.href} allowedRoles={item.roles}>
                <Link
                  to={item.href}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'w-full justify-start',
                    (item.href === '/settings' || item.href === '/finance' || item.href === '/housekeeping' || item.href === '/expenses'
                      ? location.pathname.startsWith(item.href)
                      : location.pathname === item.href)
                      ? 'bg-muted hover:bg-muted'
                      : 'hover:bg-transparent hover:underline',
                    'justify-start'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </RoleGuard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}