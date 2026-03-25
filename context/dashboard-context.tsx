"use client";

import { fetchDashboardSnapshot } from "@/services/dashboard";
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
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface DashboardContextValue {
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSync: string | null;
  metrics: DashboardMetrics | null;
  transactions: Transaction[];
  pendingBills: Transaction[];
  categories: TransactionCategory[];
  subscriptions: Subscription[];
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  creditCards: CreditCard[];
  debitCards: DebitCard[];
  vaults: Vault[];
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const initialFilters: TransactionFilters = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname === "/" || pathname.startsWith("/\"");

  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [debitCards, setDebitCards] = useState<DebitCard[]>([]);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isDashboardRoute) return;

    setIsSyncing(true);
    try {
      const snapshot = await fetchDashboardSnapshot(filters);
      setMetrics(snapshot.metrics);
      setTransactions(snapshot.transactions);
      setCategories(snapshot.categories);
      setSubscriptions(snapshot.subscriptions);
      setBudgets(snapshot.budgets);
      setBudgetProgress(snapshot.budgetProgress);
      setCreditCards(snapshot.creditCards);
      setDebitCards(snapshot.debitCards);
      setVaults(snapshot.vaults);
      setLastSync(new Date().toISOString());
      setError(null);
    } catch (err) {
      console.error("Falha ao sincronizar dados do dashboard", err);
      setError(err instanceof Error ? err.message : "Não foi possível sincronizar com a API.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [filters, isDashboardRoute]);

  useEffect(() => {
    if (!isDashboardRoute) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    void refresh();
  }, [isDashboardRoute, refresh]);

  const pendingBills = transactions.filter((transaction) => transaction.status === "pending");

  return (
    <DashboardContext.Provider
      value={{
        filters,
        setFilters,
        isLoading,
        isSyncing,
        error,
        lastSync,
        metrics,
        transactions,
        pendingBills,
        categories,
        subscriptions,
        budgets,
        budgetProgress,
        creditCards,
        debitCards,
        vaults,
        refresh,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard deve ser utilizado dentro de DashboardProvider");
  }
  return context;
}
