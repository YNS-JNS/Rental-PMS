import type { IStatusHistoryEntry } from '@rental/shared';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { getStatusLabel, getStatusColor, getStatusIcon } from '../utils/cleaning.helpers';
import type { CleaningTaskStatusType } from '@rental/shared';

interface TaskHistoryTimelineProps {
  open: boolean;
  onClose: () => void;
  history: IStatusHistoryEntry[];
  taskTitle?: string;
}

/**
 * TaskHistoryTimeline
 * Side-drawer showing the full status history of a cleaning task.
 * Each entry renders the status, actor name, timestamp, and optional note.
 */
export function TaskHistoryTimeline({
  open,
  onClose,
  history,
  taskTitle,
}: TaskHistoryTimelineProps) {
  // Show entries in reverse-chronological order (latest first)
  const sorted = [...history].reverse();

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Task History</SheetTitle>
          <SheetDescription>
            {taskTitle ? `Timeline for ${taskTitle}` : 'Full status change history'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-4">
          <div className="relative pl-6">
            {/* Timeline vertical line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />

            {sorted.map((entry, idx) => {
              const StatusIcon = getStatusIcon(entry.status as CleaningTaskStatusType);
              const colorClass = getStatusColor(entry.status as CleaningTaskStatusType);

              // Derive actor name from populated changedBy
              const actorName =
                typeof entry.changedBy === 'object' && entry.changedBy !== null
                  ? (entry.changedBy as { name?: string }).name ?? 'System'
                  : 'System';

              return (
                <div key={idx} className="relative pb-6 last:pb-0">
                  {/* Timeline dot */}
                  <div className="absolute left-[-15px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border-2 border-border">
                    <StatusIcon className="h-3 w-3 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                        {getStatusLabel(entry.status as CleaningTaskStatusType)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by <span className="font-medium text-foreground">{actorName}</span>
                      {' · '}
                      {format(new Date(entry.changedAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-muted-foreground italic">
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
