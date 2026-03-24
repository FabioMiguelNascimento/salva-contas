"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  createBudget,
  deleteBudget,
  updateBudget
} from "@/services/budgets";
import { fetchCategories } from "@/services/categories";
import {
  createCreditCard,
  deleteCreditCard,
  fetchCreditCards,
  updateCreditCard
} from "@/services/credit-cards";
import { fetchDashboardSnapshot } from "@/services/dashboard";
import {
  createDebitCard,
  deleteDebitCard,
  fetchDebitCards,
  updateDebitCard
} from "@/services/debit-cards";
import { createSubscription, deleteSubscription, updateSubscription } from "@/services/subscriptions";
import {
  deleteTransaction,
  fetchTransactions,
  processTransaction,
  updateTransaction
} from "@/services/transactions";
import {
  addVaultYield,
  aiActionOnVault,
  aiCommand,
  createVault,
  deleteVault,
  depositToVault,
  updateVault,
  withdrawFromVault,
} from "@/services/vaults";
import type {
  Budget,
  BudgetProgress,
  CreateBudgetPayload,
  CreateCreditCardPayload,
  CreateDebitCardPayload,
  CreateSubscriptionPayload,
  CreateVaultPayload,
  CreditCard,
  DashboardMetrics,
  DebitCard,
  ProcessTransactionClientPayload,
  Subscription,
  Transaction,
  TransactionCategory,
  TransactionFilters,
  UpdateBudgetPayload,
  UpdateCreditCardPayload,
  UpdateDebitCardPayload,
  UpdateSubscriptionPayload,
  UpdateTransactionPayload,
  UpdateVaultPayload,
  Vault,
  VaultAiActionPayload,
  VaultAmountPayload,
} from "@/types/finance";
import { usePathname } from "next/navigation";
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
  debitCards: DebitCard[];
  vaults: Vault[];
  refresh: () => Promise<void>;
  processUnstructuredTransaction: (payload: ProcessTransactionClientPayload) => Promise<Transaction | void>;
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
  createDebitCardEntry: (payload: CreateDebitCardPayload) => Promise<DebitCard | void>;
  updateDebitCardEntry: (id: string, payload: UpdateDebitCardPayload) => Promise<DebitCard | void>;
  deleteDebitCardEntry: (id: string) => Promise<void>;
  createVaultEntry: (payload: CreateVaultPayload) => Promise<Vault | void>;
  updateVaultEntry: (id: string, payload: UpdateVaultPayload) => Promise<Vault | void>;
  deleteVaultEntry: (id: string) => Promise<void>;
  depositVaultAmount: (id: string, payload: VaultAmountPayload) => Promise<Vault | void>;
  withdrawVaultAmount: (id: string, payload: VaultAmountPayload) => Promise<Vault | void>;
  addVaultYieldAmount: (id: string, payload: VaultAmountPayload) => Promise<Vault | void>;
  aiActionOnVault: (id: string, payload: VaultAiActionPayload) => Promise<Vault | void>;
  aiCommand: (text: string) => Promise<Vault | void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const today = new Date();
const initialFilters: TransactionFilters = {
  month: today.getMonth() + 1,
  year: today.getFullYear(),
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const isTransactionsRoute = pathname.startsWith("/extrato");
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [debitCards, setDebitCards] = useState<DebitCard[]>([]);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsSyncing(true);
    try {
      if (isTransactionsRoute) {
        const [allTransactions, allCategories, allCreditCards, allDebitCards] = await Promise.all([
          fetchTransactions({ ...filters, limit: 1000 }),
          fetchCategories(),
          fetchCreditCards(),
          fetchDebitCards(),
        ]);

        setTransactions(allTransactions);
        setCategories(allCategories);
        setCreditCards(allCreditCards);
        setDebitCards(allDebitCards);
      } else {
        const snapshot = await fetchDashboardSnapshot(filters);

        setTransactions(snapshot.transactions);
        setMetrics(snapshot.metrics);
        setSubscriptions(snapshot.subscriptions);
        setBudgets(snapshot.budgets);
        setBudgetProgress(snapshot.budgetProgress);
        setCategories(snapshot.categories);
        setCreditCards(snapshot.creditCards);
        setDebitCards(snapshot.debitCards);
        setVaults(snapshot.vaults ?? []);
      }

      setLastSync(new Date().toISOString());
      setError(null);
    } catch (err) {
      console.error("Falha ao sincronizar dados", err);
      setError("Não foi possível sincronizar com a API.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [filters, isTransactionsRoute]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setIsLoading(true);
      loadData();
      return;
    }

    if (!authLoading && !isAuthenticated) {
      setTransactions([]);
      setMetrics(null);
      setSubscriptions([]);
      setBudgets([]);
      setBudgetProgress([]);
      setCategories([]);
      setCreditCards([]);
      setDebitCards([]);
      setVaults([]);
      setIsLoading(false);
      setError(null);
      setLastSync(null);
    }
  }, [loadData, isAuthenticated, authLoading]);

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

  const createDebitCardEntry = async (payload: CreateDebitCardPayload) => {
    try {
      const card = await createDebitCard(payload);
      setDebitCards((prev) => [card, ...prev]);
      return card;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cartão de débito");
      throw err;
    }
  };

  const updateDebitCardEntry = async (id: string, payload: UpdateDebitCardPayload) => {
    try {
      const card = await updateDebitCard(id, payload);
      setDebitCards((prev) => prev.map((item) => (item.id === id ? card : item)));
      return card;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar cartão de débito");
      throw err;
    }
  };

  const deleteDebitCardEntry = async (id: string) => {
    try {
      await deleteDebitCard(id);
      setDebitCards((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover cartão de débito");
      throw err;
    }
  };

  const createVaultEntry = async (payload: CreateVaultPayload) => {
    try {
      const vault = await createVault(payload);
      setVaults((prev) => [vault, ...prev]);
      await loadData();
      return vault;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cofrinho");
      throw err;
    }
  };

  const updateVaultEntry = async (id: string, payload: UpdateVaultPayload) => {
    try {
      const vault = await updateVault(id, payload);
      setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
      await loadData();
      return vault;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar cofrinho");
      throw err;
    }
  };

  const deleteVaultEntry = async (id: string) => {
    try {
      await deleteVault(id);
      setVaults((prev) => prev.filter((item) => item.id !== id));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover cofrinho");
      throw err;
    }
  };

  const depositVaultAmount = async (id: string, payload: VaultAmountPayload) => {
    try {
      const vault = await depositToVault(id, payload);
      setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
      await loadData();
      return vault;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar valor");
      throw err;
    }
  };

  const withdrawVaultAmount = async (id: string, payload: VaultAmountPayload) => {
    try {
      const vault = await withdrawFromVault(id, payload);
      setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
      await loadData();
      return vault;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao resgatar valor");
      throw err;
    }
  };

  const addVaultYieldAmount = async (id: string, payload: VaultAmountPayload) => {
    try {
      const vault = await addVaultYield(id, payload);
      setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
      await loadData();
      return vault;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar rendimento");
      throw err;
    }
  };

  const performAiActionOnVault = async (id: string, payload: VaultAiActionPayload) => {
    try {
      const vault = await aiActionOnVault(id, payload);
      setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
      await loadData();
      return vault;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar ação de IA no cofrinho");
      throw err;
    }
  };

  const aiCommandText = async (text: string) => {
    try {
      const vault = await aiCommand(text);
      setVaults((prev) => prev.map((item) => (item.id === vault.id ? vault : item)));
      await loadData();
      return vault;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar comando de IA");
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
    debitCards,
    vaults,
    refresh: loadData,
    processUnstructuredTransaction,
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
    createDebitCardEntry,
    updateDebitCardEntry,
    deleteDebitCardEntry,
    createVaultEntry,
    updateVaultEntry,
    deleteVaultEntry,
    depositVaultAmount,
    withdrawVaultAmount,
    addVaultYieldAmount,
    aiActionOnVault: performAiActionOnVault,
    aiCommand: aiCommandText,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
export { FinanceContext };

