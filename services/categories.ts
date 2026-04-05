import { apiClient } from "@/lib/api-client";
import type { TransactionCategory } from "@/types/finance";

export const categoriesQueryKey = ["transaction-categories"] as const;

interface CategoriesApiResponse {
  data: TransactionCategory[];
  meta: {
    total: number;
    hasNextPage: boolean;
  };
}

interface CategoryApiResponse {
  data: TransactionCategory;
}

export interface CreateCategoryPayload {
  name: string;
  icon?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
}

export async function fetchCategories(): Promise<TransactionCategory[]> {
  const allCategories: TransactionCategory[] = [];
  let cursor: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const params: { limit: number; cursor?: string } = { limit: 50 };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await apiClient.get<CategoriesApiResponse>("/categories", {
      params,
    });

    const { data, meta } = response.data;
    allCategories.push(...data);
    hasNextPage = meta.hasNextPage;

    if (hasNextPage && data.length > 0) {
      cursor = data[data.length - 1].id;
    }
  }

  return allCategories;
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<TransactionCategory> {
  const response = await apiClient.post<CategoryApiResponse>("/categories", payload);

  return response.data.data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<TransactionCategory> {
  const response = await apiClient.patch<CategoryApiResponse>(`/categories/${id}`, payload);

  return response.data.data;
}

export async function deleteCategory(id: string): Promise<TransactionCategory> {
  const response = await apiClient.delete<CategoryApiResponse>(`/categories/${id}`);

  return response.data.data;
}
