export function updateQueryParams(
  searchParams: URLSearchParams,
  paramsToSet: Record<string, string | number | null | undefined>
): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString());
  Object.entries(paramsToSet).forEach(([key, val]) => {
    if (val === null || val === undefined || val === "") {
      params.delete(key);
    } else {
      params.set(key, String(val));
    }
  });
  return params;
}

export function buildUrl(pathname: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}