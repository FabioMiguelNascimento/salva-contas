import { apiClient } from "@/lib/api-client";
import type {
    CreateCreditCardPayload,
    CreditCard,
    CreditCardFilters,
    CreditCardSummary,
    UpdateCreditCardPayload,
} from "@/types/finance";

type ApiCreditCard = Omit<CreditCard, "limit" | "availableLimit"> & {
  limit: string | number;
  availableLimit: string | number;
};

type ApiCreditCardSummary = Omit<CreditCardSummary, "creditCard" | "currentDebt" | "availableLimit"> & {
  creditCard: ApiCreditCard;
  currentDebt: string | number;
  availableLimit: string | number;
};

type ApiResponse<T> = T | { data: T };

const toNumber = (value: string | number): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
};

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const normalizeCreditCard = (card: ApiCreditCard): CreditCard => ({
  ...card,
  limit: toNumber(card.limit),
  availableLimit: toNumber(card.availableLimit),
});

const normalizeCreditCardSummary = (summary: ApiCreditCardSummary): CreditCardSummary => ({
  ...summary,
  creditCard: normalizeCreditCard(summary.creditCard),
  currentDebt: toNumber(summary.currentDebt),
  availableLimit: toNumber(summary.availableLimit),
});

export async function fetchCreditCards(filters?: CreditCardFilters): Promise<CreditCard[]> {
  const response = await apiClient.get<ApiResponse<ApiCreditCard[]>>("/credit-cards", {
    params: filters,
  });

  const cards = unwrapData(response.data);
  return Array.isArray(cards) ? cards.map(normalizeCreditCard) : [];
}

export async function fetchCreditCard(id: string): Promise<CreditCard> {
  const response = await apiClient.get<ApiResponse<ApiCreditCard>>(`/credit-cards/${id}`);
  return normalizeCreditCard(unwrapData(response.data));
}

export async function fetchCreditCardSummary(id: string): Promise<CreditCardSummary> {
  const response = await apiClient.get<ApiResponse<ApiCreditCardSummary>>(`/credit-cards/${id}/summary`);
  return normalizeCreditCardSummary(unwrapData(response.data));
}

export async function createCreditCard(payload: CreateCreditCardPayload): Promise<CreditCard> {
  const response = await apiClient.post<ApiResponse<ApiCreditCard>>("/credit-cards", payload);
  return normalizeCreditCard(unwrapData(response.data));
}

export async function updateCreditCard(id: string, payload: UpdateCreditCardPayload): Promise<CreditCard> {
  const response = await apiClient.put<ApiResponse<ApiCreditCard>>(`/credit-cards/${id}`, payload);
  return normalizeCreditCard(unwrapData(response.data));
}

export async function deleteCreditCard(id: string): Promise<void> {
  await apiClient.delete(`/credit-cards/${id}`);
}
