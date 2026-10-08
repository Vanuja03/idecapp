import { z } from 'zod';
import { JobStatus, JobType, UserRole, VehicleSource } from '../types';

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

export const createJobSchema = z
  .object({
    jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    jobType: z.nativeEnum(JobType, { message: 'Type must be IM or EX' }).default(JobType.IM),
    vehicleSource: z.nativeEnum(VehicleSource).default(VehicleSource.OWN),
    vehicleId: z.string().optional(),
    otherVehicleNumber: z.string().trim().max(32, 'Lorry number is too long').optional(),
    destination: z.string().trim().min(1, 'Destination is required').max(200),
    status: z.nativeEnum(JobStatus).default(JobStatus.PENDING),
    notes: z.string().max(1000).optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.vehicleSource === VehicleSource.OWN && !data.vehicleId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['vehicleId'], message: 'Vehicle is required' });
    }
    if (data.vehicleSource === VehicleSource.OTHER && !data.otherVehicleNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherVehicleNumber'],
        message: 'Lorry number is required',
      });
    }
    if (data.vehicleSource === VehicleSource.OTHER && !data.notes?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['notes'], message: 'Vendor is required' });
    }
  });

export const updateJobSchema = z
  .object({
    jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    jobType: z.nativeEnum(JobType, { message: 'Type must be IM or EX' }).optional(),
    vehicleSource: z.nativeEnum(VehicleSource).optional(),
    vehicleId: z.string().min(1).optional(),
    otherVehicleNumber: z.string().trim().min(1, 'Lorry number is required').max(32).optional(),
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

export const analyticsQuerySchema = z.object({
  period: z.enum(['week', 'month']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});
