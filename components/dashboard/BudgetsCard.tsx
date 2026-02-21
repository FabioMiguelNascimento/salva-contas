"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { Budget } from "@/types/finance";
import { PiggyBank } from "lucide-react";
import Link from "next/link";

export interface BudgetWithUsage extends Budget {
  spent: number;
  usagePercent: number;
  isOverBudget: boolean;
}

export interface BudgetsCardProps {
  budgetsWithUsage: BudgetWithUsage[];
  isLoading?: boolean;
}

export default function BudgetsCard({ budgetsWithUsage, isLoading }: BudgetsCardProps) {
  return (
    <Card className="lg:col-span-2 bg-white shadow-sm border border-gray-100">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-semibold text-gray-800">Orçamentos do Mês</CardTitle>
          <p className="text-sm text-gray-400">Acompanhe seus limites por categoria</p>
        </div>
        <Button variant="ghost" size="sm" className="self-start sm:self-auto shrink-0" asChild>
          <Link href="/orcamentos">Gerenciar</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : budgetsWithUsage.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Nenhum orçamento definido</p>
            <p className="text-xs text-gray-400 mb-4">Defina limites para controlar seus gastos</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/orcamentos">Criar orçamento</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            {budgetsWithUsage.slice(0, 5).map((budget) => (
              <div key={budget.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-700 truncate">{budget.category?.name ?? "Categoria"}</span>
                    {budget.isOverBudget && (
                      <span className="text-xs shrink-0 bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Excedido</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {currencyFormatter.format(budget.spent)} / {currencyFormatter.format(budget.amount)}
                  </span>
                </div>
                <Progress value={budget.usagePercent} className={cn("h-2", budget.isOverBudget && "[&>div]:bg-destructive")} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
