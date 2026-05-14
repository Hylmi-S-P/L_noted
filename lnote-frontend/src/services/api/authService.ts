import { apiClient } from './client';
import { ApiEnvelope, User } from '../../types/domain';
import { clearToken, saveToken } from '../storage/tokenStorage';

type LoginResponse = {
  token: string;
  user: User;
};

export async function login(email: string, password: string): Promise<User> {
  const response = await apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', { email, password });
  await saveToken(response.data.data.token);
  return response.data.data.user;
}

export async function me(): Promise<User> {
  const response = await apiClient.get<ApiEnvelope<User>>('/auth/me');
  return response.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
  await clearToken();
}
