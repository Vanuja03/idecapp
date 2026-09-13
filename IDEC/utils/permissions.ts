import { UserRole } from '@/types';

export function canCreateJob(role?: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.OPERATOR;
}

export function canUpdateJob(role?: UserRole) {
  return canCreateJob(role);
}

export function canDeleteJob(role?: UserRole) {
  return role === UserRole.ADMIN;
}

export function canFinalize(role?: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.MANAGER;
}

export function canManageVehicles(role?: UserRole) {
  return role === UserRole.ADMIN;
}

export function canManageUsers(role?: UserRole) {
  return role === UserRole.ADMIN;
}

export function canViewVehiclesScreen(role?: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.MANAGER;
}
