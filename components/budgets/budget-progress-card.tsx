"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { BudgetProgress } from "@/types/finance";
import { Pencil, Trash2 } from "lucide-react";

interface BudgetProgressCardProps {
  progress: BudgetProgress;
  onEdit: (budget: BudgetProgress["budget"]) => void;
  onDelete: (budget: BudgetProgress["budget"]) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function BudgetProgressCard({ progress, onEdit, onDelete }: BudgetProgressCardProps) {
  const { budget, spent, remaining, percentage } = progress;
  const isOverBudget = percentage > 100;
  const isWarning = percentage > 80 && percentage <= 100;

  return (
    <div className="group relative rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{budget.category?.name ?? budget.categoryId}</p>
            {isOverBudget && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                Estourado
              </span>
            )}
            {isWarning && !isOverBudget && (
              <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                Atenção
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {budget.month}/{budget.year}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(budget)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(budget)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Gasto</span>
          <span className={cn("font-medium", isOverBudget && "text-destructive")}>
            {currencyFormatter.format(spent)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Limite</span>
          <span className="font-medium">{currencyFormatter.format(budget.amount)}</span>
        </div>
        <Progress
          value={Math.min(percentage, 100)}
          className={cn(
            "h-2",
            isOverBudget && "[&>div]:bg-destructive",
            isWarning && !isOverBudget && "[&>div]:bg-yellow-500",
          )}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(0)}% utilizado</span>
          <span
            className={cn(
              remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
            )}
          >
            {remaining >= 0
              ? `${currencyFormatter.format(remaining)} disponível`
              : `${currencyFormatter.format(Math.abs(remaining))} acima`}
          </span>
        </div>
      </div>
    </div>
  );
}
