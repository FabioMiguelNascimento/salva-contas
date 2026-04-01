import { exportReport, type ReportFeature, type ReportFilters, type ReportFormat } from "@/services/reports";
import { useMutation } from "@tanstack/react-query";

export function useReportExport(feature: ReportFeature, filters: ReportFilters) {
  const mutation = useMutation({
    mutationFn: async (format: ReportFormat) => {
      await exportReport({ feature, format, filters });
    },
  });

  const handleExport = async (format: ReportFormat) => {
    await mutation.mutateAsync(format);
  };

  return {
    handleExport,
    exportingFormat: mutation.variables ?? null,
    isExporting: mutation.isPending,
  };
}
