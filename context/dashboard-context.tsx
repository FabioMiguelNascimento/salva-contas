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
  Vault,
} from "@/types/finance";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useFinancePeriod } from "./finance-period-context";

interface DashboardContextValue {
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
  refresh: (force?: boolean) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { filters, refreshTicket } = useFinancePeriod();

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
  }, [filters]);

  const lastRefreshParams = useRef<{ refresh: any; refreshTicket: number } | null>(null);

  useEffect(() => {
    if (
      lastRefreshParams.current?.refresh === refresh &&
      lastRefreshParams.current?.refreshTicket === refreshTicket
    ) {
      return;
    }
    lastRefreshParams.current = { refresh, refreshTicket };
    void refresh();
  }, [refresh, refreshTicket]);

  const pendingBills = transactions.filter((transaction) => transaction.status === "pending");

  return (
    <DashboardContext.Provider
      value={{
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
