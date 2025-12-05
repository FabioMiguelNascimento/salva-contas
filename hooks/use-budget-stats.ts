import type { BudgetProgress } from "@/types/finance";
import { useMemo } from "react";

export interface BudgetStats {
  totalBudgets: number;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overBudgetCount: number;
  onTrackCount: number;
  averagePercentage: number;
}

export function useBudgetStats(budgetProgress: BudgetProgress[]): BudgetStats {
  return useMemo(() => {
    if (budgetProgress.length === 0) {
      return {
        totalBudgets: 0,
        totalBudgeted: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overBudgetCount: 0,
        onTrackCount: 0,
        averagePercentage: 0,
      };
    }

    const totalBudgeted = budgetProgress.reduce((sum, p) => sum + p.budget.amount, 0);
    const totalSpent = budgetProgress.reduce((sum, p) => sum + p.spent, 0);
    const totalRemaining = budgetProgress.reduce((sum, p) => sum + Math.max(0, p.remaining), 0);
    const overBudgetCount = budgetProgress.filter((p) => p.percentage > 100).length;
    const onTrackCount = budgetProgress.filter((p) => p.percentage <= 100).length;
    const averagePercentage = budgetProgress.reduce((sum, p) => sum + p.percentage, 0) / budgetProgress.length;

    return {
      totalBudgets: budgetProgress.length,
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      onTrackCount,
      averagePercentage,
    };
  }, [budgetProgress]);
}
