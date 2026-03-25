"use client";

import {
    createBudget,
    deleteBudget,
    fetchBudgetProgress,
    fetchBudgets,
    updateBudget,
} from "@/services/budgets";
import type {
    Budget,
    BudgetFilters,
    BudgetProgress,
    CreateBudgetPayload,
    UpdateBudgetPayload,
} from "@/types/finance";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface BudgetsContextValue {
  filters: BudgetFilters;
  setFilters: (filters: BudgetFilters) => void;
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSync: string | null;
  refresh: () => Promise<void>;
  createBudgetRule: (payload: CreateBudgetPayload) => Promise<Budget>;
  updateBudgetRule: (id: string, payload: UpdateBudgetPayload) => Promise<Budget>;
  deleteBudgetRule: (id: string) => Promise<void>;
}

const BudgetsContext = createContext<BudgetsContextValue | null>(null);

const initialFilters: BudgetFilters = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};

export function BudgetsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBudgetsRoute = pathname === "/orcamentos" || pathname.startsWith("/orcamentos/");

  const [filters, setFilters] = useState<BudgetFilters>(initialFilters);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isBudgetsRoute) return;

    setIsSyncing(true);
    try {
      const month = filters.month ?? new Date().getMonth() + 1;
      const year = filters.year ?? new Date().getFullYear();

      const [allBudgets, progress] = await Promise.all([
        fetchBudgets(filters),
        fetchBudgetProgress(month, year),
      ]);

      setBudgets(allBudgets);
      setBudgetProgress(progress);
      setError(null);
      setLastSync(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar orçamentos.");
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [filters, isBudgetsRoute]);

  useEffect(() => {
    if (!isBudgetsRoute) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    void refresh();
  }, [isBudgetsRoute, refresh]);

  const createBudgetRule = useCallback(async (payload: CreateBudgetPayload) => {
    const budget = await createBudget(payload);
    setBudgets((prev) => [budget, ...prev]);
    await refresh();
    return budget;
  }, [refresh]);

  const updateBudgetRule = useCallback(async (id: string, payload: UpdateBudgetPayload) => {
    const budget = await updateBudget(id, payload);
    setBudgets((prev) => prev.map((item) => (item.id === id ? budget : item)));
    await refresh();
    return budget;
  }, [refresh]);

  const deleteBudgetRule = useCallback(async (id: string) => {
    await deleteBudget(id);
    setBudgets((prev) => prev.filter((item) => item.id !== id));
    await refresh();
  }, [refresh]);

  return (
    <BudgetsContext.Provider
      value={{
        filters,
        setFilters,
        budgets,
        budgetProgress,
        isLoading,
        isSyncing,
        error,
        lastSync,
        refresh,
        createBudgetRule,
        updateBudgetRule,
        deleteBudgetRule,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetsContext);
  if (!context) {
    throw new Error("useBudgets deve ser utilizado dentro de BudgetsProvider");
  }
  return context;
}
