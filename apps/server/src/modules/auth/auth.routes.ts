import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

// Route Definitions
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;
