import mongoose from 'mongoose';
import { Job } from '../models/Job';
import { Vehicle } from '../models/Vehicle';
import { JobStatus, JobType, VehicleSource } from '../types';
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

function normalizeOtherVehicleNumber(value: string) {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

async function resolveVehicleFields(source: VehicleSource, vehicleId?: string, otherVehicleNumber?: string) {
  if (source === VehicleSource.OTHER) {
    const number = otherVehicleNumber ? normalizeOtherVehicleNumber(otherVehicleNumber) : '';
    if (!number) {
      throw new AppError('Lorry number is required', 400, 'VALIDATION_ERROR', {
        otherVehicleNumber: 'Lorry number is required',
      });
    }
    return { vehicleSource: source, vehicleId: null, vehicleNumberSnapshot: number };
  }

  if (!vehicleId) {
    throw new AppError('Vehicle is required', 400, 'VALIDATION_ERROR', { vehicleId: 'Vehicle is required' });
  }
  const vehicle = await resolveActiveVehicle(vehicleId);
  return { vehicleSource: source, vehicleId: vehicle._id, vehicleNumberSnapshot: vehicle.vehicleNumber };
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
    jobType?: JobType;
    vehicleSource?: VehicleSource;
    vehicleId?: string;
    otherVehicleNumber?: string;
    destination: string;
    status: JobStatus;
    notes?: string;
  },
  userId: string,
) {
  const jobDate = assertBusinessDate(input.jobDate);
  await getOrCreateDayControl(jobDate);
  await assertDayIsOpen(jobDate);

  const vehicleFields = await resolveVehicleFields(
    input.vehicleSource ?? VehicleSource.OWN,
    input.vehicleId,
    input.otherVehicleNumber,
  );
  const actor = toObjectId(userId);

  return Job.create({
    jobDate,
    jobType: input.jobType ?? JobType.IM,
    ...vehicleFields,
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
    jobType?: JobType;
    vehicleSource?: VehicleSource;
    vehicleId?: string;
    otherVehicleNumber?: string;
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

  const source = job.vehicleSource ?? VehicleSource.OWN;
  if (input.vehicleSource && input.vehicleSource !== source) {
    throw new AppError('Lorry type cannot be changed after the job is created', 400, 'VEHICLE_SOURCE_LOCKED', {
      vehicleSource: 'Lorry type cannot be changed after the job is created',
    });
  }

  if (source === VehicleSource.OTHER && input.notes !== undefined && !input.notes.trim()) {
    throw new AppError('Vendor is required', 400, 'VALIDATION_ERROR', { notes: 'Vendor is required' });
  }

  const vehicleInputGiven =
    source === VehicleSource.OWN ? Boolean(input.vehicleId) : Boolean(input.otherVehicleNumber);
  if (vehicleInputGiven) {
    const vehicleFields = await resolveVehicleFields(source, input.vehicleId, input.otherVehicleNumber);
    job.vehicleId = vehicleFields.vehicleId;
    job.vehicleNumberSnapshot = vehicleFields.vehicleNumberSnapshot;
  }

  if (input.jobType !== undefined) job.jobType = input.jobType;
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
