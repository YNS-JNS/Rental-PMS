import { Router } from 'express';
import { CleaningTaskController } from './cleaningTask.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * CleaningTask Routes
 * Base path: /api/cleaning-tasks
 *
 * IMPORTANT: /my-tasks must be declared BEFORE /:id
 * to prevent Express from treating "my-tasks" as an :id param.
 */

// Cleaner shortcut — must be above /:id
router.get(
  '/my-tasks',
  authenticate,
  authorizeRoles(UserRole.CLEANER),
  CleaningTaskController.getMyTasks
);

// List all tasks (Admin+ only — Cleaners use /my-tasks)
router.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CleaningTaskController.getAll
);

// Create a task manually (Admin+ only)
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CleaningTaskController.createTask
);

// Get single task
router.get(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLEANER),
  CleaningTaskController.getById
);

// Update status
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLEANER),
  CleaningTaskController.updateStatus
);

// Assign cleaner (Admin+ only)
router.patch(
  '/:id/assign',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CleaningTaskController.assignCleaner
);

// Delete task (SUPER_ADMIN only)
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.SUPER_ADMIN),
  CleaningTaskController.deleteTask
);

export default router;
