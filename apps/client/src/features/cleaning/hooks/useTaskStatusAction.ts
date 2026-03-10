import { useCallback } from 'react';
import type { CleaningTaskStatusType } from '@rental/shared';
import { useUpdateCleaningStatusMutation } from '../cleaningApiSlice';
import { cleaningApiSlice } from '../cleaningApiSlice';
import { useToast } from '@/hooks/use-toast';
import { getStatusLabel } from '../utils/cleaning.helpers';
import { useAppDispatch } from '@/app/hooks';

/**
 * useTaskStatusAction
 * Encapsulates the status mutation with optimistic UI + toast feedback.
 *
 * Fix 6: True optimistic update via manual cache patching.
 * On mutation start, the cached task status is instantly updated.
 * On error, the previous cache state is restored (rollback).
 */
export function useTaskStatusAction() {
  const [updateStatus, { isLoading: isUpdating }] = useUpdateCleaningStatusMutation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const advanceStatus = useCallback(
    async (taskId: string, nextStatus: CleaningTaskStatusType, note?: string) => {
      // Optimistic cache patches — patch both LIST and MY_LIST queries
      const patchList = dispatch(
        cleaningApiSlice.util.updateQueryData('getCleaningTasks', undefined, (draft) => {
          const task = draft.find((t) => t._id === taskId);
          if (task) task.status = nextStatus;
        }),
      );
      const patchMyList = dispatch(
        cleaningApiSlice.util.updateQueryData('getMyCleaningTasks', undefined, (draft) => {
          const task = draft.find((t) => t._id === taskId);
          if (task) task.status = nextStatus;
        }),
      );

      try {
        await updateStatus({ id: taskId, status: nextStatus, note }).unwrap();
        toast({
          title: 'Status updated',
          description: `Task moved to ${getStatusLabel(nextStatus)}.`,
        });
      } catch (error: unknown) {
        // Rollback on failure
        patchList.undo();
        patchMyList.undo();

        const message =
          error && typeof error === 'object' && 'data' in error
            ? (error as { data?: { message?: string } }).data?.message
            : 'Failed to update status';
        toast({
          variant: 'destructive',
          title: 'Update failed',
          description: message ?? 'An unexpected error occurred.',
        });
      }
    },
    [updateStatus, toast, dispatch],
  );

  return { advanceStatus, isUpdating } as const;
}
