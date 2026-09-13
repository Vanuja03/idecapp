import { api } from '@/api/client';
import { AuthUser, DailyView, Job, JobStatus, Vehicle } from '@/types';

export async function loginRequest(username: string, password: string) {
  const { data } = await api.post<{ data: { token: string; user: AuthUser } }>('/auth/login', {
    username,
    password,
  });
  return data.data;
}

export async function meRequest() {
  const { data } = await api.get<{ data: { user: AuthUser } }>('/auth/me');
  return data.data.user;
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}

export async function getDailyJobs(date: string) {
  const { data } = await api.get<{ data: DailyView }>(`/daily-jobs/${date}`);
  return data.data;
}

export async function getJob(id: string) {
  const { data } = await api.get<{ data: { job: Job } }>(`/jobs/${id}`);
  return data.data.job;
}

export async function createJobRequest(payload: {
  jobDate: string;
  vehicleId: string;
  destination: string;
  status: JobStatus;
  notes?: string;
}) {
  const { data } = await api.post<{ data: { job: Job } }>('/jobs', payload);
  return data.data.job;
}

export async function updateJobRequest(
  id: string,
  payload: Partial<{
    jobDate: string;
    vehicleId: string;
    destination: string;
    status: JobStatus;
    notes: string;
  }>,
) {
  const { data } = await api.put<{ data: { job: Job } }>(`/jobs/${id}`, payload);
  return data.data.job;
}

export async function deleteJobRequest(id: string) {
  await api.delete(`/jobs/${id}`);
}

export async function finalizeDayRequest(date: string) {
  const { data } = await api.post<{ data: DailyView }>(`/daily-jobs/${date}/finalize`);
  return data.data;
}

export async function listVehiclesRequest(active?: boolean) {
  const { data } = await api.get<{ data: { vehicles: Vehicle[] } }>('/vehicles', {
    params: active === undefined ? undefined : { active: String(active) },
  });
  return data.data.vehicles;
}

export async function createVehicleRequest(payload: { vehicleNumber: string; description: string }) {
  const { data } = await api.post<{ data: { vehicle: Vehicle } }>('/vehicles', payload);
  return data.data.vehicle;
}

export async function updateVehicleRequest(
  id: string,
  payload: { vehicleNumber?: string; description?: string },
) {
  const { data } = await api.put<{ data: { vehicle: Vehicle } }>(`/vehicles/${id}`, payload);
  return data.data.vehicle;
}

export async function setVehicleStatusRequest(id: string, isActive: boolean) {
  const { data } = await api.patch<{ data: { vehicle: Vehicle } }>(`/vehicles/${id}/status`, { isActive });
  return data.data.vehicle;
}

export async function listUsersRequest() {
  const { data } = await api.get<{ data: { users: AuthUser[] } }>('/users');
  return data.data.users;
}

export async function createUserRequest(payload: {
  username: string;
  password: string;
  name: string;
  role: string;
}) {
  const { data } = await api.post<{ data: { user: AuthUser } }>('/users', payload);
  return data.data.user;
}

export async function updateUserRequest(
  id: string,
  payload: { name?: string; role?: string; password?: string },
) {
  const { data } = await api.put<{ data: { user: AuthUser } }>(`/users/${id}`, payload);
  return data.data.user;
}

export async function setUserStatusRequest(id: string, isActive: boolean) {
  const { data } = await api.patch<{ data: { user: AuthUser } }>(`/users/${id}/status`, { isActive });
  return data.data.user;
}
