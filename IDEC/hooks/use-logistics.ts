import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createJobRequest,
  createUserRequest,
  createVehicleRequest,
  deleteJobRequest,
  finalizeDayRequest,
  getDailyJobs,
  getJob,
  getCompletedByVehicle,
  listUsersRequest,
  listVehiclesRequest,
  setUserStatusRequest,
  setVehicleStatusRequest,
  updateJobRequest,
  updateUserRequest,
  updateVehicleRequest,
} from '@/api/logistics';
import { JobStatus } from '@/types';
import { useAuth } from '@/store/auth';

export function useCurrentUser() {
  return useAuth().user;
}

export function useCompletedByVehicle(period: 'week' | 'month', date: string) {
  return useQuery({
    queryKey: ['analytics', 'completed-by-vehicle', period, date],
    queryFn: () => getCompletedByVehicle(period, date),
    enabled: Boolean(date),
  });
}

export function useDailyJobs(date: string) {
  return useQuery({
    queryKey: ['daily-jobs', date],
    queryFn: () => getDailyJobs(date),
    enabled: Boolean(date),
  });
}

export function useJob(id?: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => getJob(id as string),
    enabled: Boolean(id),
  });
}

export function useVehicles(active?: boolean, enabled = true) {
  return useQuery({
    queryKey: ['vehicles', active],
    queryFn: () => listVehiclesRequest(active),
    enabled,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: listUsersRequest,
  });
}

function useInvalidateJobs() {
  const queryClient = useQueryClient();
  return (date?: string) => {
    queryClient.invalidateQueries({ queryKey: ['daily-jobs'] });
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    if (date) queryClient.invalidateQueries({ queryKey: ['daily-jobs', date] });
  };
}

export function useCreateJob() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: createJobRequest,
    onSuccess: (job) => invalidate(job.jobDate),
  });
}

export function useUpdateJob() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{ jobDate: string; vehicleId: string; destination: string; status: JobStatus; notes: string }>;
    }) => updateJobRequest(id, payload),
    onSuccess: (job) => invalidate(job.jobDate),
  });
}

export function useDeleteJob() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: ({ id }: { id: string; date: string }) => deleteJobRequest(id),
    onSuccess: (_data, vars) => invalidate(vars.date),
  });
}

export function useFinalizeDay() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: finalizeDayRequest,
    onSuccess: (day) => invalidate(day.date),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicleRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { vehicleNumber?: string; description?: string } }) =>
      updateVehicleRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useSetVehicleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setVehicleStatusRequest(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; role?: string; password?: string } }) =>
      updateUserRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setUserStatusRequest(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
