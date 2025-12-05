"use client";

import { fetchDashboardMetrics } from "@/services/dashboard";
import {
    createTransaction,
    deleteTransaction,
    fetchTransactions,
    processTransaction,
    updateTransaction,
} from "@/services/transactions";
import type {
    DashboardMetrics,
    ManualTransactionPayload,
    ProcessTransactionPayload,
    Transaction,
    TransactionFilters,
    UpdateTransactionPayload,
} from "@/types/finance";
import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

interface FinanceContextValue {
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSync: string | null;
  transactions: Transaction[];
  pendingBills: Transaction[];
  metrics: DashboardMetrics | null;
  refresh: () => Promise<void>;
  processUnstructuredTransaction: (payload: ProcessTransactionPayload) => Promise<Transaction | void>;
  createManualTransaction: (payload: ManualTransactionPayload) => Promise<Transaction | void>;
  updateExistingTransaction: (id: string, payload: UpdateTransactionPayload) => Promise<Transaction | void>;
  markAsPaid: (id: string) => Promise<Transaction | void>;
  removeTransaction: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const today = new Date();
const initialFilters: TransactionFilters = {
  month: today.getMonth() + 1,
  year: today.getFullYear(),
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [transactionsResponse, metricsResponse] = await Promise.all([
        fetchTransactions(filters),
        fetchDashboardMetrics(filters),
      ]);

      setTransactions(transactionsResponse);
      setMetrics(metricsResponse);
      setLastSync(new Date().toISOString());
      setError(null);
    } catch (err) {
      console.error("Falha ao sincronizar dados", err);
      setError("Não foi possível sincronizar com a API.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingBills = useMemo(
    () => transactions.filter((transaction) => transaction.status === "pending"),
    [transactions]
  );

  const upsertTransaction = (transaction: Transaction) => {
    setTransactions((prev) => {
      const exists = prev.some((item) => item.id === transaction.id);
      return exists
        ? prev.map((item) => (item.id === transaction.id ? transaction : item))
        : [transaction, ...prev];
    });
  };

  const processUnstructuredTransaction = async (payload: ProcessTransactionPayload) => {
    try {
      const transaction = await processTransaction(payload);
      upsertTransaction(transaction);
      await loadData();
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar transação");
      throw err;
    }
  };

  const createManualTransaction = async (payload: ManualTransactionPayload) => {
    try {
      const transaction = await createTransaction(payload);
      upsertTransaction(transaction);
      await loadData();
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar transação");
      throw err;
    }
  };

  const updateExistingTransaction = async (id: string, payload: UpdateTransactionPayload) => {
    try {
      const transaction = await updateTransaction(id, payload);
      upsertTransaction(transaction);
      await loadData();
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar transação");
      throw err;
    }
  };

  const markAsPaid = async (id: string) => {
    const now = new Date().toISOString();
    const payload: UpdateTransactionPayload = {
      status: "paid",
      paymentDate: now,
    };

    try {
      const transaction = await updateTransaction(id, payload);
      upsertTransaction(transaction);
      await loadData();
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao pagar transação");
      throw err;
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover transação");
      throw err;
    }
  };

    const value: FinanceContextValue = {
    filters,
    setFilters,
    isLoading,
    isSyncing,
    error,
    lastSync,
    transactions,
    pendingBills,
    metrics,
    refresh: loadData,
    processUnstructuredTransaction,
    createManualTransaction,
    updateExistingTransaction,
    markAsPaid,
    removeTransaction,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
export { FinanceContext };

