"use client";

import { categoriesQueryKey, fetchCategories } from "@/services/categories";
import type { TransactionCategory } from "@/types/finance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext } from "react";

interface CategoryContextValue {
  categories: TransactionCategory[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
  }, [queryClient]);

  return (
    <CategoryContext.Provider
      value={{
        categories: categoriesQuery.data ?? [],
        isLoading: categoriesQuery.isLoading,
        isSyncing: categoriesQuery.isFetching,
        error: categoriesQuery.error instanceof Error ? categoriesQuery.error.message : null,
        refresh,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories deve ser utilizado dentro de CategoryProvider");
  }

  return context;
}
