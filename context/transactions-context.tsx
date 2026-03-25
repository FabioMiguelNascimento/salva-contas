"use client";

import { fetchCategories } from "@/services/categories";
import {
  deleteTransaction,
  fetchTransactions,
  processTransaction,
  updateTransaction
} from "@/services/transactions";
import type {
  ProcessTransactionClientPayload,
  Transaction,
  TransactionCategory,
  UpdateTransactionPayload,
} from "@/types/finance";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFinancePeriod } from "./finance-period-context";

interface TransactionsContextValue {
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSync: string | null;
  transactions: Transaction[];
  pendingBills: Transaction[];
  categories: TransactionCategory[];
  refresh: (force?: boolean) => Promise<void>;
  processUnstructuredTransaction: (payload: ProcessTransactionClientPayload) => Promise<Transaction | void>;
  updateExistingTransaction: (id: string, payload: UpdateTransactionPayload) => Promise<Transaction | void>;
  markAsPaid: (id: string) => Promise<Transaction | void>;
  removeTransaction: (id: string) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { filters, refreshTicket, triggerRefresh } = useFinancePeriod();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        fetchTransactions(filters),
        fetchCategories(),
      ]);

      setTransactions(transactionsResponse);
      setCategories(categoriesResponse);
      setLastSync(new Date().toISOString());
      setError(null);
    } catch (err) {
      console.error("Falha ao sincronizar dados", err);
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

  const pendingBills = useMemo(
    () => transactions.filter((transaction) => transaction.status === "pending"),
    [transactions],
  );

  const processUnstructuredTransaction = useCallback(async (payload: ProcessTransactionClientPayload) => {
    const transaction = await processTransaction(payload);
    triggerRefresh();
    return transaction;
  }, [triggerRefresh]);

  const updateExistingTransaction = useCallback(async (id: string, payload: UpdateTransactionPayload) => {
    const transaction = await updateTransaction(id, payload);
    triggerRefresh();
    return transaction;
  }, [triggerRefresh]);

  const markAsPaid = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    const payload: UpdateTransactionPayload = {
      status: "paid",
      paymentDate: now,
    };
    const transaction = await updateTransaction(id, payload);
    triggerRefresh();
    return transaction;
  }, [triggerRefresh]);

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    triggerRefresh();
  }, [triggerRefresh]);

  return (
    <TransactionsContext.Provider
      value={{
        isLoading,
        isSyncing,
        error,
        lastSync,
        transactions,
        pendingBills,
        categories,
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
