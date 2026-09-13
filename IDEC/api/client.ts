import axios, { AxiosError } from 'axios';
import { clearToken, getToken } from '@/services/secureToken';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:5000/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
