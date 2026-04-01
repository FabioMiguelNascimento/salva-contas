import { apiClient } from "@/lib/api-client";

export type ReportFeature =
  | "contas"
  | "cartoes"
  | "transacoes"
  | "assinaturas"
  | "orcamentos"
  | "cofrinhos";

export type ReportFormat = "csv" | "pdf";

export type ReportFilters = {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  query?: string;
  categoryId?: string;
  type?: "expense" | "income";
  status?: "paid" | "pending";
};

export interface ExportReportOptions {
  feature: ReportFeature;
  format: ReportFormat;
  filters?: ReportFilters;
}

export interface ReportPreviewResult {
  headers: string[];
  rows: Array<Array<string | number | null>>;
}

function getFileNameFromDisposition(contentDisposition?: string | null) {
  if (!contentDisposition) return null;
  const match = /filename\*?=(?:UTF-8''|\")?([^\";]+)/i.exec(contentDisposition);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1].replace(/\"/g, "").trim());
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function exportReport({ feature, format, filters }: ExportReportOptions) {
  const response = await apiClient.get<Blob>(`/reports/${feature}/export`, {
    params: {
      format,
      ...filters,
    },
    responseType: "blob",
  });

  const contentDisposition = response.headers["content-disposition"] as string | undefined;
  const extension = format === "csv" ? "csv" : "pdf";
  const fallbackName = `${feature}-report-${new Date().toISOString().slice(0, 10)}.${extension}`;
  const fileName = getFileNameFromDisposition(contentDisposition) ?? fallbackName;

  triggerDownload(response.data, fileName);
}

export async function getReportPreview(
  feature: ReportFeature,
  filters?: ReportFilters & { limit?: number },
): Promise<ReportPreviewResult> {
  const response = await apiClient.get<{ data: ReportPreviewResult } | ReportPreviewResult>(
    `/reports/${feature}/preview`,
    { params: filters },
  );

  const payload = response.data as any;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as ReportPreviewResult;
  }

  return payload as ReportPreviewResult;
}
