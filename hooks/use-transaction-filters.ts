import { useFinancePeriod } from "@/context/finance-period-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

export type TransactionFilters = {
  search: string;
  type: string;
  status: string;
  page: number;
  categoryId: string | null;
};

export function useTransactionFilters() {
  const { filters, setFilters } = useFinancePeriod();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramSearch = searchParams.get("search") ?? "";
  const paramType = (searchParams.get("type") as string) ?? "all";
  const paramStatus = (searchParams.get("status") as string) ?? "all";
  const paramPage = Number(searchParams.get("page") ?? "1") || 1;
  const paramCategoryId = searchParams.get("categoryId") ?? null;

  useEffect(() => {
    const currentCategoryId = filters.categoryId ?? null;
    if (paramCategoryId !== currentCategoryId) {
      setFilters({ ...filters, categoryId: paramCategoryId ?? undefined });
    }
  }, [paramCategoryId, filters, setFilters]);

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

  const setCategory = (value: string | null) => {
    updateQuery({ categoryId: value || null, page: 1 });
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

  return {
    filters: filtersObj,
    setType,
    setStatus,
    setCategory,
    setSearch,
    goToPage,
  };
}
