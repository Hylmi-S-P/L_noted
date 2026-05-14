import { apiClient } from './client';
import { ApiEnvelope, Customer } from '../../types/domain';

export async function getCustomers(): Promise<Customer[]> {
  const response = await apiClient.get<ApiEnvelope<Customer[]>>('/customers');
  return response.data.data;
}
