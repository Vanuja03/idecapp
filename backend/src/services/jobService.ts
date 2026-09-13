import mongoose from 'mongoose';
import { Job } from '../models/Job';
import { Vehicle } from '../models/Vehicle';
import { JobStatus } from '../types';
import { AppError } from '../utils/AppError';
import { assertBusinessDate } from '../utils/dates';
import { assertDayIsOpen, getOrCreateDayControl } from './dailyJobService';

function toObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid identifier', 400, 'INVALID_ID');
  }
  return new mongoose.Types.ObjectId(id);
}

async function resolveActiveVehicle(vehicleId: string) {
  const vehicle = await Vehicle.findById(toObjectId(vehicleId));
  if (!vehicle) {
    throw new AppError('Vehicle not found', 400, 'VEHICLE_NOT_FOUND', {
      vehicleId: 'Vehicle must exist',
    });
  }
  if (!vehicle.isActive) {
    throw new AppError('Vehicle is no longer active. Please select another vehicle.', 400, 'VEHICLE_INACTIVE', {
      vehicleId: 'Vehicle is no longer active',
    });
  }
  return vehicle;
}

export async function listJobsByDate(date: string) {
  assertBusinessDate(date);
  return Job.find({ jobDate: date })
    .populate('createdBy', 'name username')
    .populate('updatedBy', 'name username')
    .sort({ createdAt: 1 });
}

export async function getJobById(id: string) {
  const job = await Job.findById(toObjectId(id))
    .populate('createdBy', 'name username')
    .populate('updatedBy', 'name username')
    .populate('finalizedBy', 'name username');
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND');
  return job;
}

export async function createJob(
  input: {
    jobDate: string;
    vehicleId: string;
    destination: string;
    status: JobStatus;
    notes?: string;
  },
  userId: string,
) {
  const jobDate = assertBusinessDate(input.jobDate);
  await getOrCreateDayControl(jobDate);
  await assertDayIsOpen(jobDate);

  const vehicle = await resolveActiveVehicle(input.vehicleId);
  const actor = toObjectId(userId);

  return Job.create({
    jobDate,
    vehicleId: vehicle._id,
    vehicleNumberSnapshot: vehicle.vehicleNumber,
    destination: input.destination.trim(),
    status: input.status,
    notes: input.notes?.trim() ?? '',
    createdBy: actor,
    updatedBy: actor,
  });
}

export async function updateJob(
  id: string,
  input: {
    jobDate?: string;
    vehicleId?: string;
    destination?: string;
    status?: JobStatus;
    notes?: string;
  },
  userId: string,
) {
  const job = await Job.findById(toObjectId(id));
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND');

  await assertDayIsOpen(job.jobDate);

  if (input.jobDate && input.jobDate !== job.jobDate) {
    const nextDate = assertBusinessDate(input.jobDate);
    await getOrCreateDayControl(nextDate);
    await assertDayIsOpen(nextDate);
    job.jobDate = nextDate;
  }

  if (input.vehicleId) {
    const vehicle = await resolveActiveVehicle(input.vehicleId);
    job.vehicleId = vehicle._id;
    job.vehicleNumberSnapshot = vehicle.vehicleNumber;
  }

  if (input.destination !== undefined) job.destination = input.destination.trim();
  if (input.status !== undefined) job.status = input.status;
  if (input.notes !== undefined) job.notes = input.notes.trim();
  job.updatedBy = toObjectId(userId);
  await job.save();
  return getJobById(job._id.toString());
}

export async function deleteJob(id: string) {
  const job = await Job.findById(toObjectId(id));
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND');
  await assertDayIsOpen(job.jobDate);
  await job.deleteOne();
}
