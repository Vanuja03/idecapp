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
  { vehicleNumber: 'ABC-1234', description: '10 Ton Truck' },
  { vehicleNumber: 'XYZ-5678', description: '14 Ton Truck' },
  { vehicleNumber: 'LMN-9012', description: '18 Ton Truck' },
];

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

  for (const item of DEV_VEHICLES) {
    const existing = await Vehicle.findOne({ vehicleNumber: item.vehicleNumber });
    if (existing) {
      logger.info({ vehicleNumber: item.vehicleNumber }, 'Vehicle already exists');
      continue;
    }
    await Vehicle.create({ ...item, isActive: true });
    logger.info({ vehicleNumber: item.vehicleNumber }, 'Seeded vehicle');
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
