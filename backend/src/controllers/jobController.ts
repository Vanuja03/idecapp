import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as jobService from '../services/jobService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/apiResponse';

export const list = asyncHandler(async (req, res: Response) => {
  const jobs = await jobService.listJobsByDate((req.query as { date: string }).date);
  sendSuccess(res, { jobs }, 'Jobs retrieved');
});

export const getById = asyncHandler(async (req, res: Response) => {
  const job = await jobService.getJobById(req.params.id);
  sendSuccess(res, { job }, 'Job retrieved');
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await jobService.createJob(req.body, req.user!.id);
  sendSuccess(res, { job }, 'Job created successfully', 201);
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await jobService.updateJob(req.params.id, req.body, req.user!.id);
  sendSuccess(res, { job }, 'Job updated successfully');
});

export const remove = asyncHandler(async (req, res: Response) => {
  await jobService.deleteJob(req.params.id);
  sendSuccess(res, null, 'Job deleted successfully');
});
