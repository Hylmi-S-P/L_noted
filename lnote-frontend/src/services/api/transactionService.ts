import { apiClient } from './client';
import { ApiEnvelope, DailyReport, ServicePrice, SummaryReport, Transaction } from '../../types/domain';

export async function getServicePrices(): Promise<ServicePrice[]> {
  const response = await apiClient.get<ApiEnvelope<ServicePrice[]>>('/service-prices');
  return response.data.data;
}

export async function createServicePrice(payload: {
  service_type: string;
  price_per_kg: number;
  name?: string;
  unit?: string;
  notes?: string;
}): Promise<ServicePrice> {
  const response = await apiClient.post<ApiEnvelope<ServicePrice>>('/service-prices', payload);
  return response.data.data;
}

export async function updateServicePrice(id: number, payload: Partial<{
  service_type: string;
  price_per_kg: number;
  name: string;
  unit: string;
  notes: string;
}>): Promise<ServicePrice> {
  const response = await apiClient.put<ApiEnvelope<ServicePrice>>(`/service-prices/${id}`, payload);
  return response.data.data;
}

export async function deleteServicePrice(id: number): Promise<void> {
  await apiClient.delete(`/service-prices/${id}`);
}

export async function createTransaction(payload: {
  customer_id: number;
  service_price_id: number;
  weight_kg: number;
  manual_total_price?: number;
  notes?: string;
}): Promise<Transaction> {
  const response = await apiClient.post<ApiEnvelope<Transaction>>('/transactions', payload);
  return response.data.data;
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<ApiEnvelope<Transaction[]>>('/transactions');
  return response.data.data;
}

export async function getFilteredTransactions(params: {
  status?: string;
  payment_status?: string;
  customer?: string;
  date?: string;
}): Promise<Transaction[]> {
  const response = await apiClient.get<ApiEnvelope<Transaction[]>>('/transactions', { params });
  return response.data.data;
}

export async function getDailyReport(): Promise<DailyReport> {
  const response = await apiClient.get<ApiEnvelope<DailyReport>>('/reports/daily');
  return response.data.data;
}

export async function getSummaryReport(from: string, to: string): Promise<SummaryReport> {
  const response = await apiClient.get<ApiEnvelope<SummaryReport>>('/reports/summary', { params: { from, to } });
  return response.data.data;
}

export async function exportReportCsv(from: string, to: string): Promise<string> {
  const response = await apiClient.get<string>('/reports/export', {
    params: { from, to },
    responseType: 'text',
  });
  return response.data;
}

export async function getTransaction(id: number): Promise<Transaction> {
  const response = await apiClient.get<ApiEnvelope<Transaction>>(`/transactions/${id}`);
  return response.data.data;
}

export async function updateTransactionStatus(id: number, status: Transaction['status']): Promise<Transaction> {
  const response = await apiClient.patch<ApiEnvelope<Transaction>>(`/transactions/${id}/status`, { status });
  return response.data.data;
}

export async function updateTransactionPayment(id: number, payment_status: Transaction['payment_status']): Promise<Transaction> {
  const response = await apiClient.patch<ApiEnvelope<Transaction>>(`/transactions/${id}/payment`, { payment_status });
  return response.data.data;
}

export async function batchPayTransactions(transactionIds: number[]): Promise<{
  customer_id: number;
  total_paid: number;
  transaction_count: number;
  transactions: Transaction[];
}> {
  const response = await apiClient.post<ApiEnvelope<{
    customer_id: number;
    total_paid: number;
    transaction_count: number;
    transactions: Transaction[];
  }>>('/transactions/batch-payment', {
    transaction_ids: transactionIds,
    payment_status: 'lunas',
  });
  return response.data.data;
}
