import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as authService from '../services/authService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/apiResponse';

export const login = asyncHandler(async (req, res: Response) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  sendSuccess(res, result, 'Login successful');
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, { user }, 'Current user');
});

export const logout = asyncHandler(async (_req, res: Response) => {
  sendSuccess(res, null, 'Logged out successfully');
});
