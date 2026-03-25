import { apiClient } from '@/lib/api-client';
import type {
    CreateDebitCardPayload,
    DebitCard,
    DebitCardFilters,
    DebitCardMetrics,
    UpdateDebitCardPayload,
} from '@/types/finance';

type ApiResponse<T> = T | { data: T };

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export async function fetchDebitCards(filters?: DebitCardFilters): Promise<DebitCard[]> {
  const response = await apiClient.get<ApiResponse<DebitCard[]>>('/debit-cards', {
    params: filters,
  });

  const cards = unwrapData(response.data);
  return Array.isArray(cards) ? cards : [];
}

export async function createDebitCard(payload: CreateDebitCardPayload): Promise<DebitCard> {
  const response = await apiClient.post<ApiResponse<DebitCard>>('/debit-cards', payload);
  return unwrapData(response.data);
}

export async function updateDebitCard(id: string, payload: UpdateDebitCardPayload): Promise<DebitCard> {
  const response = await apiClient.put<ApiResponse<DebitCard>>(`/debit-cards/${id}`, payload);
  return unwrapData(response.data);
}

export async function deleteDebitCard(id: string): Promise<void> {
  await apiClient.delete(`/debit-cards/${id}`);
}

export async function fetchDebitCardMetrics(): Promise<DebitCardMetrics> {
  const response = await apiClient.get<{ data: DebitCardMetrics }>("/debit-cards/metrics");
  return response.data?.data ?? response.data;
}
