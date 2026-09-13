import { z } from 'zod';
import { JobStatus, UserRole } from '@/types';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const jobSchema = z.object({
  jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid date'),
  vehicleId: z.string().min(1, 'Select a vehicle'),
  destination: z.string().trim().min(1, 'Destination is required').max(200),
  status: z.nativeEnum(JobStatus),
  notes: z.string().max(1000).optional(),
});

export const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required').max(32),
  description: z.string().min(1, 'Description is required').max(200),
});

export const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.nativeEnum(UserRole),
  password: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type JobForm = z.infer<typeof jobSchema>;
export type VehicleForm = z.infer<typeof vehicleSchema>;
