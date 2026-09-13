import { Router } from 'express';
import * as jobController from '../controllers/jobController';
import { authenticate, requirePermission } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { Permission } from '../types';
import { createJobSchema, idParamSchema, jobDateQuerySchema, updateJobSchema } from '../validators/schemas';

const router = Router();
const auth = asyncHandler(authenticate);

router.use(auth);

router.get('/', requirePermission(Permission.JOB_VIEW), validate(jobDateQuerySchema, 'query'), jobController.list);
router.get('/:id', requirePermission(Permission.JOB_VIEW), validate(idParamSchema, 'params'), jobController.getById);
router.post('/', requirePermission(Permission.JOB_CREATE), validate(createJobSchema), jobController.create);
router.put(
  '/:id',
  requirePermission(Permission.JOB_UPDATE),
  validate(idParamSchema, 'params'),
  validate(updateJobSchema),
  jobController.update,
);
router.delete(
  '/:id',
  requirePermission(Permission.JOB_DELETE),
  validate(idParamSchema, 'params'),
  jobController.remove,
);

export default router;
