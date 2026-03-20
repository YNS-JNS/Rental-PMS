import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users,
  Settings,
  DollarSign,
  UserCog,
  SprayCan,
  ReceiptText,
  Landmark,
} from 'lucide-react';
import { RoleGuard } from '@/components/common/RoleGuard';
import { UserRole } from '@rental/shared';

// ── Types ─────────────────────────────────────────────────────────────────

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  /** Routes that should activate this item if the path starts with them */
  prefixMatch?: boolean;
}

// ── Navigation Definition ────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
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
    prefixMatch: true,
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: CalendarDays,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    prefixMatch: true,
  },
  {
    title: 'Tenants',
    href: '/tenants',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    prefixMatch: true,
  },
  {
    title: 'Housekeeping',
    href: '/housekeeping',
    icon: SprayCan,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    prefixMatch: true,
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: ReceiptText,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    prefixMatch: true,
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: DollarSign,
    roles: [UserRole.SUPER_ADMIN],
    prefixMatch: true,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: [UserRole.SUPER_ADMIN],
    prefixMatch: true,
  },
  {
    title: 'My Profile',
    href: '/settings/profile',
    icon: UserCog,
    roles: [UserRole.ADMIN],
  },
];

// ── Component ─────────────────────────────────────────────────────────────

/**
 * Sidebar
 *
 * Renders the vertical navigation. Active items are determined by
 * exact or prefix matching against the current pathname.
 *
 * Design decisions:
 * - Active state: left accent border (border-l-2) + primary text weight.
 *   This is Stripe / Linear's pattern: clear without heavy backgrounds.
 * - Inactive hover: subtle accent bg with foreground text — smooth, no underline.
 * - Brand wordmark: icon + text pair for desktop sidebar.
 */
export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  /** Returns true if this nav item is the active route */
  const isActive = (item: NavItem): boolean => {
    if (item.prefixMatch) {
      return location.pathname.startsWith(item.href);
    }
    return location.pathname === item.href;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* ── Brand Wordmark ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
          <Landmark className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
        </div>
        <span className="font-semibold text-sm tracking-tight text-foreground">
          Rental PMS
        </span>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Main navigation">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <RoleGuard key={item.href} allowedRoles={item.roles}>
                <li>
                  <Link
                    to={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      // Base layout
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150',
                      // Active state — left border accent + stronger text
                      active
                        ? 'bg-accent text-foreground font-medium border-l-2 border-primary rounded-l-none ml-[-1px] pl-[calc(0.75rem-1px)]'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground font-normal border-l-2 border-transparent ml-[-1px] pl-[calc(0.75rem-1px)]'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors duration-150',
                        active ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    />
                    {item.title}
                  </Link>
                </li>
              </RoleGuard>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer slot (version / copyright) ───────────────────────────── */}
      <div className="px-5 py-3 border-t border-border shrink-0">
        <p className="text-xs text-muted-foreground">v2.0 — Phase 14</p>
      </div>
    </div>
  );
}