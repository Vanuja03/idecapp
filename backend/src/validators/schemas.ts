import { z } from 'zod';
import { JobStatus, UserRole } from '../types';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  name: z.string().min(1, 'Name is required').max(100),
  role: z.nativeEnum(UserRole),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    role: z.nativeEnum(UserRole).optional(),
    password: z.string().min(8).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const userStatusSchema = z.object({
  isActive: z.boolean(),
});

export const createVehicleSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required').max(32),
  description: z.string().min(1, 'Description is required').max(200),
});

export const updateVehicleSchema = z
  .object({
    vehicleNumber: z.string().min(1).max(32).optional(),
    description: z.string().min(1).max(200).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const vehicleStatusSchema = z.object({
  isActive: z.boolean(),
});

export const jobDateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const createJobSchema = z.object({
  jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  destination: z.string().trim().min(1, 'Destination is required').max(200),
  status: z.nativeEnum(JobStatus).default(JobStatus.PENDING),
  notes: z.string().max(1000).optional().default(''),
});

export const updateJobSchema = z
  .object({
    jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    vehicleId: z.string().min(1).optional(),
    destination: z.string().trim().min(1).max(200).optional(),
    status: z.nativeEnum(JobStatus).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const vehiclesQuerySchema = z.object({
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});
