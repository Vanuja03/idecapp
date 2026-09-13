import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as analyticsService from '../services/analyticsService';
import { sendSuccess } from '../utils/apiResponse';

export const completedByVehicle = asyncHandler(async (req, res: Response) => {
  const { period, date } = req.query as { period: 'week' | 'month'; date?: string };
  const data = await analyticsService.completedByVehicle(period, date);
  sendSuccess(res, data, 'Analytics retrieved');
});
