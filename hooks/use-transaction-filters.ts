import { useFinance } from "@/hooks/use-finance";
import { removeAccents } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

export type TransactionFilters = {
  search: string;
  type: string;
  status: string;
  page: number;
  categoryId: string | null;
};

export function useTransactionFilters(pageSize = 8) {
  const { filters, setFilters, categories, transactions } = useFinance();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchTimeoutRef = useRef<number | null>(null);

  const paramSearch = searchParams.get("search") ?? "";
  const paramType = (searchParams.get("type") as string) ?? "all";
  const paramStatus = (searchParams.get("status") as string) ?? "all";
  const paramPage = Number(searchParams.get("page") ?? "1") || 1;
  const paramCategoryId = searchParams.get("categoryId") ?? null;

  useEffect(() => {
    if (paramCategoryId !== (filters as any).categoryId) {
      setFilters({ ...filters, categoryId: paramCategoryId ?? undefined });
    }
  }, [paramCategoryId]);

  const updateQuery = useCallback(
    (
      paramsToSet: Record<string, string | number | null | undefined>,
      { replace = false } = {}
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(paramsToSet).forEach(([key, val]) => {
        if (val === null || val === undefined || val === "") {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (replace) router.replace(url);
      else router.push(url);
    },
    [searchParams.toString(), pathname, router]
  );

  const setType = (value: string) => {
    updateQuery({ type: value === "all" ? null : value, page: 1 });
  };

  const setStatus = (value: string) => {
    updateQuery({ status: value === "all" ? null : value, page: 1 });
  };

  const setSearch = (value: string) => {
    updateQuery({ search: value || null, page: 1 }, { replace: true });
  };

  const goToPage = (newPage: number) => updateQuery({ page: newPage });

  const filtersObj = useMemo<TransactionFilters>(
    () => ({
      search: paramSearch,
      type: paramType,
      status: paramStatus,
      page: paramPage,
      categoryId: paramCategoryId,
    }),
    [paramSearch, paramType, paramStatus, paramPage, paramCategoryId]
  );

  const filteredTransactions = useMemo(() => {
    const categoryName = paramCategoryId
      ? categories.find((c) => c.id === paramCategoryId)?.name
      : undefined;

    return transactions.filter((transaction) => {
      const term = (paramSearch || "").trim().toLowerCase();
      const normalizedTerm = term ? removeAccents(term) : "";

      const description = transaction.description || "";
      const categoryText = transaction.category || "";

      const combined = `${description} ${categoryText}`;
      const normalizedCombined = removeAccents(combined.toLowerCase());

      const matchesSearch = normalizedTerm
        ? normalizedCombined.includes(normalizedTerm)
        : true;

      const matchesType = paramType === "all" || transaction.type === paramType;
      const matchesStatus = paramStatus === "all" || transaction.status === paramStatus;
      const matchesCategory = paramCategoryId
        ? transaction.categoryId === paramCategoryId ||
          (categoryName ? categoryText === categoryName : false)
        : true;
      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [transactions, paramSearch, paramType, paramStatus, paramCategoryId, categories]);

  return {
    filters: filtersObj,
    setType,
    setStatus,
    setSearch,
    goToPage,
    filteredTransactions,
  };
}
