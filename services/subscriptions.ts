import { apiClient } from "@/lib/api-client";
import type { CreateSubscriptionPayload, Subscription, UpdateSubscriptionPayload } from "@/types/finance";

interface ApiSubscription
  extends Omit<Subscription, "amount" | "category"> {
  amount: number | string;
  category?: Subscription["category"];
}

type ApiResponse<T> = T | { data: T };

const toNumber = (value: number | string): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeSubscription = (subscription: ApiSubscription): Subscription => ({
  ...subscription,
  amount: toNumber(subscription.amount),
  category: subscription.category ?? null,
  dayOfMonth: subscription.dayOfMonth ?? null,
  dayOfWeek: subscription.dayOfWeek ?? null,
  month: subscription.month ?? null,
  isActive: subscription.isActive ?? true,
});

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export async function fetchSubscriptions() {
  const response = await apiClient.get<ApiResponse<ApiSubscription[]>>("/subscriptions");
  const subscriptions = unwrapData(response.data);
  return (subscriptions ?? []).map(normalizeSubscription);
}

export async function createSubscription(payload: CreateSubscriptionPayload) {
  const response = await apiClient.post<ApiResponse<ApiSubscription>>("/subscriptions", payload);
  return normalizeSubscription(unwrapData(response.data));
}

export async function updateSubscription(id: string, payload: UpdateSubscriptionPayload) {
  const response = await apiClient.patch<ApiResponse<ApiSubscription>>(`/subscriptions/${id}`, payload);
  return normalizeSubscription(unwrapData(response.data));
}

export async function deleteSubscription(id: string) {
  await apiClient.delete(`/subscriptions/${id}`);
}
