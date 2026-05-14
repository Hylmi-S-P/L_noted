import { ApiEnvelope, DailyReport, SummaryReport } from '../../types/domain';
import { apiClient } from './client';

export async function getDailyReport(): Promise<DailyReport> {
  const response = await apiClient.get<ApiEnvelope<DailyReport>>('/reports/daily');
  return response.data.data;
}

export async function getSummaryReport(from: string, to: string): Promise<SummaryReport> {
  const response = await apiClient.get<ApiEnvelope<SummaryReport>>('/reports/summary', {
    params: { from, to },
  });
  return response.data.data;
}
