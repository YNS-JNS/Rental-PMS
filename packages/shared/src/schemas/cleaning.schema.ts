import { z } from 'zod';

/**
 * CLEANING TASK TYPES — Shared between Client and Server
 */

// ============================================
// Status Constants
// ============================================

export const CleaningTaskStatus = {
  TO_DO: 'TO_DO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type CleaningTaskStatusType = typeof CleaningTaskStatus[keyof typeof CleaningTaskStatus];

// ============================================
// Validation Schemas
// ============================================

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Schema for updating a cleaning task's status.
 * Used by PATCH /api/cleaning-tasks/:id/status
 */
export const UpdateCleaningStatusSchema = z.object({
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE'], {
    required_error: 'Status is required',
  }),
  note: z.string().max(500, 'Note must be 500 characters or less').optional(),
});

export type UpdateCleaningStatusInput = z.infer<typeof UpdateCleaningStatusSchema>;

/**
 * Schema for assigning a cleaner to a task.
 * Used by PATCH /api/cleaning-tasks/:id/assign
 */
export const AssignCleanerSchema = z.object({
  assignedTo: z.string().regex(objectIdRegex, { message: 'Invalid user ID format' }),
});

export type AssignCleanerInput = z.infer<typeof AssignCleanerSchema>;

// ============================================
// Interfaces
// ============================================

export interface IStatusHistoryEntry {
  status: CleaningTaskStatusType;
  changedBy: string; // User ID or populated user object
  changedAt: string;
  note?: string;
}

export interface ICleaningTask {
  _id: string;
  booking: string;
  apartment: string;
  assignedTo?: string;
  status: CleaningTaskStatusType;
  dueDate: string;
  completedAt?: string;
  notes?: string;
  history: IStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}
