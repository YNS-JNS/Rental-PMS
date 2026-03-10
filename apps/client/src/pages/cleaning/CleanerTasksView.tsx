import { useGetMyCleaningTasksQuery } from '@/features/cleaning/cleaningApiSlice';
import { useTaskStatusAction } from '@/features/cleaning/hooks/useTaskStatusAction';
import { CleaningTaskCard } from '@/features/cleaning/components/CleaningTaskCard';
import { CleaningEmptyState } from '@/features/cleaning/components/CleaningEmptyState';
import { Card, CardContent } from '@/components/ui/card';
import type { CleaningTaskStatusType } from '@rental/shared';
import { useCallback } from 'react';

/**
 * CleanerTasksView
 * Mobile-first smart container for CLEANER role.
 * Shows assigned tasks as large cards with one-tap status advancement.
 */
export default function CleanerTasksView() {
  const { data: tasks, isLoading, isError } = useGetMyCleaningTasksQuery();
  const { advanceStatus, isUpdating } = useTaskStatusAction();

  const handleAdvanceStatus = useCallback(
    (taskId: string, nextStatus: CleaningTaskStatusType) => {
      advanceStatus(taskId, nextStatus);
    },
    [advanceStatus],
  );

  // Loading skeleton (mobile-optimized)
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-red-600">Failed to load tasks</p>
        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return <CleaningEmptyState />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-medium">
        {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
      </p>

      {tasks.map((task) => (
        <CleaningTaskCard
          key={task._id}
          task={task}
          onAdvanceStatus={handleAdvanceStatus}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}
