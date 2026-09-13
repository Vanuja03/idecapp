import { ApiError } from '@/types';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const axiosError = error as {
    message?: string;
    response?: { data?: ApiError };
    code?: string;
  };
  if (axiosError?.code === 'ERR_NETWORK' || axiosError?.message === 'Network Error') {
    return 'No internet connection. Please check your network and try again.';
  }
  return axiosError?.response?.data?.message ?? fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as { response?: { data?: ApiError } };
  return axiosError?.response?.data?.errors ?? {};
}
