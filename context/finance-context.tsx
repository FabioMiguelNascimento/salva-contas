"use client";

import {
  createBudget,
  deleteBudget,
  fetchBudgetProgress,
  fetchBudgets,
  updateBudget,
} from "@/services/budgets";
import { fetchCategories } from "@/services/categories";
import {
  createCreditCard,
  deleteCreditCard,
  fetchCreditCards,
  updateCreditCard,
} from "@/services/credit-cards";
import { fetchDashboardMetrics } from "@/services/dashboard";
import { createSubscription, deleteSubscription, fetchSubscriptions, updateSubscription } from "@/services/subscriptions";
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  processTransaction,
  updateTransaction,
} from "@/services/transactions";
import type {
  Budget,
  BudgetProgress,
  CreateBudgetPayload,
  CreateCreditCardPayload,
  CreateSubscriptionPayload,
  CreditCard,
  DashboardMetrics,
  ManualTransactionPayload,
  ProcessTransactionClientPayload,
  Subscription,
  Transaction,
  TransactionCategory,
  TransactionFilters,
  UpdateBudgetPayload,
  UpdateCreditCardPayload,
  UpdateSubscriptionPayload,
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
  subscriptions: Subscription[];
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  categories: TransactionCategory[];
  creditCards: CreditCard[];
  refresh: () => Promise<void>;
  processUnstructuredTransaction: (payload: ProcessTransactionClientPayload) => Promise<Transaction | void>;
  createManualTransaction: (payload: ManualTransactionPayload) => Promise<Transaction | void>;
  updateExistingTransaction: (id: string, payload: UpdateTransactionPayload) => Promise<Transaction | void>;
  markAsPaid: (id: string) => Promise<Transaction | void>;
  removeTransaction: (id: string) => Promise<void>;
  createSubscriptionRule: (payload: CreateSubscriptionPayload) => Promise<Subscription | void>;
  updateSubscriptionRule: (id: string, payload: UpdateSubscriptionPayload) => Promise<Subscription | void>;
  deleteSubscriptionRule: (id: string) => Promise<void>;
  createBudgetRule: (payload: CreateBudgetPayload) => Promise<Budget | void>;
  updateBudgetRule: (id: string, payload: UpdateBudgetPayload) => Promise<Budget | void>;
  deleteBudgetRule: (id: string) => Promise<void>;
  createCreditCardEntry: (payload: CreateCreditCardPayload) => Promise<CreditCard | void>;
  updateCreditCardEntry: (id: string, payload: UpdateCreditCardPayload) => Promise<CreditCard | void>;
  deleteCreditCardEntry: (id: string) => Promise<void>;
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [transactionsResponse, metricsResponse, subscriptionsResponse, budgetsResponse, budgetProgressResponse, categoriesResponse, creditCardsResponse] = await Promise.all([
        fetchTransactions(filters),
        fetchDashboardMetrics(filters),
        fetchSubscriptions(),
        fetchBudgets({ month: filters.month, year: filters.year }),
        fetchBudgetProgress(filters.month, filters.year),
        fetchCategories(),
        fetchCreditCards(),
      ]);

      setTransactions(transactionsResponse);
      setMetrics(metricsResponse);
      setSubscriptions(subscriptionsResponse);
      setBudgets(budgetsResponse);
      setBudgetProgress(budgetProgressResponse);
      setCategories(categoriesResponse);
      setCreditCards(creditCardsResponse);
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

  const processUnstructuredTransaction = async (payload: ProcessTransactionClientPayload) => {
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

  const createSubscriptionRule = async (payload: CreateSubscriptionPayload) => {
    try {
      const subscription = await createSubscription(payload);
      setSubscriptions((prev) => [subscription, ...prev]);
      return subscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar assinatura");
      throw err;
    }
  };

  const updateSubscriptionRule = async (id: string, payload: UpdateSubscriptionPayload) => {
    try {
      const subscription = await updateSubscription(id, payload);
      setSubscriptions((prev) => prev.map((item) => (item.id === id ? subscription : item)));
      return subscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar assinatura");
      throw err;
    }
  };

  const deleteSubscriptionRule = async (id: string) => {
    try {
      await deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover assinatura");
      throw err;
    }
  };

  const createBudgetRule = async (payload: CreateBudgetPayload) => {
    try {
      const budget = await createBudget(payload);
      setBudgets((prev) => [budget, ...prev]);
      await loadData();
      return budget;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar orçamento");
      throw err;
    }
  };

  const updateBudgetRule = async (id: string, payload: UpdateBudgetPayload) => {
    try {
      const budget = await updateBudget(id, payload);
      setBudgets((prev) => prev.map((item) => (item.id === id ? budget : item)));
      await loadData();
      return budget;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar orçamento");
      throw err;
    }
  };

  const deleteBudgetRule = async (id: string) => {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((item) => item.id !== id));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover orçamento");
      throw err;
    }
  };

  const createCreditCardEntry = async (payload: CreateCreditCardPayload) => {
    try {
      const card = await createCreditCard(payload);
      setCreditCards((prev) => [card, ...prev]);
      return card;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cartão");
      throw err;
    }
  };

  const updateCreditCardEntry = async (id: string, payload: UpdateCreditCardPayload) => {
    try {
      const card = await updateCreditCard(id, payload);
      setCreditCards((prev) => prev.map((item) => (item.id === id ? card : item)));
      return card;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar cartão");
      throw err;
    }
  };

  const deleteCreditCardEntry = async (id: string) => {
    try {
      await deleteCreditCard(id);
      setCreditCards((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover cartão");
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
    subscriptions,
    budgets,
    budgetProgress,
    categories,
    creditCards,
    refresh: loadData,
    processUnstructuredTransaction,
    createManualTransaction,
    updateExistingTransaction,
    markAsPaid,
    removeTransaction,
    createSubscriptionRule,
    updateSubscriptionRule,
    deleteSubscriptionRule,
    createBudgetRule,
    updateBudgetRule,
    deleteBudgetRule,
    createCreditCardEntry,
    updateCreditCardEntry,
    deleteCreditCardEntry,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
export { FinanceContext };

