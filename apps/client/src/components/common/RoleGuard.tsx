import { ReactNode } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { UserRole } from '@rental/shared';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  /** Optional fallback content when role is not allowed */
  fallback?: ReactNode;
}

/**
 * RoleGuard Component
 * Renders children only if the current user's role is in the allowedRoles list.
 * Used for frontend-level access control (backend enforces 403 independently).
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const user = useAppSelector(selectCurrentUser);

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
