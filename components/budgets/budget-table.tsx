"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { BudgetProgress } from "@/types/finance";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface BudgetTableProps {
  budgetProgress: BudgetProgress[];
  onEdit: (budget: BudgetProgress["budget"]) => void;
  onDelete: (budget: BudgetProgress["budget"]) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function BudgetTable({ budgetProgress, onEdit, onDelete }: BudgetTableProps) {
  if (budgetProgress.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Nenhum orçamento encontrado para este período.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Limite</TableHead>
          <TableHead className="text-right">Gasto</TableHead>
          <TableHead className="text-right">Disponível</TableHead>
          <TableHead className="w-[200px]">Progresso</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgetProgress.map((progress) => {
          const { budget, spent, remaining, percentage } = progress;
          const isOverBudget = percentage > 100;
          const isWarning = percentage > 80 && percentage <= 100;

          return (
            <TableRow key={budget.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{budget.category?.name ?? budget.categoryId}</span>
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
              </TableCell>
              <TableCell className="text-right font-medium">
                {currencyFormatter.format(budget.amount)}
              </TableCell>
              <TableCell className={cn("text-right", isOverBudget && "text-destructive font-medium")}>
                {currencyFormatter.format(spent)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right",
                  remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                )}
              >
                {remaining >= 0
                  ? currencyFormatter.format(remaining)
                  : `-${currencyFormatter.format(Math.abs(remaining))}`}
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
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(budget)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(budget)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
