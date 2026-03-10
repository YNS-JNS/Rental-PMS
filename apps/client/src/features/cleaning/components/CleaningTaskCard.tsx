import type { ICleaningTask, CleaningTaskStatusType } from '@rental/shared';
import { CleaningTaskStatus } from '@rental/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Loader2, PlayCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { TaskStatusStepper } from './TaskStatusStepper';
import { getNextStatus } from '../utils/cleaning.helpers';

interface CleaningTaskCardProps {
  task: ICleaningTask;
  onAdvanceStatus: (taskId: string, nextStatus: CleaningTaskStatusType) => void;
  isUpdating: boolean;
}

// CTA configuration per current status
const CTA_CONFIG: Record<string, { label: string; icon: typeof PlayCircle; color: string }> = {
  [CleaningTaskStatus.TO_DO]: {
    label: 'Start Cleaning',
    icon: PlayCircle,
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  [CleaningTaskStatus.IN_PROGRESS]: {
    label: 'Mark as Done ✓',
    icon: CheckCircle2,
    color: 'bg-green-600 hover:bg-green-700 text-white',
  },
};

/**
 * CleaningTaskCard
 * Mobile-first card with big touch targets and a single CTA.
 * Shows: apartment name, address, due date, stepper, action button.
 */
export function CleaningTaskCard({ task, onAdvanceStatus, isUpdating }: CleaningTaskCardProps) {
  const nextStatus = getNextStatus(task.status);
  const cta = CTA_CONFIG[task.status];

  // Derive display fields — handle both populated objects and raw strings
  const apartmentName =
    typeof task.apartment === 'object' && task.apartment !== null
      ? (task.apartment as { name?: string }).name ?? 'Unknown'
      : 'Unknown';

  const apartmentAddress =
    typeof task.apartment === 'object' && task.apartment !== null
      ? (task.apartment as { address?: string }).address
      : undefined;

  return (
    <Card className="border-l-4 border-l-primary/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{apartmentName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Address */}
        {apartmentAddress && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
            {apartmentAddress}
          </div>
        )}

        {/* Due Date */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
          Due: {format(new Date(task.dueDate), 'dd/MM/yyyy')}
        </div>

        {/* Status Stepper */}
        <TaskStatusStepper currentStatus={task.status} />

        {/* CTA Button — only if a valid next status exists */}
        {nextStatus && cta && (
          <Button
            onClick={() => onAdvanceStatus(task._id, nextStatus)}
            disabled={isUpdating}
            className={`w-full h-14 text-lg font-bold mt-2 ${cta.color}`}
            size="lg"
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <cta.icon className="mr-2 h-6 w-6" />
            )}
            {isUpdating ? 'Updating...' : cta.label}
          </Button>
        )}

        {/* Completed state */}
        {task.status === CleaningTaskStatus.DONE && (
          <div className="flex items-center justify-center py-3 text-green-600 font-semibold">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Completed
          </div>
        )}
      </CardContent>
    </Card>
  );
}
