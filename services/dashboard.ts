import { apiClient } from "@/lib/api-client";
import type { DashboardMetrics, TransactionFilters } from "@/types/finance";

type ApiDashboardSummary = {
  financials: Record<keyof DashboardMetrics["financials"], number | string>;
  pendingBills: Record<keyof DashboardMetrics["pendingBills"], number | string>;
  categoryBreakdown: Array<{
    category: string;
    total: number | string;
  }>;
  lastUpdated?: string;
};

const toNumber = (value: number | string): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeMetrics = (metrics: ApiDashboardSummary): DashboardMetrics => ({
  financials: {
    income: toNumber(metrics.financials.income),
    expenses: toNumber(metrics.financials.expenses),
    balance: toNumber(metrics.financials.balance),
  },
  pendingBills: {
    count: Number(metrics.pendingBills.count ?? 0),
    totalAmount: toNumber(metrics.pendingBills.totalAmount),
    overdue: Number(metrics.pendingBills.overdue ?? 0),
  },
  categoryBreakdown: metrics.categoryBreakdown.map((item) => ({
    category: item.category,
    total: toNumber(item.total),
  })),
  lastUpdated: metrics.lastUpdated,
});

export async function fetchDashboardMetrics(filters: TransactionFilters) {
  const response = await apiClient.get<ApiDashboardSummary>("/dashboard/metrics", {
    params: filters,
  });

  return normalizeMetrics(response.data);
}
