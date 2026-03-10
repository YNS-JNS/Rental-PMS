import type { CleaningTaskStatusType } from '@rental/shared';
import { CleaningTaskStatus } from '@rental/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { CleaningTaskFilters } from '../cleaningApiSlice';

interface CleanerOption {
  _id: string;
  name: string;
}

interface CleaningFilterBarProps {
  filters: CleaningTaskFilters;
  onFilterChange: <K extends keyof CleaningTaskFilters>(key: K, value: CleaningTaskFilters[K]) => void;
  onReset: () => void;
  cleanerOptions: CleanerOption[];
}

const STATUS_OPTIONS: { value: CleaningTaskStatusType; label: string }[] = [
  { value: CleaningTaskStatus.TO_DO, label: 'To Do' },
  { value: CleaningTaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: CleaningTaskStatus.DONE, label: 'Done' },
];

/**
 * CleaningFilterBar
 * Horizontal filter row for the Admin dashboard.
 * Status dropdown + Assignee dropdown + Reset button.
 */
export function CleaningFilterBar({
  filters,
  onFilterChange,
  onReset,
  cleanerOptions,
}: CleaningFilterBarProps) {
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <Select
        value={filters.status ?? ''}
        onValueChange={(value) =>
          onFilterChange('status', (value || undefined) as CleaningTaskStatusType | undefined)
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Assignee Filter */}
      <Select
        value={filters.assignedTo ?? ''}
        onValueChange={(value) => onFilterChange('assignedTo', value || undefined)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Cleaners" />
        </SelectTrigger>
        <SelectContent>
          {cleanerOptions.map((cleaner) => (
            <SelectItem key={cleaner._id} value={cleaner._id}>
              {cleaner.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
