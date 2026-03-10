import { cn } from '@/lib/utils';
import { CleaningTaskStatus, type CleaningTaskStatusType } from '@rental/shared';

interface TaskStatusStepperProps {
  currentStatus: CleaningTaskStatusType;
}

const STEPS: { key: CleaningTaskStatusType; label: string }[] = [
  { key: CleaningTaskStatus.TO_DO, label: 'To Do' },
  { key: CleaningTaskStatus.IN_PROGRESS, label: 'In Progress' },
  { key: CleaningTaskStatus.DONE, label: 'Done' },
];

const STATUS_ORDER: Record<CleaningTaskStatusType, number> = {
  [CleaningTaskStatus.TO_DO]: 0,
  [CleaningTaskStatus.IN_PROGRESS]: 1,
  [CleaningTaskStatus.DONE]: 2,
};

/**
 * TaskStatusStepper
 * Visual 3-dot stepper showing task progression.
 * Designed for mobile cards — compact and clear.
 */
export function TaskStatusStepper({ currentStatus }: TaskStatusStepperProps) {
  const currentIndex = STATUS_ORDER[currentStatus] ?? 0;

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isReached = index <= currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            {/* Dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-3 w-3 rounded-full transition-colors',
                  isReached ? 'bg-primary' : 'bg-gray-300',
                  isActive && 'ring-2 ring-primary/30 ring-offset-1',
                )}
              />
              <span
                className={cn(
                  'mt-1 text-[10px] font-medium leading-tight',
                  isReached ? 'text-primary' : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-6 -mt-3.5',
                  index < currentIndex ? 'bg-primary' : 'bg-gray-300',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
