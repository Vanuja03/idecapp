import { Vehicle } from '../models/Vehicle';
import { AppError } from '../utils/AppError';

export async function listVehicles(activeOnly?: boolean) {
  const filter = activeOnly === undefined ? {} : { isActive: activeOnly };
  return Vehicle.find(filter).sort({ vehicleNumber: 1 });
}

export async function getVehicleById(id: string) {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'NOT_FOUND');
  return vehicle;
}

export async function createVehicle(input: { vehicleNumber: string; description: string }) {
  const vehicleNumber = input.vehicleNumber.trim().toUpperCase();
  const existing = await Vehicle.findOne({ vehicleNumber });
  if (existing) {
    throw new AppError('Vehicle number must be unique', 409, 'VEHICLE_EXISTS', {
      vehicleNumber: 'Vehicle number already exists',
    });
  }
  return Vehicle.create({
    vehicleNumber,
    description: input.description.trim(),
    isActive: true,
  });
}

export async function updateVehicle(
  id: string,
  input: { vehicleNumber?: string; description?: string },
) {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'NOT_FOUND');

  if (input.vehicleNumber) {
    const vehicleNumber = input.vehicleNumber.trim().toUpperCase();
    const existing = await Vehicle.findOne({ vehicleNumber, _id: { $ne: vehicle._id } });
    if (existing) {
      throw new AppError('Vehicle number must be unique', 409, 'VEHICLE_EXISTS', {
        vehicleNumber: 'Vehicle number already exists',
      });
    }
    vehicle.vehicleNumber = vehicleNumber;
  }
  if (input.description) vehicle.description = input.description.trim();
  await vehicle.save();
  return vehicle;
}

export async function setVehicleStatus(id: string, isActive: boolean) {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'NOT_FOUND');
  vehicle.isActive = isActive;
  await vehicle.save();
  return vehicle;
}
