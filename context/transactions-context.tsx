"use client";

import { fetchCategories } from "@/services/categories";
import { fetchDashboardSnapshot } from "@/services/dashboard";
import {
    deleteTransaction,
    fetchTransactions,
    processTransaction,
    updateTransaction
} from "@/services/transactions";
import type {
    Budget,
    BudgetProgress,
    CreditCard,
    DashboardMetrics,
    DebitCard,
    ProcessTransactionClientPayload,
    Subscription,
    Transaction,
    TransactionCategory,
    TransactionFilters,
    UpdateTransactionPayload,
    Vault,
} from "@/types/finance";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface TransactionsContextValue {
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSync: string | null;
  transactions: Transaction[];
  pendingBills: Transaction[];
  metrics: DashboardMetrics | null;
  categories: TransactionCategory[];
  subscriptions: Subscription[];
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  creditCards: CreditCard[];
  debitCards: DebitCard[];
  vaults: Vault[];
  refresh: () => Promise<void>;
  processUnstructuredTransaction: (payload: ProcessTransactionClientPayload) => Promise<Transaction | void>;
  updateExistingTransaction: (id: string, payload: UpdateTransactionPayload) => Promise<Transaction | void>;
  markAsPaid: (id: string) => Promise<Transaction | void>;
  removeTransaction: (id: string) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

const initialFilters: TransactionFilters = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const snapshotRoutes = ["/"]; // dashboard apenas
  const transactionRoutes = ["/extrato", "/contas"]; // transações diretas
  const shouldLoadSnapshot = snapshotRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const shouldLoadTransactionList = transactionRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const shouldLoadTransactions = shouldLoadSnapshot || shouldLoadTransactionList;

  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
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
    if (!shouldLoadTransactions) return;

    setIsSyncing(true);
    try {
      if (shouldLoadSnapshot) {
        const snapshot = await fetchDashboardSnapshot(filters);
        setTransactions(snapshot.transactions);
        setMetrics(snapshot.metrics);
        setCategories(snapshot.categories);
        setSubscriptions(snapshot.subscriptions);
        setBudgets(snapshot.budgets);
        setBudgetProgress(snapshot.budgetProgress);
        setCreditCards(snapshot.creditCards);
        setDebitCards(snapshot.debitCards);
        setVaults(snapshot.vaults);
        setLastSync(new Date().toISOString());
        setError(null);
      } else if (shouldLoadTransactionList) {
        const [transactionsResponse, categoriesResponse] = await Promise.all([
          fetchTransactions(filters),
          fetchCategories(),
        ]);
        setTransactions(transactionsResponse);
        setCategories(categoriesResponse);
        setMetrics(null); // não chamar métricas extras em /extrato ou /contas
        setLastSync(new Date().toISOString());
        setError(null);
      }
    } catch (err) {
      console.error("Falha ao sincronizar dados", err);
      setError(err instanceof Error ? err.message : "Não foi possível sincronizar com a API.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [filters, shouldLoadTransactions, shouldLoadSnapshot, shouldLoadTransactionList]);

  useEffect(() => {
    if (!shouldLoadTransactions) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    void refresh();
  }, [refresh, shouldLoadTransactions]);

  const pendingBills = useMemo(
    () => transactions.filter((transaction) => transaction.status === "pending"),
    [transactions],
  );

  const upsertTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => {
      const exists = prev.some((item) => item.id === transaction.id);
      return exists ? prev.map((item) => (item.id === transaction.id ? transaction : item)) : [transaction, ...prev];
    });
  }, []);

  const processUnstructuredTransaction = useCallback(async (payload: ProcessTransactionClientPayload) => {
    const transaction = await processTransaction(payload);
    upsertTransaction(transaction);
    await refresh();
    return transaction;
  }, [refresh, upsertTransaction]);

  const updateExistingTransaction = useCallback(async (id: string, payload: UpdateTransactionPayload) => {
    const transaction = await updateTransaction(id, payload);
    upsertTransaction(transaction);
    await refresh();
    return transaction;
  }, [refresh, upsertTransaction]);

  const markAsPaid = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    const payload: UpdateTransactionPayload = {
      status: "paid",
      paymentDate: now,
    };
    const transaction = await updateTransaction(id, payload);
    upsertTransaction(transaction);
    await refresh();
    return transaction;
  }, [refresh, upsertTransaction]);

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    await refresh();
  }, [refresh]);

  return (
    <TransactionsContext.Provider
      value={{
        filters,
        setFilters,
        isLoading,
        isSyncing,
        error,
        lastSync,
        transactions,
        pendingBills,
        metrics,
        categories,
        subscriptions,
        budgets,
        budgetProgress,
        creditCards,
        debitCards,
        vaults,
        refresh,
        processUnstructuredTransaction,
        updateExistingTransaction,
        markAsPaid,
        removeTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions deve ser utilizado dentro de TransactionsProvider");
  }
  return context;
}
