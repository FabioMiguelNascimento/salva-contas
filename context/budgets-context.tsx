"use client";

import {
    createBudget,
    deleteBudget,
    fetchBudgetMetrics,
    fetchBudgetProgress,
    fetchBudgets,
    updateBudget,
} from "@/services/budgets";
import type {
    Budget,
    BudgetFilters,
    BudgetMetrics,
    BudgetProgress,
    CreateBudgetPayload,
    UpdateBudgetPayload,
} from "@/types/finance";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

interface BudgetStats {
  totalBudgets: number;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overBudgetCount: number;
  onTrackCount: number;
  averagePercentage: number;
}

interface BudgetsContextValue {
  filters: BudgetFilters;
  setFilters: (filters: BudgetFilters) => void;
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  budgetMetrics: BudgetMetrics | null;
  stats: BudgetStats;
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
  const isBudgetsRoute = pathname === "/app/orcamentos" || pathname.startsWith("/app/orcamentos/");

  const [filters, setFilters] = useState<BudgetFilters>(initialFilters);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [budgetMetrics, setBudgetMetrics] = useState<BudgetMetrics | null>(null);
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

      const [allBudgets, progress, metrics] = await Promise.all([
        fetchBudgets(filters),
        fetchBudgetProgress(month, year),
        fetchBudgetMetrics(month, year),
      ]);

      setBudgets(allBudgets);
      setBudgetProgress(progress);
      setBudgetMetrics(metrics);
      setError(null);
      setLastSync(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar orçamentos.");
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [filters, isBudgetsRoute]);

  const lastRefreshParams = useRef<{ refresh: any; isBudgetsRoute: boolean } | null>(null);

  useEffect(() => {
    if (
      lastRefreshParams.current?.refresh === refresh &&
      lastRefreshParams.current?.isBudgetsRoute === isBudgetsRoute
    ) {
      return;
    }
    lastRefreshParams.current = { refresh, isBudgetsRoute };

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

  const stats = useMemo<BudgetStats>(() => {
    if (budgetProgress.length === 0) {
      return {
        totalBudgets: 0,
        totalBudgeted: budgetMetrics?.totalBudgeted ?? 0,
        totalSpent: budgetMetrics?.totalSpent ?? 0,
        totalRemaining: budgetMetrics?.remaining ?? 0,
        overBudgetCount: 0,
        onTrackCount: 0,
        averagePercentage: budgetMetrics?.percentage ?? 0,
      };
    }

    const totalBudgeted = budgetMetrics?.totalBudgeted ?? budgetProgress.reduce((sum, p) => sum + p.budget.amount, 0);
    const totalSpent = budgetMetrics?.totalSpent ?? budgetProgress.reduce((sum, p) => sum + p.spent, 0);
    const totalRemaining = budgetMetrics?.remaining ?? budgetProgress.reduce((sum, p) => sum + Math.max(0, p.remaining), 0);
    const overBudgetCount = budgetProgress.filter((p) => p.percentage > 100).length;
    const onTrackCount = budgetProgress.filter((p) => p.percentage <= 100).length;
    const averagePercentage = budgetMetrics?.percentage ?? (budgetProgress.reduce((sum, p) => sum + p.percentage, 0) / budgetProgress.length);

    return {
      totalBudgets: budgetProgress.length,
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      onTrackCount,
      averagePercentage,
    };
  }, [budgetProgress, budgetMetrics]);

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
        budgetMetrics,
        stats,
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
