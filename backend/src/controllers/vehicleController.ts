import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as vehicleService from '../services/vehicleService';
import { sendSuccess } from '../utils/apiResponse';

export const list = asyncHandler(async (req, res: Response) => {
  const active = (req.query as { active?: boolean }).active;
  const vehicles = await vehicleService.listVehicles(active);
  sendSuccess(res, { vehicles }, 'Vehicles retrieved');
});

export const getById = asyncHandler(async (req, res: Response) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  sendSuccess(res, { vehicle }, 'Vehicle retrieved');
});

export const create = asyncHandler(async (req, res: Response) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  sendSuccess(res, { vehicle }, 'Vehicle created successfully', 201);
});

export const update = asyncHandler(async (req, res: Response) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  sendSuccess(res, { vehicle }, 'Vehicle updated successfully');
});

export const setStatus = asyncHandler(async (req, res: Response) => {
  const vehicle = await vehicleService.setVehicleStatus(req.params.id, req.body.isActive);
  sendSuccess(res, { vehicle }, 'Vehicle status updated');
});
