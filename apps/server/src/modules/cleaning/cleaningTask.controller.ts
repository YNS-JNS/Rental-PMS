import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CleaningTaskService, InvalidStatusTransitionError, ForbiddenOperationError } from './cleaningTask.service';
import { UpdateCleaningStatusSchema, AssignCleanerSchema } from '@rental/shared';

/**
 * CleaningTask Controller
 * Transport layer for the Housekeeping module.
 * Delegates all business logic to CleaningTaskService.
 */
export const CleaningTaskController = {

  /**
   * GET /api/cleaning-tasks
   * List all cleaning tasks with optional query filters.
   */
  getAll: async (req: Request, res: Response) => {
    try {
      const { status, assignedTo, apartmentId } = req.query;

      const tasks = await CleaningTaskService.findAll({
        status: status as any,
        assignedTo: assignedTo as string,
        apartmentId: apartmentId as string,
      });

      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch cleaning tasks' });
    }
  },

  /**
   * GET /api/cleaning-tasks/my-tasks
   * Get tasks assigned to the authenticated user.
   */
  getMyTasks: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as jwt.JwtPayload)?.id;

      const tasks = await CleaningTaskService.findAll({
        assignedTo: userId,
      });

      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch your tasks' });
    }
  },

  /**
   * GET /api/cleaning-tasks/:id
   * Get a single cleaning task by ID.
   */
  getById: async (req: Request, res: Response) => {
    try {
      const task = await CleaningTaskService.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ success: false, message: 'Cleaning task not found' });
      }

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch cleaning task' });
    }
  },

  /**
   * PATCH /api/cleaning-tasks/:id/status
   * Update the status of a cleaning task.
   */
  updateStatus: async (req: Request, res: Response) => {
    try {
      const validation = UpdateCleaningStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        });
      }

      const user = req.user as jwt.JwtPayload;
      const { status, note } = validation.data;

      const task = await CleaningTaskService.updateStatus(
        req.params.id,
        status,
        user.id,
        user.role,
        note
      );

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      if (error instanceof InvalidStatusTransitionError) {
        return res.status(422).json({ success: false, message: error.message });
      }
      if (error instanceof ForbiddenOperationError) {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (error instanceof Error && error.message === 'CleaningTask not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: 'Failed to update cleaning task status' });
    }
  },

  /**
   * PATCH /api/cleaning-tasks/:id/assign
   * Assign a cleaner to a task.
   */
  assignCleaner: async (req: Request, res: Response) => {
    try {
      const validation = AssignCleanerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        });
      }

      const task = await CleaningTaskService.assignCleaner(
        req.params.id,
        validation.data.assignedTo
      );

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      if (error instanceof Error && error.message === 'CleaningTask not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error instanceof Error && error.message === 'Target user is not a CLEANER') {
        return res.status(422).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: 'Failed to assign cleaner' });
    }
  },

  /**
   * DELETE /api/cleaning-tasks/:id
   * Delete a cleaning task (SUPER_ADMIN only).
   */
  deleteTask: async (req: Request, res: Response) => {
    try {
      const task = await CleaningTaskService.deleteById(req.params.id);

      if (!task) {
        return res.status(404).json({ success: false, message: 'Cleaning task not found' });
      }

      res.status(200).json({ success: true, message: 'Cleaning task deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete cleaning task' });
    }
  },
};
