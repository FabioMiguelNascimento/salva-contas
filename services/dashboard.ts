import { apiClient } from "@/lib/api-client";
import type {
    Budget,
    BudgetProgress,
    CreditCard,
    DashboardMetrics,
    DebitCard,
    Subscription,
    Transaction,
    TransactionCategory,
    TransactionFilters,
    Vault,
} from "@/types/finance";

type ApiDashboardData = {
  totalIncome?: number | string;
  totalExpenses?: number | string;
  netBalance?: number | string;
  availableBalance?: number | string;
  savedAmount?: number | string;
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

type ApiResponse<T> = T | { data: T };

type ApiTransaction = Omit<Transaction, "amount" | "category"> & {
  amount: string | number;
  category?: string | null;
};

type ApiSubscription = Omit<Subscription, "amount" | "category"> & {
  amount: number | string;
  category?: Subscription["category"];
};

type ApiCreditCard = Omit<CreditCard, "limit" | "availableLimit"> & {
  limit: string | number;
  availableLimit: string | number;
};

type ApiBudget = Omit<Budget, "amount"> & {
  amount: number | string;
};

type ApiBudgetProgress = Omit<BudgetProgress, "budget" | "spent" | "remaining" | "percentage"> & {
  budget: ApiBudget;
  spent: number | string;
  remaining: number | string;
  percentage: number | string;
};

type DashboardSnapshot = {
  metrics: DashboardMetrics;
  transactions: Transaction[];
  subscriptions: Subscription[];
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  categories: TransactionCategory[];
  creditCards: CreditCard[];
  debitCards: DebitCard[];
  vaults: Vault[];
};

type ApiVault = Omit<Vault, "targetAmount" | "currentAmount"> & {
  targetAmount?: number | string | null;
  currentAmount: number | string;
};

type ApiDashboardSnapshot = {
  metrics: ApiDashboardData;
  transactions: ApiTransaction[];
  subscriptions: ApiSubscription[];
  budgets: ApiBudget[];
  budgetProgress: ApiBudgetProgress[];
  categories: TransactionCategory[];
  creditCards: ApiCreditCard[];
  debitCards: DebitCard[];
  vaults: ApiVault[];
};

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

const unwrapPayload = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const normalizeTransaction = (transaction: ApiTransaction): Transaction => {
  const categoryLabel =
    transaction.categoryName ?? transaction.categoryRel?.name ?? transaction.category ?? "Sem categoria";

  return {
    ...transaction,
    amount: toNumber(transaction.amount),
    category: categoryLabel,
    categoryName: categoryLabel,
    categoryId: transaction.categoryId ?? transaction.categoryRel?.id ?? null,
    categoryRel: transaction.categoryRel ?? null,
    creditCard: transaction.creditCard ?? null,
    creditCardId: transaction.creditCardId ?? transaction.creditCard?.id ?? null,
    debitCard: transaction.debitCard ?? null,
    debitCardId: transaction.debitCardId ?? transaction.debitCard?.id ?? null,
  };
};

const normalizeSubscription = (subscription: ApiSubscription): Subscription => ({
  ...subscription,
  amount: toNumber(subscription.amount),
  category: subscription.category ?? null,
  dayOfMonth: subscription.dayOfMonth ?? null,
  dayOfWeek: subscription.dayOfWeek ?? null,
  month: subscription.month ?? null,
  isActive: subscription.isActive ?? true,
});

const normalizeCreditCard = (card: ApiCreditCard): CreditCard => ({
  ...card,
  limit: toNumber(card.limit),
  availableLimit: toNumber(card.availableLimit),
});

const normalizeBudget = (budget: ApiBudget): Budget => ({
  ...budget,
  amount: toNumber(budget.amount),
});

const normalizeBudgetProgress = (progress: ApiBudgetProgress): BudgetProgress => ({
  ...progress,
  budget: normalizeBudget(progress.budget),
  spent: toNumber(progress.spent),
  remaining: toNumber(progress.remaining),
  percentage: toNumber(progress.percentage),
});

const normalizeVault = (vault: ApiVault): Vault => ({
  ...vault,
  currentAmount: toNumber(vault.currentAmount),
  targetAmount:
    vault.targetAmount == null ? null : toNumber(vault.targetAmount),
});

const normalizeMetrics = (metrics: ApiDashboardData): DashboardMetrics => ({
  financials: {
    income: toNumber(metrics.totalIncome ?? 0),
    expenses: toNumber(metrics.totalExpenses ?? 0),
    balance: toNumber(metrics.netBalance ?? 0),
    availableBalance: toNumber(metrics.availableBalance ?? metrics.netBalance ?? 0),
    savedAmount: toNumber(metrics.savedAmount ?? 0),
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

export async function fetchDashboardSnapshot(filters: TransactionFilters): Promise<DashboardSnapshot> {
  const response = await apiClient.get<ApiResponse<ApiDashboardSnapshot>>("/dashboard/snapshot", {
    params: filters,
  });

  const payload = unwrapPayload(response.data);

  return {
    metrics: normalizeMetrics(payload.metrics ?? {}),
    transactions: (payload.transactions ?? []).map(normalizeTransaction),
    subscriptions: (payload.subscriptions ?? []).map(normalizeSubscription),
    budgets: (payload.budgets ?? []).map(normalizeBudget),
    budgetProgress: (payload.budgetProgress ?? []).map(normalizeBudgetProgress),
    categories: payload.categories ?? [],
    creditCards: (payload.creditCards ?? []).map(normalizeCreditCard),
    debitCards: payload.debitCards ?? [],
    vaults: (payload.vaults ?? []).map(normalizeVault),
  };
}
