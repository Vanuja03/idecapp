import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, requirePermission } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { Permission } from '../types';
import { createUserSchema, idParamSchema, updateUserSchema, userStatusSchema } from '../validators/schemas';

const router = Router();
const auth = asyncHandler(authenticate);

router.use(auth);
router.use(requirePermission(Permission.USER_MANAGE));

router.get('/', userController.list);
router.get('/:id', validate(idParamSchema, 'params'), userController.getById);
router.post('/', validate(createUserSchema), userController.create);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), userController.update);
router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(userStatusSchema),
  userController.setStatus,
);

export default router;
