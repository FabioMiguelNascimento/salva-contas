import { apiClient } from "@/lib/api-client";
import type { TransactionCategory } from "@/types/finance";

interface CategoriesApiResponse {
  data: TransactionCategory[];
  meta: {
    total: number;
    hasNextPage: boolean;
  };
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
