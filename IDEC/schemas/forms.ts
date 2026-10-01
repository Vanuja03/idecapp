import { z } from 'zod';
import { JobPayload, JobStatus, UserRole, VehicleSource } from '@/types';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const jobSchema = z
  .object({
    jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid date'),
    vehicleSource: z.nativeEnum(VehicleSource),
    vehicleId: z.string().optional(),
    otherVehicleNumber: z.string().trim().max(32, 'Lorry number is too long').optional(),
    destination: z.string().trim().min(1, 'Destination is required').max(200),
    status: z.nativeEnum(JobStatus),
    notes: z.string().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.vehicleSource === VehicleSource.OWN && !data.vehicleId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['vehicleId'], message: 'Select a vehicle' });
    }
    if (data.vehicleSource === VehicleSource.OTHER && !data.otherVehicleNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherVehicleNumber'],
        message: 'Enter the lorry number',
      });
    }
    if (data.vehicleSource === VehicleSource.OTHER && !data.notes?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['notes'], message: 'Enter the vendor' });
    }
  });

export function jobFormToPayload(values: JobForm): JobPayload {
  const base = {
    jobDate: values.jobDate,
    vehicleSource: values.vehicleSource,
    destination: values.destination.trim(),
    status: values.status,
    notes: values.notes?.trim() ?? '',
  };
  return values.vehicleSource === VehicleSource.OTHER
    ? { ...base, otherVehicleNumber: values.otherVehicleNumber?.trim() }
    : { ...base, vehicleId: values.vehicleId };
}

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
