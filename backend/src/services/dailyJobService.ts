import mongoose from 'mongoose';
import { DailyJobControl } from '../models/DailyJobControl';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { DayStatus } from '../types';
import { AppError } from '../utils/AppError';
import { assertBusinessDate } from '../utils/dates';

export async function getOrCreateDayControl(date: string) {
  assertBusinessDate(date);
  const existing = await DailyJobControl.findOne({ date });
  if (existing) return existing;
  try {
    return await DailyJobControl.create({ date, status: DayStatus.OPEN });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      const raced = await DailyJobControl.findOne({ date });
      if (raced) return raced;
    }
    throw error;
  }
}

export async function assertDayIsOpen(date: string): Promise<void> {
  const control = await DailyJobControl.findOne({ date });
  if (control?.status === DayStatus.FINALIZED) {
    throw new AppError(
      'Jobs for this date have been finalized and cannot be modified.',
      403,
      'DAY_FINALIZED',
    );
  }
}

export async function getDailyView(date: string) {
  assertBusinessDate(date);
  const control = await getOrCreateDayControl(date);
  const jobs = await Job.find({ jobDate: date })
    .populate('createdBy', 'name username')
    .populate('updatedBy', 'name username')
    .populate('finalizedBy', 'name username')
    .sort({ createdAt: 1 });

  const counts = {
    total: jobs.length,
    pending: jobs.filter((job) => job.status === 'PENDING').length,
    completed: jobs.filter((job) => job.status === 'COMPLETED').length,
    canceled: jobs.filter((job) => job.status === 'CANCELED').length,
  };

  let finalizedByName: string | null = null;
  if (control.finalizedBy) {
    const user = await User.findById(control.finalizedBy).select('name');
    finalizedByName = user?.name ?? null;
  }

  return {
    date,
    status: control.status,
    finalizedAt: control.finalizedAt,
    finalizedBy: control.finalizedBy ? control.finalizedBy.toString() : null,
    finalizedByName,
    counts,
    jobs,
  };
}

export async function finalizeDay(date: string, userId: string) {
  assertBusinessDate(date);
  await getOrCreateDayControl(date);

  const now = new Date();
  const actorId = new mongoose.Types.ObjectId(userId);

  const control = await DailyJobControl.findOneAndUpdate(
    { date, status: DayStatus.OPEN },
    {
      $set: {
        status: DayStatus.FINALIZED,
        finalizedAt: now,
        finalizedBy: actorId,
      },
    },
    { new: true },
  );

  if (!control) {
    const existing = await DailyJobControl.findOne({ date });
    if (existing?.status === DayStatus.FINALIZED) {
      throw new AppError('This date has already been finalized', 409, 'ALREADY_FINALIZED');
    }
    throw new AppError('Unable to finalize this date', 500, 'FINALIZE_FAILED');
  }

  await Job.updateMany(
    { jobDate: date, finalizedAt: null },
    { $set: { finalizedAt: now, finalizedBy: actorId } },
  );

  return getDailyView(date);
}
