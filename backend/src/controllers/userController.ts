import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as authService from '../services/authService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/apiResponse';

export const list = asyncHandler(async (_req, res: Response) => {
  const users = await authService.listUsers();
  sendSuccess(res, { users }, 'Users retrieved');
});

export const getById = asyncHandler(async (req, res: Response) => {
  const user = await authService.getUserById(req.params.id);
  sendSuccess(res, { user }, 'User retrieved');
});

export const create = asyncHandler(async (req, res: Response) => {
  const user = await authService.createUser(req.body);
  sendSuccess(res, { user }, 'User created successfully', 201);
});

export const update = asyncHandler(async (req, res: Response) => {
  const user = await authService.updateUser(req.params.id, req.body);
  sendSuccess(res, { user }, 'User updated successfully');
});

export const setStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.setUserStatus(req.params.id, req.body.isActive, req.user!.id);
  sendSuccess(res, { user }, 'User status updated');
});
