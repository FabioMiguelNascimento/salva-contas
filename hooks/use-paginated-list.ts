import { useMemo } from "react";

export function usePaginatedList<T>(
  items: T[],
  page: number,
  pageSize: number
) {
  const totalPages = useMemo(() => Math.max(Math.ceil(items.length / pageSize), 1), [items.length, pageSize]);
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { paginated, totalPages };
}
