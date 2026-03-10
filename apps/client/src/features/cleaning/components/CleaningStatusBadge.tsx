import { cn } from '@/lib/utils';
import type { CleaningTaskStatusType } from '@rental/shared';
import { getStatusLabel, getStatusColor, getStatusIcon } from '../utils/cleaning.helpers';

interface CleaningStatusBadgeProps {
  status: CleaningTaskStatusType;
  className?: string;
}

/**
 * CleaningStatusBadge
 * Renders a color-coded pill for the cleaning task status.
 */
export function CleaningStatusBadge({ status, className }: CleaningStatusBadgeProps) {
  const Icon = getStatusIcon(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        getStatusColor(status),
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {getStatusLabel(status)}
    </span>
  );
}
