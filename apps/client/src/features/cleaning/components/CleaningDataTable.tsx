import type { ICleaningTask, CleaningTaskStatusType } from '@rental/shared';
import { CleaningTaskStatus } from '@rental/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserPlus, ArrowRightCircle, ArrowLeftCircle, Trash2, ExternalLink, History } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { CleaningStatusBadge } from './CleaningStatusBadge';
import { getNextStatus, getStatusLabel } from '../utils/cleaning.helpers';
import { UserRole } from '@rental/shared';

interface CleaningDataTableProps {
  tasks: ICleaningTask[];
  onAssign: (taskId: string) => void;
  onStatusChange: (taskId: string, nextStatus: CleaningTaskStatusType) => void;
  onDelete: (taskId: string) => void;
  onViewHistory: (taskId: string) => void;
  userRole: string;
}

/**
 * CleaningDataTable
 * Admin-facing table with action dropdown.
 * Fix 5: backward status actions (Revert to To Do).
 * Fix 8: booking link column.
 */
export function CleaningDataTable({
  tasks,
  onAssign,
  onStatusChange,
  onDelete,
  onViewHistory,
  userRole,
}: CleaningDataTableProps) {
  const isAdmin = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Apartment</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No cleaning tasks found.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const nextStatus = getNextStatus(task.status);

              // Handle populated or raw fields
              const apartmentName =
                typeof task.apartment === 'object' && task.apartment !== null
                  ? (task.apartment as { name?: string }).name ?? '—'
                  : '—';

              const assigneeName =
                task.assignedTo && typeof task.assignedTo === 'object'
                  ? (task.assignedTo as { name?: string }).name ?? 'Unassigned'
                  : task.assignedTo
                    ? String(task.assignedTo)
                    : 'Unassigned';

              // Booking link — handle populated or raw
              const bookingId =
                typeof task.booking === 'object' && task.booking !== null
                  ? (task.booking as { _id?: string })._id
                  : typeof task.booking === 'string'
                    ? task.booking
                    : null;

              return (
                <TableRow key={task._id}>
                  <TableCell className="font-medium">{apartmentName}</TableCell>
                  <TableCell>{format(new Date(task.dueDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <CleaningStatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>{assigneeName}</TableCell>
                  <TableCell>
                    {bookingId ? (
                      <Link
                        to={`/bookings/${bookingId}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        View
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">Ad-hoc</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Assign */}
                        <DropdownMenuItem onClick={() => onAssign(task._id)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign Cleaner
                        </DropdownMenuItem>

                        {/* Advance Status (forward) */}
                        {nextStatus && (
                          <DropdownMenuItem onClick={() => onStatusChange(task._id, nextStatus)}>
                            <ArrowRightCircle className="mr-2 h-4 w-4" />
                            Move to {getStatusLabel(nextStatus)}
                          </DropdownMenuItem>
                        )}

                        {/* Revert Status (backward) — Admin+ only, Fix 5 */}
                        {isAdmin && task.status !== CleaningTaskStatus.TO_DO && (
                          <DropdownMenuItem onClick={() => onStatusChange(task._id, CleaningTaskStatus.TO_DO)}>
                            <ArrowLeftCircle className="mr-2 h-4 w-4" />
                            Revert to To Do
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {/* View History — Fix 7 */}
                        <DropdownMenuItem onClick={() => onViewHistory(task._id)}>
                          <History className="mr-2 h-4 w-4" />
                          View History
                        </DropdownMenuItem>

                        {/* Delete — SUPER_ADMIN only */}
                        {userRole === UserRole.SUPER_ADMIN && (
                          <DropdownMenuItem
                            onClick={() => onDelete(task._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
