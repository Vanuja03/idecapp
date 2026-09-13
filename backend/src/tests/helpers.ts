import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../app';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { UserRole } from '../types';

export const app = createApp();

let mongo: MongoMemoryServer;

export async function startMemoryDb() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}

export async function stopMemoryDb() {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
}

export async function resetDb() {
  const collections = await mongoose.connection.db?.collections();
  if (!collections) return;
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function createUser(role: UserRole, overrides?: Partial<{ username: string; password: string; isActive: boolean }>) {
  const password = overrides?.password ?? 'Password@123';
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: (overrides?.username ?? role.toLowerCase()).toLowerCase(),
    passwordHash,
    name: `${role} User`,
    role,
    isActive: overrides?.isActive ?? true,
  });
  return { user, password };
}

export async function loginAs(role: UserRole, overrides?: Partial<{ username: string; password: string; isActive: boolean }>) {
  const { user, password } = await createUser(role, overrides);
  const res = await request(app).post('/api/auth/login').send({
    username: user.username,
    password,
  });
  return { token: res.body.data.token as string, user, password, res };
}

export async function authHeader(role: UserRole) {
  const session = await loginAs(role);
  return { Authorization: `Bearer ${session.token}`, session };
}

export async function createVehicle(vehicleNumber = 'ABC-1234', isActive = true) {
  return Vehicle.create({
    vehicleNumber,
    description: `${vehicleNumber} truck`,
    isActive,
  });
}
