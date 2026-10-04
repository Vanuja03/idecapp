import { ApiError } from '@/types';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const axiosError = error as {
    message?: string;
    response?: { status?: number; data?: ApiError };
    code?: string;
  };
  if (axiosError?.code === 'ERR_NETWORK' || axiosError?.message === 'Network Error') {
    return 'Cannot reach the server. Please check your network and try again.';
  }
  if (axiosError?.code === 'ECONNABORTED' || axiosError?.code === 'ETIMEDOUT') {
    return 'The server took too long to respond. Please try again.';
  }
  const message = axiosError?.response?.data?.message;
  if (message) return message;
  const status = axiosError?.response?.status;
  if (status && status >= 500) {
    return `Server error (${status}). Please try again later.`;
  }
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as { response?: { data?: ApiError } };
  return axiosError?.response?.data?.errors ?? {};
}
