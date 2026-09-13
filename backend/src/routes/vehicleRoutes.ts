import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController';
import { authenticate, requirePermission } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { Permission } from '../types';
import {
  createVehicleSchema,
  idParamSchema,
  updateVehicleSchema,
  vehicleStatusSchema,
  vehiclesQuerySchema,
} from '../validators/schemas';

const router = Router();
const auth = asyncHandler(authenticate);

router.use(auth);

router.get('/', validate(vehiclesQuerySchema, 'query'), requirePermission(Permission.VEHICLE_VIEW), vehicleController.list);
router.get('/:id', validate(idParamSchema, 'params'), requirePermission(Permission.VEHICLE_VIEW), vehicleController.getById);
router.post('/', requirePermission(Permission.VEHICLE_MANAGE), validate(createVehicleSchema), vehicleController.create);
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  requirePermission(Permission.VEHICLE_MANAGE),
  validate(updateVehicleSchema),
  vehicleController.update,
);
router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  requirePermission(Permission.VEHICLE_MANAGE),
  validate(vehicleStatusSchema),
  vehicleController.setStatus,
);

export default router;
