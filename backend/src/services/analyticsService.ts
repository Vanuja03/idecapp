import { Job } from '../models/Job';
import { Vehicle } from '../models/Vehicle';
import { JobStatus, VehicleSource } from '../types';
import { monthRangeContaining, todayInTimezone, weekRangeContaining } from '../utils/dates';

export async function completedByVehicle(period: 'week' | 'month', date?: string) {
  const anchor = date ?? todayInTimezone();
  const range = period === 'week' ? weekRangeContaining(anchor) : monthRangeContaining(anchor);

  // Temporary (OTHER) lorries are excluded; legacy jobs without vehicleSource count as OWN
  const ownJobsInRange = {
    jobDate: { $gte: range.from, $lte: range.to },
    vehicleSource: { $ne: VehicleSource.OTHER },
  };

  const [counts, vehicles, hires] = await Promise.all([
    Job.aggregate<{ _id: string; completed: number }>([
      { $match: { ...ownJobsInRange, status: JobStatus.COMPLETED } },
      { $group: { _id: '$vehicleNumberSnapshot', completed: { $sum: 1 } } },
    ]),
    Vehicle.find({ isActive: true }).sort({ vehicleNumber: 1 }).select('vehicleNumber'),
    Job.countDocuments(ownJobsInRange),
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
