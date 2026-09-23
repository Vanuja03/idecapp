import { Router } from 'express';
import * as dailyJobController from '../controllers/dailyJobController';
import { authenticate, requirePermission } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { Permission } from '../types';
import { dateParamSchema } from '../validators/schemas';

const router = Router();
const auth = asyncHandler(authenticate);

router.use(auth);
router.get(
  '/:date/pdf',
  requirePermission(Permission.JOB_VIEW),
  validate(dateParamSchema, 'params'),
  dailyJobController.downloadPdf,
);
router.get(
  '/:date',
  requirePermission(Permission.JOB_VIEW),
  validate(dateParamSchema, 'params'),
  dailyJobController.getByDate,
);
router.post(
  '/:date/finalize',
  requirePermission(Permission.DAY_FINALIZE),
  validate(dateParamSchema, 'params'),
  dailyJobController.finalize,
);

export default router;
