import { apiClient } from "@/lib/api-client";
import type { DashboardMetrics, TransactionFilters } from "@/types/finance";

type ApiDashboardData = {
  totalIncome?: number | string;
  totalExpenses?: number | string;
  netBalance?: number | string;
  incomeChangePercent?: number | string;
  expensesChangePercent?: number | string;
  balanceChangePercent?: number | string;
  previousMonth?: {
    income?: number | string;
    expenses?: number | string;
    balance?: number | string;
  };
  categoryBreakdown?: Array<{
    category: string;
    income?: number | string;
    expenses?: number | string;
    net?: number | string;
  }>;
  pendingBills?: {
    count?: number | string;
    totalAmount?: number | string;
    overdue?: number | string;
  };
  lastUpdated?: string;
};

type ApiDashboardResponse = ApiDashboardData | { data: ApiDashboardData };

const toNumber = (value: number | string): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
};

const unwrapData = (payload: ApiDashboardResponse): ApiDashboardData => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: ApiDashboardData }).data ?? {};
  }
  return (payload as ApiDashboardData) ?? {};
};

const normalizeMetrics = (metrics: ApiDashboardData): DashboardMetrics => ({
  financials: {
    income: toNumber(metrics.totalIncome ?? 0),
    expenses: toNumber(metrics.totalExpenses ?? 0),
    balance: toNumber(metrics.netBalance ?? 0),
    incomeChangePercent: metrics.incomeChangePercent ? toNumber(metrics.incomeChangePercent) : undefined,
    expensesChangePercent: metrics.expensesChangePercent ? toNumber(metrics.expensesChangePercent) : undefined,
    balanceChangePercent: metrics.balanceChangePercent ? toNumber(metrics.balanceChangePercent) : undefined,
    previousMonth: metrics.previousMonth ? {
      income: toNumber(metrics.previousMonth.income ?? 0),
      expenses: toNumber(metrics.previousMonth.expenses ?? 0),
      balance: toNumber(metrics.previousMonth.balance ?? 0),
    } : undefined,
  },
  pendingBills: {
    count: Number(metrics.pendingBills?.count ?? 0),
    totalAmount: toNumber(metrics.pendingBills?.totalAmount ?? 0),
    overdue: Number(metrics.pendingBills?.overdue ?? 0),
  },
  categoryBreakdown: (metrics.categoryBreakdown ?? []).map((item) => ({
    category: item.category,
    total: toNumber(item.expenses ?? item.net ?? item.income ?? 0),
  })),
  lastUpdated: metrics.lastUpdated,
});

export async function fetchDashboardMetrics(filters: TransactionFilters) {
  const response = await apiClient.get<ApiDashboardResponse>("/dashboard/metrics", {
    params: filters,
  });

  const data = unwrapData(response.data);
  return normalizeMetrics(data);
}
