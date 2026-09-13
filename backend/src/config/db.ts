import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDatabase(uri = env.mongoUri): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
