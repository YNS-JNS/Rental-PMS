import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { UserRole } from '@rental/shared';
import AdminCleaningView from './AdminCleaningView';
import CleanerTasksView from './CleanerTasksView';

/**
 * CleaningTasksPage
 * Entry point for the Housekeeping feature.
 * Delegates to the correct view based on the user's role.
 */
export default function CleaningTasksPage() {
  const user = useAppSelector(selectCurrentUser);

  // Guard: don't render until role is resolved (prevents flash of wrong view)
  if (!user) {
    return null;
  }

  if (user.role === UserRole.CLEANER) {
    return <CleanerTasksView />;
  }

  // SUPER_ADMIN & ADMIN both get the admin view
  return <AdminCleaningView />;
}
