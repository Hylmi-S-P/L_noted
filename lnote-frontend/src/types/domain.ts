export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Customer = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type ServicePrice = {
  id: number;
  name: string;
  price: number;
  unit?: string | null;
};

export type Transaction = {
  id: number;
  user_id: number;
  customer_id: number;
  service_price_id: number;
  quantity: number;
  amount: number;
  status: 'pending' | 'proses' | 'selesai' | 'diambil';
  payment_status: 'belum_lunas' | 'lunas';
  due_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  service_price?: ServicePrice;
  servicePrice?: ServicePrice;
};

export type DailyReport = {
  date: string;
  total_revenue: number;
  transaction_count: number;
  unpaid_count: number;
};

export type SummaryReport = {
  from: string;
  to: string;
  total_revenue: number;
  transaction_count: number;
  unpaid_count: number;
};
