"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import type { BudgetProgress } from "@/types/finance";

interface BudgetTableProps {
  budgetProgress: BudgetProgress[];
  onEdit: (budget: BudgetProgress["budget"]) => void;
}

export function BudgetTable({ budgetProgress, onEdit }: BudgetTableProps) {
  if (budgetProgress.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Nenhum orçamento encontrado para este período.
      </div>
    );
  }

  return (
    <Table className="min-w-[940px]">
      <TableHeader>
        <TableRow>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Limite</TableHead>
          <TableHead className="text-right">Gasto</TableHead>
          <TableHead className="text-right">Disponível</TableHead>
          <TableHead className="w-[200px]">Progresso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgetProgress.map((progress) => {
          const { budget, spent, remaining, percentage } = progress;
          const isOverBudget = percentage > 100;
          const isWarning = percentage > 80 && percentage <= 100;

          return (
            <TableRow
              key={budget.id}
              onClick={() => onEdit(budget)}
              className="cursor-pointer hover:bg-muted/30"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 min-w-0 max-w-[260px]">
                    <DynamicIcon
                      name={budget.category?.icon ?? "tag"}
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                    />
                    <span className="font-medium truncate">{budget.category?.name ?? budget.categoryId}</span>
                  </span>
                  {isOverBudget && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      Estourado
                    </span>
                  )}
                  {isWarning && !isOverBudget && (
                    <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                      Atencao
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(budget.amount)}
              </TableCell>
              <TableCell className={cn("text-right", isOverBudget && "text-destructive font-medium")}>
                {formatCurrency(spent)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right",
                  remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                )}
              >
                {remaining >= 0
                  ? formatCurrency(remaining)
                  : `-${formatCurrency(Math.abs(remaining))}`}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={cn(
                      "h-2 flex-1",
                      isOverBudget && "[&>div]:bg-destructive",
                      isWarning && !isOverBudget && "[&>div]:bg-yellow-500",
                    )}
                  />
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}



