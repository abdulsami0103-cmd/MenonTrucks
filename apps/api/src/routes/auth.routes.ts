import { Router } from 'express';
import { register, login, refreshToken, getProfile, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '@menon/shared';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;
