/**
 * DEVELOPMENT SEED ONLY.
 * These passwords are for local/dev use. Change or remove them before production.
 */
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { UserRole } from '../types';
import { logger } from '../utils/logger';

const DEV_USERS = [
  { username: 'admin', password: 'Admin@123', name: 'Administrator', role: UserRole.ADMIN },
  { username: 'manager', password: 'Manager@123', name: 'Operations Manager', role: UserRole.MANAGER },
  { username: 'operator', password: 'Operator@123', name: 'Dispatch Operator', role: UserRole.OPERATOR },
  { username: 'viewer', password: 'Viewer@123', name: 'Read Only Viewer', role: UserRole.VIEWER },
];

const DEV_VEHICLES = [
  { vehicleNumber: 'LY-1547', description: 'Other lorry' },
  { vehicleNumber: 'LY-3589', description: 'Other lorry' },
  { vehicleNumber: 'LY-3905', description: 'Other lorry' },
  { vehicleNumber: 'LY-3906', description: 'Other lorry' },
  { vehicleNumber: 'LY-4425', description: 'Other lorry' },
  { vehicleNumber: 'LY-4426', description: 'Other lorry' },
  { vehicleNumber: 'LY-1607', description: 'Other lorry' },
  { vehicleNumber: 'LY-4469', description: 'Other lorry' },
  { vehicleNumber: 'JR-8000', description: '20"' },
  { vehicleNumber: 'LJ-0980', description: '40"' },
  { vehicleNumber: 'LY-4241', description: 'Other lorry' },
  { vehicleNumber: 'LY-5403', description: 'Other lorry' },
  { vehicleNumber: 'LY-4499', description: 'Other lorry' },
  { vehicleNumber: 'LI-3547', description: 'Other lorry' },
];

const REMOVED_DEMO_VEHICLES = ['ABC-1234', 'XYZ-5678', 'LMN-9012'];

async function seed() {
  await connectDatabase();

  for (const item of DEV_USERS) {
    const existing = await User.findOne({ username: item.username });
    if (existing) {
      logger.info({ username: item.username }, 'User already exists');
      continue;
    }
    const passwordHash = await bcrypt.hash(item.password, 12);
    await User.create({
      username: item.username,
      passwordHash,
      name: item.name,
      role: item.role,
      isActive: true,
    });
    logger.info({ username: item.username, role: item.role }, 'Seeded user (DEV PASSWORD — change in production)');
  }

  await Vehicle.deleteMany({ vehicleNumber: { $in: REMOVED_DEMO_VEHICLES } });

  for (const item of DEV_VEHICLES) {
    await Vehicle.findOneAndUpdate(
      { vehicleNumber: item.vehicleNumber },
      { $set: { vehicleNumber: item.vehicleNumber, description: item.description, isActive: true } },
      { upsert: true, new: true },
    );
    logger.info({ vehicleNumber: item.vehicleNumber, description: item.description }, 'Seeded vehicle');
  }

  logger.info('Seed complete. Do not use these passwords in production.');
  logger.info('Default admin login: admin / Admin@123');
}

seed()
  .then(() => disconnectDatabase())
  .catch(async (error) => {
    logger.error({ error }, 'Seed failed');
    await disconnectDatabase();
    process.exit(1);
  });
