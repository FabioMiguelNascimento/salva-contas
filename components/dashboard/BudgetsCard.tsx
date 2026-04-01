"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency-utils";
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
          <CardTitle className="text-base font-semibold text-gray-800">Orçamentos do Mes</CardTitle>
          <p className="text-sm text-gray-400">Acompanhe seus limites por categoria</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <InfoPopover content="Aqui você pode acompanhar o progresso dos seus orçamentos mensais. Cada orçamento mostra quanto já foi gasto em relação ao limite definido, com uma barra de progresso colorida (verde para dentro do orçamento, vermelho quando excedido)." />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/orcamentos">Gerenciar</Link>
          </Button>
        </div>
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
              <Link href="/app/orcamentos">Criar orçamento</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            {budgetsWithUsage.slice(0, 5).map((budget) => (
              <div key={budget.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <DynamicIcon
                      name={budget.category?.icon ?? "tag"}
                      className="h-4 w-4 shrink-0 text-gray-400"
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">{budget.category?.name ?? "Categoria"}</span>
                    {budget.isOverBudget && (
                      <span className="text-xs shrink-0 bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Excedido</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
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

