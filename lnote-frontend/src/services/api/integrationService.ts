import { apiClient } from './client';
import { ApiEnvelope, IntegrationStatus } from '../../types/domain';

export async function getIntegrationStatus(): Promise<IntegrationStatus> {
  const response = await apiClient.get<ApiEnvelope<IntegrationStatus>>('/integrations/status');
  return response.data.data;
}

export async function sendTestNotification(): Promise<void> {
  await apiClient.post('/integrations/test-notification');
}

export async function saveDeviceToken(deviceToken: string): Promise<void> {
  await apiClient.post('/auth/device-token', { device_token: deviceToken });
}
