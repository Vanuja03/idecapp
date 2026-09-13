import { Job } from '../models/Job';
import { Vehicle } from '../models/Vehicle';
import { JobStatus } from '../types';
import { monthRangeContaining, todayInTimezone, weekRangeContaining } from '../utils/dates';

export async function completedByVehicle(period: 'week' | 'month', date?: string) {
  const anchor = date ?? todayInTimezone();
  const range = period === 'week' ? weekRangeContaining(anchor) : monthRangeContaining(anchor);

  const [counts, vehicles, hires] = await Promise.all([
    Job.aggregate<{ _id: string; completed: number }>([
      {
        $match: {
          status: JobStatus.COMPLETED,
          jobDate: { $gte: range.from, $lte: range.to },
        },
      },
      { $group: { _id: '$vehicleNumberSnapshot', completed: { $sum: 1 } } },
    ]),
    Vehicle.find({ isActive: true }).sort({ vehicleNumber: 1 }).select('vehicleNumber'),
    Job.countDocuments({ jobDate: { $gte: range.from, $lte: range.to } }),
  ]);

  const countMap = new Map(counts.map((row) => [row._id, row.completed]));
  const trucks = vehicles.map((vehicle) => ({
    vehicleNumber: vehicle.vehicleNumber,
    completed: countMap.get(vehicle.vehicleNumber) ?? 0,
  }));

  for (const [vehicleNumber, completed] of countMap) {
    if (!trucks.some((truck) => truck.vehicleNumber === vehicleNumber)) {
      trucks.push({ vehicleNumber, completed });
    }
  }

  trucks.sort((a, b) => b.completed - a.completed || a.vehicleNumber.localeCompare(b.vehicleNumber));

  return {
    period,
    from: range.from,
    to: range.to,
    hires,
    trucks,
  };
}
