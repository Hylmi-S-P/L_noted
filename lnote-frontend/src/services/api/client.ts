import axios from 'axios';
import { Platform } from 'react-native';
import { clearToken, getToken } from '../storage/tokenStorage';

const defaultBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl,
  timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 30000),
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearToken();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);
