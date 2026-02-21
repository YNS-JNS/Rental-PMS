import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * Staff Management Routes
 * All routes require SUPER_ADMIN role.
 */

router.get('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), StaffController.findAll);
router.post('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), StaffController.create);
router.put('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), StaffController.update);
router.delete('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN), StaffController.delete);

export default router;
