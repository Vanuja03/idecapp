import { Request, NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { Permission, ROLE_PERMISSIONS, UserRole } from '../types';
import { AppError } from '../utils/AppError';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; role: UserRole };
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }
    req.user = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }
}

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }
    const granted = ROLE_PERMISSIONS[user.role] ?? [];
    const allowed = permissions.every((permission) => granted.includes(permission));
    if (!allowed) {
      throw new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN');
    }
    next();
  };
}
