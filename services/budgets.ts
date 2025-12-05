import { apiClient } from "@/lib/api-client";
import type {
    Budget,
    BudgetFilters,
    BudgetProgress,
    CreateBudgetPayload,
    UpdateBudgetPayload,
} from "@/types/finance";

type ApiResponse<T> = T | { data: T };

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export async function fetchBudgets(filters?: BudgetFilters): Promise<Budget[]> {
  const response = await apiClient.get<ApiResponse<Budget[]>>("/budgets", {
    params: filters,
  });

  return unwrapData(response.data) ?? [];
}

export async function fetchBudgetProgress(
  month: number,
  year: number
): Promise<BudgetProgress[]> {
  const response = await apiClient.get<ApiResponse<BudgetProgress[]>>(
    "/budgets/progress",
    {
      params: { month, year },
    }
  );

  return unwrapData(response.data) ?? [];
}

export async function createBudget(
  payload: CreateBudgetPayload
): Promise<Budget> {
  const response = await apiClient.post<ApiResponse<Budget>>(
    "/budgets",
    payload
  );

  return unwrapData(response.data);
}

export async function updateBudget(
  id: string,
  payload: UpdateBudgetPayload
): Promise<Budget> {
  const response = await apiClient.patch<ApiResponse<Budget>>(
    `/budgets/${id}`,
    payload
  );

  return unwrapData(response.data);
}

export async function deleteBudget(id: string): Promise<void> {
  await apiClient.delete(`/budgets/${id}`);
}
