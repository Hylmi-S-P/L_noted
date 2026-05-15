import { apiClient } from './client';
import { ApiEnvelope, Customer } from '../../types/domain';

export async function getCustomers(): Promise<Customer[]> {
  const response = await apiClient.get<ApiEnvelope<Customer[]>>('/customers');
  return response.data.data;
}

export async function createCustomer(payload: {
  name: string;
  phone_number?: string;
  address?: string;
}): Promise<Customer> {
  const response = await apiClient.post<ApiEnvelope<Customer>>('/customers', payload);
  return response.data.data;
}

export async function updateCustomer(id: number, payload: {
  name?: string;
  phone_number?: string;
  address?: string;
}): Promise<Customer> {
  const response = await apiClient.put<ApiEnvelope<Customer>>(`/customers/${id}`, payload);
  return response.data.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}
