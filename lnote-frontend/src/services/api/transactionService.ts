import { apiClient } from './client';
import { ApiEnvelope, ServicePrice, Transaction } from '../../types/domain';

export async function getServicePrices(): Promise<ServicePrice[]> {
  const response = await apiClient.get<ApiEnvelope<ServicePrice[]>>('/service-prices');
  return response.data.data;
}

export async function createTransaction(payload: {
  customer_id: number;
  service_price_id: number;
  quantity: number;
  notes?: string;
}): Promise<Transaction> {
  const response = await apiClient.post<ApiEnvelope<Transaction>>('/transactions', payload);
  return response.data.data;
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<ApiEnvelope<Transaction[]>>('/transactions');
  return response.data.data;
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

export async function scanReceiptImage(uri: string): Promise<{
  receipt_image_path: string;
  raw_text: string;
  total_price: number | null;
  confidence: number;
}> {
  const form = new FormData();
  form.append('receipt_image', {
    uri,
    name: `receipt-${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await apiClient.post<
    ApiEnvelope<{
      receipt_image_path: string;
      raw_text: string;
      total_price: number | null;
      confidence: number;
    }>
  >('/ocr/scan', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.data;
}
