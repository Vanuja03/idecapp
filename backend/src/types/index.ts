import { Request } from 'express';

export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const JobStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const DayStatus = {
  OPEN: 'OPEN',
  FINALIZED: 'FINALIZED',
} as const;

export type DayStatus = (typeof DayStatus)[keyof typeof DayStatus];

export const Permission = {
  JOB_VIEW: 'JOB_VIEW',
  JOB_CREATE: 'JOB_CREATE',
  JOB_UPDATE: 'JOB_UPDATE',
  JOB_DELETE: 'JOB_DELETE',
  DAY_FINALIZE: 'DAY_FINALIZE',
  VEHICLE_VIEW: 'VEHICLE_VIEW',
  VEHICLE_MANAGE: 'VEHICLE_MANAGE',
  USER_MANAGE: 'USER_MANAGE',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    Permission.JOB_VIEW,
    Permission.JOB_CREATE,
    Permission.JOB_UPDATE,
    Permission.JOB_DELETE,
    Permission.DAY_FINALIZE,
    Permission.VEHICLE_VIEW,
    Permission.VEHICLE_MANAGE,
    Permission.USER_MANAGE,
  ],
  MANAGER: [
    Permission.JOB_VIEW,
    Permission.JOB_CREATE,
    Permission.JOB_UPDATE,
    Permission.DAY_FINALIZE,
    Permission.VEHICLE_VIEW,
  ],
  OPERATOR: [
    Permission.JOB_VIEW,
    Permission.JOB_CREATE,
    Permission.JOB_UPDATE,
    Permission.VEHICLE_VIEW,
  ],
  VIEWER: [Permission.JOB_VIEW],
};

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};
