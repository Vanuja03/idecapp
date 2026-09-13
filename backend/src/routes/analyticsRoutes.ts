import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate, requirePermission } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { Permission } from '../types';
import { analyticsQuerySchema } from '../validators/schemas';

const router = Router();
const auth = asyncHandler(authenticate);

router.use(auth);
router.get(
  '/completed-by-vehicle',
  requirePermission(Permission.JOB_VIEW),
  validate(analyticsQuerySchema, 'query'),
  analyticsController.completedByVehicle,
);

export default router;
