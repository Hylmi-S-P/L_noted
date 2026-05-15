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
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
};

export type ServicePrice = {
  id: number;
  name: string;
  price: number;
  price_per_kg?: number | null;
  service_type?: string | null;
  unit?: string | null;
};

export type Transaction = {
  id: number;
  user_id: number;
  customer_id: number;
  service_price_id: number;
  quantity: number;
  amount: number;
  total_price?: number;
  weight_kg?: number | null;
  service_type?: string | null;
  price_per_kg?: number | null;
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

export type IntegrationStatus = {
  google_vision_configured: boolean;
  google_vision_ready?: boolean;
  google_vision_status?: string | null;
  google_vision_error_code?: string | null;
  google_vision_error_message?: string | null;
  fcm_configured: boolean;
  device_token_saved: boolean;
};

export type DailyReport = {
  date: string;
  total_revenue: number;
  paid_revenue: number;
  unpaid_total: number;
  total_transactions: number;
  unpaid_transactions: number;
};

export type ReportDay = {
  day: string;
  total_transactions: number;
  total_revenue: number;
  paid_revenue: number;
  unpaid_total: number;
};

export type SummaryReport = {
  from: string;
  to: string;
  total_revenue: number;
  paid_revenue: number;
  unpaid_total: number;
  total_transactions: number;
  unpaid_transactions: number;
  by_day: ReportDay[];
};
