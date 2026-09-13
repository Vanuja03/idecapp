import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { AuthUser, UserRole } from '../types';
import { AppError } from '../utils/AppError';
import { toPublicUser } from '../utils/userPublic';

export async function login(username: string, password: string) {
  const user = await User.findOne({ username: username.trim().toLowerCase() }).select(
    '+passwordHash',
  );
  if (!user) {
    throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw new AppError('This account is inactive', 403, 'USER_INACTIVE');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as SignOptions,
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role as UserRole,
    },
  };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }
  return toPublicUser(user);
}

export async function listUsers() {
  const users = await User.find().sort({ createdAt: 1 });
  return users.map(toPublicUser);
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return toPublicUser(user);
}

export async function createUser(input: {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}) {
  const existing = await User.findOne({ username: input.username.trim().toLowerCase() });
  if (existing) {
    throw new AppError('Username is already taken', 409, 'USERNAME_TAKEN', {
      username: 'Username is already taken',
    });
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    username: input.username.trim().toLowerCase(),
    passwordHash,
    name: input.name.trim(),
    role: input.role,
    isActive: true,
  });
  return toPublicUser(user);
}

export async function updateUser(
  id: string,
  input: { name?: string; role?: UserRole; password?: string },
) {
  const user = await User.findById(id).select('+passwordHash');
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  if (input.name) user.name = input.name.trim();
  if (input.role) user.role = input.role;
  if (input.password) user.passwordHash = await bcrypt.hash(input.password, 12);
  await user.save();
  return toPublicUser(user);
}

export async function setUserStatus(id: string, isActive: boolean, actorId: string) {
  if (id === actorId && !isActive) {
    throw new AppError('You cannot deactivate your own account', 400, 'CANNOT_DEACTIVATE_SELF');
  }
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  user.isActive = isActive;
  await user.save();
  return toPublicUser(user);
}

export type { AuthUser };
