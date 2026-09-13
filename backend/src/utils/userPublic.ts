import { UserRole } from '../types';

export function toPublicUser(user: {
  _id: { toString(): string };
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date | null;
}) {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}
