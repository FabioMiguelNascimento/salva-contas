"use client";

import { toDateOnlyString } from "@/lib/date-utils";
import { fetchCategories } from "@/services/categories";
import {
    deleteTransaction,
    fetchInstallmentTransactions,
    fetchTransactions,
    processTransaction,
    updateTransaction,
} from "@/services/transactions";
import type {
    ProcessTransactionClientPayload,
    Transaction,
    TransactionCategory,
    UpdateTransactionPayload,
} from "@/types/finance";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFinancePeriod } from "./finance-period-context";

type TransactionQueryParams = {
  page?: number;
  limit?: number;
  query?: string;
  categoryId?: string;
  type?: "expense" | "income";
  status?: "paid" | "pending";
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
};

interface TransactionsContextValue {
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSync: string | null;
  transactions: Transaction[];
  pendingBills: Transaction[];
  categories: TransactionCategory[];
  totalPages: number;
  currentPage: number;
  refresh: (page?: number, filters?: TransactionQueryParams) => Promise<void>;
  processUnstructuredTransaction: (payload: ProcessTransactionClientPayload) => Promise<Transaction | void>;
  updateExistingTransaction: (id: string, payload: UpdateTransactionPayload) => Promise<Transaction | void>;
  markAsPaid: (id: string) => Promise<Transaction | void>;
  removeTransaction: (id: string) => Promise<void>;
  fetchInstallmentTransactions: (transactionId: string) => Promise<Transaction[]>;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { filters, refreshTicket, triggerRefresh } = useFinancePeriod();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<TransactionQueryParams>({
    page: 1,
    limit: 15,
    month: filters.month,
    year: filters.year,
    startDate: filters.startDate,
    endDate: filters.endDate,
    categoryId: filters.categoryId,
  });

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      month: filters.month,
      year: filters.year,
      startDate: filters.startDate,
      endDate: filters.endDate,
      categoryId: filters.categoryId ?? prev.categoryId,
    }));
  }, [filters.month, filters.year, filters.startDate, filters.endDate, filters.categoryId]);

  const categoriesQuery = useQuery({
    queryKey: ["transaction-categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", queryParams, refreshTicket],
    queryFn: () =>
      fetchTransactions({
        ...queryParams,
        page: queryParams.page ?? 1,
        limit: queryParams.limit ?? 15,
        month: queryParams.month ?? filters.month,
        year: queryParams.year ?? filters.year,
      } as any),
    placeholderData: keepPreviousData,
  });

  const refresh = useCallback(async (page = 1, extraFilters: TransactionQueryParams = {}) => {
    setQueryParams((prev) => ({
      ...prev,
      page,
      limit: 15,
      ...extraFilters,
    }));
  }, []);

  const transactions = transactionsQuery.data?.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const totalPages = transactionsQuery.data?.meta.totalPages ?? 1;
  const currentPage = transactionsQuery.data?.meta.page ?? queryParams.page ?? 1;
  const isLoading = transactionsQuery.isLoading;
  const isSyncing = transactionsQuery.isFetching || categoriesQuery.isFetching;
  const error =
    (transactionsQuery.error instanceof Error
      ? transactionsQuery.error.message
      : categoriesQuery.error instanceof Error
        ? categoriesQuery.error.message
        : null) ?? null;
  const lastSync = transactionsQuery.dataUpdatedAt
    ? new Date(transactionsQuery.dataUpdatedAt).toISOString()
    : null;

  const pendingBills = useMemo(
    () => transactions.filter((transaction) => transaction.status === "pending"),
    [transactions],
  );

  const processUnstructuredTransaction = useCallback(async (payload: ProcessTransactionClientPayload) => {
    const transaction = await processTransaction(payload);
    triggerRefresh();
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    return transaction;
  }, [queryClient, triggerRefresh]);

  const updateExistingTransaction = useCallback(async (id: string, payload: UpdateTransactionPayload) => {
    const transaction = await updateTransaction(id, payload);
    triggerRefresh();
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    return transaction;
  }, [queryClient, triggerRefresh]);

  const fetchInstallments = useCallback(async (transactionId: string) => {
    return await fetchInstallmentTransactions(transactionId);
  }, []);

  const markAsPaid = useCallback(async (id: string) => {
    const payload: UpdateTransactionPayload = {
      status: "paid",
      paymentDate: toDateOnlyString(new Date()),
    };
    const transaction = await updateTransaction(id, payload);
    triggerRefresh();
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    return transaction;
  }, [queryClient, triggerRefresh]);

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    triggerRefresh();
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }, [queryClient, triggerRefresh]);

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
        totalPages,
        currentPage,
        refresh,
        processUnstructuredTransaction,
        updateExistingTransaction,
        markAsPaid,
        removeTransaction,
        fetchInstallmentTransactions: fetchInstallments,
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
