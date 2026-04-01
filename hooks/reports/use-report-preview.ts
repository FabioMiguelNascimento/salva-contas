import { getReportPreview, type ReportFeature } from "@/services/reports";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useReportPreview(feature: ReportFeature, filters: Record<string, unknown>) {
  const query = useQuery({
    queryKey: ["report-preview", feature, filters],
    queryFn: () => getReportPreview(feature, { ...filters, limit: 50 }),
    placeholderData: keepPreviousData,
  });

  return {
    preview: query.data ?? null,
    isPreviewLoading: query.isLoading || query.isFetching,
    previewError: query.error instanceof Error ? query.error.message : null,
  };
}
