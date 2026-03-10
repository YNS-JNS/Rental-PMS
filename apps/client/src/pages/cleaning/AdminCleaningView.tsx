import { useState, useCallback } from 'react';
import {
  useGetCleaningTasksQuery,
  useAssignCleanerMutation,
  useDeleteCleaningTaskMutation,
  useCreateCleaningTaskMutation,
} from '@/features/cleaning/cleaningApiSlice';
import { useGetStaffQuery } from '@/features/staff/staffApiSlice';
import { useGetApartmentsQuery } from '@/features/apartments/apartmentsApiSlice';
import { useCleaningFilters } from '@/features/cleaning/hooks/useCleaningFilters';
import { useTaskStatusAction } from '@/features/cleaning/hooks/useTaskStatusAction';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useToast } from '@/hooks/use-toast';
import type { CleaningTaskStatusType } from '@rental/shared';
import { UserRole } from '@rental/shared';

import { PageTitle } from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CleaningFilterBar } from '@/features/cleaning/components/CleaningFilterBar';
import { CleaningDataTable } from '@/features/cleaning/components/CleaningDataTable';
import { AssignCleanerDialog } from '@/features/cleaning/components/AssignCleanerDialog';
import { CreateTaskDialog } from '@/features/cleaning/components/CreateTaskDialog';
import { TaskHistoryTimeline } from '@/features/cleaning/components/TaskHistoryTimeline';
import { CleaningEmptyState } from '@/features/cleaning/components/CleaningEmptyState';
import { Card, CardContent } from '@/components/ui/card';

/**
 * AdminCleaningView
 * Smart container for SUPER_ADMIN / ADMIN —
 * Data Table with filters, assignment, creation, history, and RBAC-gated actions.
 */
export default function AdminCleaningView() {
  const user = useAppSelector(selectCurrentUser);
  const { filters, setFilter, resetFilters } = useCleaningFilters();
  const { data: tasks, isLoading, isError } = useGetCleaningTasksQuery(filters);
  const { data: staff } = useGetStaffQuery();
  const { data: apartments } = useGetApartmentsQuery();
  const { advanceStatus } = useTaskStatusAction();
  const [assignCleaner, { isLoading: isAssigning }] = useAssignCleanerMutation();
  const [deleteTask] = useDeleteCleaningTaskMutation();
  const [createTask, { isLoading: isCreating }] = useCreateCleaningTaskMutation();
  const { toast } = useToast();

  // Dialog states
  const [assignDialogTaskId, setAssignDialogTaskId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [historyTaskId, setHistoryTaskId] = useState<string | null>(null);

  // Derive cleaner list from staff
  const cleanerOptions = (staff ?? [])
    .filter((s) => s.role === UserRole.CLEANER && s.isActive)
    .map((s) => ({ _id: s._id, name: s.name }));

  // Derive apartment list
  const apartmentOptions = (apartments ?? []).map((a) => ({
    _id: a._id,
    name: a.name,
  }));

  // Find current assignee for the assign dialog
  const selectedTask = tasks?.find((t) => t._id === assignDialogTaskId);
  const currentAssignee =
    selectedTask?.assignedTo && typeof selectedTask.assignedTo === 'string'
      ? selectedTask.assignedTo
      : undefined;

  // Find history for the history drawer
  const historyTask = tasks?.find((t) => t._id === historyTaskId);
  const historyEntries = historyTask?.history ?? [];
  const historyTaskTitle =
    historyTask && typeof historyTask.apartment === 'object' && historyTask.apartment !== null
      ? (historyTask.apartment as { name?: string }).name
      : undefined;

  // Handlers
  const handleAssign = useCallback(
    async (cleanerId: string) => {
      if (!assignDialogTaskId) return;
      try {
        await assignCleaner({ id: assignDialogTaskId, assignedTo: cleanerId }).unwrap();
        toast({ title: 'Cleaner assigned', description: 'Task has been reassigned.' });
        setAssignDialogTaskId(null);
      } catch {
        toast({ variant: 'destructive', title: 'Assignment failed', description: 'Could not assign cleaner.' });
      }
    },
    [assignDialogTaskId, assignCleaner, toast],
  );

  const handleStatusChange = useCallback(
    (taskId: string, nextStatus: CleaningTaskStatusType) => {
      advanceStatus(taskId, nextStatus);
    },
    [advanceStatus],
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        await deleteTask(taskId).unwrap();
        toast({ title: 'Task deleted', description: 'Cleaning task removed.' });
      } catch {
        toast({ variant: 'destructive', title: 'Delete failed', description: 'Could not delete task.' });
      }
    },
    [deleteTask, toast],
  );

  const handleCreate = useCallback(
    async (data: { apartmentId: string; dueDate: string; assignedTo?: string; notes?: string }) => {
      try {
        await createTask(data).unwrap();
        toast({ title: 'Task created', description: 'New cleaning task added.' });
        setCreateDialogOpen(false);
      } catch {
        toast({ variant: 'destructive', title: 'Creation failed', description: 'Could not create task.' });
      }
    },
    [createTask, toast],
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageTitle title="Housekeeping" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <PageTitle title="Housekeeping" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-red-600">Failed to load cleaning tasks</p>
          <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create button */}
      <div className="flex items-center justify-between">
        <PageTitle title="Housekeeping" />
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <CleaningFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
        cleanerOptions={cleanerOptions}
      />

      {/* Table or Empty State */}
      {tasks && tasks.length > 0 ? (
        <CleaningDataTable
          tasks={tasks}
          onAssign={setAssignDialogTaskId}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onViewHistory={setHistoryTaskId}
          userRole={user?.role ?? ''}
        />
      ) : (
        <CleaningEmptyState message="No tasks match the current filters." />
      )}

      {/* Assign Dialog */}
      <AssignCleanerDialog
        open={!!assignDialogTaskId}
        onClose={() => setAssignDialogTaskId(null)}
        onAssign={handleAssign}
        cleanerOptions={cleanerOptions}
        currentAssignee={currentAssignee}
        isAssigning={isAssigning}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreate}
        apartmentOptions={apartmentOptions}
        cleanerOptions={cleanerOptions}
        isCreating={isCreating}
      />

      {/* History Drawer */}
      <TaskHistoryTimeline
        open={!!historyTaskId}
        onClose={() => setHistoryTaskId(null)}
        history={historyEntries}
        taskTitle={historyTaskTitle}
      />
    </div>
  );
}
