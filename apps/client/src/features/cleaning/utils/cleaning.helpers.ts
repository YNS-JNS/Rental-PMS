import { CleaningTaskStatus, type CleaningTaskStatusType } from '@rental/shared';
import { Circle, Loader2, CheckCircle2, type LucideIcon } from 'lucide-react';

// ============================================
// Status → Display Label
// ============================================

const STATUS_LABELS: Record<CleaningTaskStatusType, string> = {
  [CleaningTaskStatus.TO_DO]: 'To Do',
  [CleaningTaskStatus.IN_PROGRESS]: 'In Progress',
  [CleaningTaskStatus.DONE]: 'Done',
};

export function getStatusLabel(status: CleaningTaskStatusType): string {
  return STATUS_LABELS[status] ?? status;
}

// ============================================
// Status → Tailwind Color Classes
// ============================================

const STATUS_COLORS: Record<CleaningTaskStatusType, string> = {
  [CleaningTaskStatus.TO_DO]: 'bg-amber-100 text-amber-800',
  [CleaningTaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [CleaningTaskStatus.DONE]: 'bg-green-100 text-green-800',
};

export function getStatusColor(status: CleaningTaskStatusType): string {
  return STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800';
}

// ============================================
// Status → Lucide Icon
// ============================================

const STATUS_ICONS: Record<CleaningTaskStatusType, LucideIcon> = {
  [CleaningTaskStatus.TO_DO]: Circle,
  [CleaningTaskStatus.IN_PROGRESS]: Loader2,
  [CleaningTaskStatus.DONE]: CheckCircle2,
};

export function getStatusIcon(status: CleaningTaskStatusType): LucideIcon {
  return STATUS_ICONS[status] ?? Circle;
}

// ============================================
// Status → Next Valid Transition
// ============================================

const NEXT_STATUS: Record<CleaningTaskStatusType, CleaningTaskStatusType | null> = {
  [CleaningTaskStatus.TO_DO]: CleaningTaskStatus.IN_PROGRESS,
  [CleaningTaskStatus.IN_PROGRESS]: CleaningTaskStatus.DONE,
  [CleaningTaskStatus.DONE]: null,
};

export function getNextStatus(status: CleaningTaskStatusType): CleaningTaskStatusType | null {
  return NEXT_STATUS[status] ?? null;
}
