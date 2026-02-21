import { Router } from 'express';
import { CleaningController } from './cleaning.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * Cleaning Task Routes
 * Accessible to SUPER_ADMIN, ADMIN, and CLEANER roles.
 */

router.get('/cleaning', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLEANER), CleaningController.getTasks);
router.put('/cleaning/:bookingId', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLEANER), CleaningController.markAsClean);

export default router;
