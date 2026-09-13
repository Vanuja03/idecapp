import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/schemas';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
    errorCode: 'RATE_LIMITED',
  },
});

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.get('/me', asyncHandler(authenticate), authController.me);
router.post('/logout', asyncHandler(authenticate), authController.logout);

export default router;
