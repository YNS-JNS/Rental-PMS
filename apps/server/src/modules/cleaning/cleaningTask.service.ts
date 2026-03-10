import { CleaningTask, ICleaningTaskDocument } from './cleaningTask.model';
import { IBookingDocument } from '../bookings/booking.model';
import { User } from '../auth/user.model';
import { CleaningTaskStatusType, CleaningTaskStatus } from '@rental/shared';

/**
 * Custom error for invalid status transitions
 */
export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid status transition: ${from} → ${to}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

/**
 * Custom error for forbidden operations
 */
export class ForbiddenOperationError extends Error {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message);
    this.name = 'ForbiddenOperationError';
  }
}

/**
 * Valid forward transitions (any authenticated role)
 * Backward transitions are handled separately with role checks
 */
const FORWARD_TRANSITIONS: Record<CleaningTaskStatusType, CleaningTaskStatusType[]> = {
  TO_DO: ['IN_PROGRESS'],
  IN_PROGRESS: ['DONE'],
  DONE: [],
};

/**
 * Backward transitions (ADMIN / SUPER_ADMIN only)
 */
const BACKWARD_TRANSITIONS: Record<CleaningTaskStatusType, CleaningTaskStatusType[]> = {
  TO_DO: [],
  IN_PROGRESS: ['TO_DO'],
  DONE: ['TO_DO'],
};

/**
 * CleaningTask Service
 * Handles business logic for the Housekeeping module.
 * Follows the static-method pattern established by BookingService.
 */
export class CleaningTaskService {

  /**
   * Auto-generate a cleaning task from a confirmed booking.
   * Called by BookingService when a booking is created/confirmed.
   */
  static async createFromBooking(
    booking: IBookingDocument,
    systemUserId: string
  ): Promise<ICleaningTaskDocument> {
    // Idempotency: if a task already exists for this booking, return it
    const existing = await CleaningTask.findOne({ booking: booking._id });
    if (existing) return existing;

    return CleaningTask.create({
      booking: booking._id,
      apartment: booking.apartment,
      status: CleaningTaskStatus.TO_DO,
      dueDate: booking.endDate,
      history: [
        {
          status: CleaningTaskStatus.TO_DO,
          changedBy: systemUserId,
          changedAt: new Date(),
          note: 'Task auto-created from booking confirmation',
        },
      ],
    });
  }

  /**
   * Manually create a cleaning task (Admin / Super Admin).
   * Not linked to a booking — for ad-hoc cleaning needs.
   */
  static async createManual(data: {
    apartmentId: string;
    dueDate: string;
    assignedTo?: string;
    notes?: string;
  }, actorUserId: string): Promise<ICleaningTaskDocument> {
    // Validate assignedTo is a real CLEANER if provided
    if (data.assignedTo) {
      const cleaner = await User.findById(data.assignedTo);
      if (!cleaner) throw new Error('User not found');
      if (cleaner.role !== 'CLEANER') throw new Error('Target user is not a CLEANER');
    }

    return CleaningTask.create({
      apartment: data.apartmentId,
      assignedTo: data.assignedTo || null,
      status: CleaningTaskStatus.TO_DO,
      dueDate: new Date(data.dueDate),
      notes: data.notes,
      history: [
        {
          status: CleaningTaskStatus.TO_DO,
          changedBy: actorUserId,
          changedAt: new Date(),
          note: 'Task manually created',
        },
      ],
    });
  }

  /**
   * List all cleaning tasks with optional filters.
   */
  static async findAll(filters: {
    status?: CleaningTaskStatusType;
    assignedTo?: string;
    apartmentId?: string;
  } = {}): Promise<ICleaningTaskDocument[]> {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.apartmentId) query.apartment = filters.apartmentId;

    return CleaningTask.find(query)
      .populate('booking', 'startDate endDate status')
      .populate('apartment', 'name address')
      .populate('assignedTo', 'name email role')
      .populate('history.changedBy', 'name')
      .sort({ dueDate: 1 });
  }

  /**
   * Get a single cleaning task by ID with full population.
   */
  static async findById(id: string): Promise<ICleaningTaskDocument | null> {
    return CleaningTask.findById(id)
      .populate('booking', 'startDate endDate status tenant')
      .populate('apartment', 'name address')
      .populate('assignedTo', 'name email role')
      .populate('history.changedBy', 'name');
  }

  /**
   * Update the status of a cleaning task.
   * Enforces transition rules and RBAC for backward transitions.
   * Appends to the history array atomically.
   */
  static async updateStatus(
    id: string,
    newStatus: CleaningTaskStatusType,
    userId: string,
    userRole: string,
    note?: string
  ): Promise<ICleaningTaskDocument> {
    const task = await CleaningTask.findById(id);
    if (!task) {
      throw new Error('CleaningTask not found');
    }

    const currentStatus = task.status;

    // Check if this is a valid forward transition
    const isForward = FORWARD_TRANSITIONS[currentStatus]?.includes(newStatus);
    const isBackward = BACKWARD_TRANSITIONS[currentStatus]?.includes(newStatus);

    if (!isForward && !isBackward) {
      throw new InvalidStatusTransitionError(currentStatus, newStatus);
    }

    // Backward transitions require ADMIN or SUPER_ADMIN
    if (isBackward && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      throw new ForbiddenOperationError(
        'Only ADMIN or SUPER_ADMIN can revert a task status'
      );
    }

    // Build the update
    const update: any = {
      status: newStatus,
      $push: {
        history: {
          status: newStatus,
          changedBy: userId,
          changedAt: new Date(),
          note,
        },
      },
    };

    // Set completedAt when transitioning to DONE; clear it otherwise
    if (newStatus === CleaningTaskStatus.DONE) {
      update.completedAt = new Date();
    } else {
      update.completedAt = null;
    }

    const updated = await CleaningTask.findByIdAndUpdate(id, update, { new: true })
      .populate('booking', 'startDate endDate status')
      .populate('apartment', 'name address')
      .populate('assignedTo', 'name email role')
      .populate('history.changedBy', 'name');

    if (!updated) {
      throw new Error('CleaningTask not found after update');
    }

    return updated;
  }

  /**
   * Assign a cleaner to a task. Does NOT change the task status.
   */
  static async assignCleaner(
    id: string,
    cleanerUserId: string
  ): Promise<ICleaningTaskDocument> {
    // Verify the target user exists and has CLEANER role
    const cleaner = await User.findById(cleanerUserId);
    if (!cleaner) {
      throw new Error('User not found');
    }
    if (cleaner.role !== 'CLEANER') {
      throw new Error('Target user is not a CLEANER');
    }

    const updated = await CleaningTask.findByIdAndUpdate(
      id,
      { assignedTo: cleanerUserId },
      { new: true }
    )
      .populate('booking', 'startDate endDate status')
      .populate('apartment', 'name address')
      .populate('assignedTo', 'name email role')
      .populate('history.changedBy', 'name');

    if (!updated) {
      throw new Error('CleaningTask not found');
    }

    return updated;
  }

  /**
   * Delete the cleaning task associated with a booking.
   * Called when a booking is cancelled.
   */
  static async deleteByBooking(bookingId: string): Promise<void> {
    await CleaningTask.deleteOne({ booking: bookingId });
  }

  /**
   * Delete a cleaning task by its own ID.
   */
  static async deleteById(id: string): Promise<ICleaningTaskDocument | null> {
    return CleaningTask.findByIdAndDelete(id);
  }
}
