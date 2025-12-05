"use client";

import { BudgetCreateSheet } from "@/components/budgets/budget-create-sheet";
import { BudgetDeleteSheet } from "@/components/budgets/budget-delete-sheet";
import { BudgetEditSheet } from "@/components/budgets/budget-edit-sheet";
import { BudgetProgressCard } from "@/components/budgets/budget-progress-card";
import { BudgetTable } from "@/components/budgets/budget-table";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { useBudgetEditor } from "@/hooks/use-budget-editor";
import { useBudgetForm } from "@/hooks/use-budget-form";
import { useBudgetStats } from "@/hooks/use-budget-stats";
import { useFinance } from "@/hooks/use-finance";
import { AlertTriangle, CheckCircle2, PiggyBank, TrendingDown } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function BudgetsPage() {
  const { budgetProgress, isLoading, createBudgetRule, updateBudgetRule, deleteBudgetRule, filters } = useFinance();

  const stats = useBudgetStats(budgetProgress);
  const form = useBudgetForm({
    onCreate: createBudgetRule,
    defaultMonth: filters.month,
    defaultYear: filters.year,
  });
  const editor = useBudgetEditor({
    onUpdate: updateBudgetRule,
    onDelete: deleteBudgetRule,
  });

  const { actions: editorActions } = editor;

  return (
    <div className="space-y-8">
      <TopbarAction>
        <BudgetCreateSheet form={form} />
      </TopbarAction>

      <PageHeader
        tag="Planejamento"
        title="Orçamentos por categoria"
        description="Defina limites de gastos por categoria e acompanhe o progresso durante o mês."
      />

      <SummaryCardsGrid>
        <SummaryCard
          icon={PiggyBank}
          title="Orçamentos ativos"
          value={stats.totalBudgets}
          helper={`Total de ${currencyFormatter.format(stats.totalBudgeted)} planejado`}
        />
        <SummaryCard
          icon={TrendingDown}
          title="Total gasto"
          value={currencyFormatter.format(stats.totalSpent)}
          helper={`${stats.averagePercentage.toFixed(0)}% do orçamento total`}
          variant={stats.averagePercentage > 100 ? "danger" : "default"}
        />
        <SummaryCard
          icon={CheckCircle2}
          title="No limite"
          value={stats.onTrackCount}
          helper="Categorias dentro do orçamento"
          variant="success"
        />
        <SummaryCard
          icon={AlertTriangle}
          title="Estourados"
          value={stats.overBudgetCount}
          helper="Categorias acima do limite"
          variant={stats.overBudgetCount > 0 ? "danger" : "default"}
        />
      </SummaryCardsGrid>

      <Card>
        <CardHeader>
          <CardTitle>Progresso dos orçamentos</CardTitle>
          <CardDescription>
            Acompanhe quanto já foi gasto em cada categoria no período de {filters.month}/{filters.year}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 w-full animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : budgetProgress.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              Nenhum orçamento cadastrado para este período. Clique em "Novo Orçamento" para definir limites.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block">
                <BudgetTable
                  budgetProgress={budgetProgress}
                  onEdit={editorActions.openEdit}
                  onDelete={editorActions.requestDelete}
                />
              </div>
              <div className="grid gap-3 md:hidden">
                {budgetProgress.map((progress) => (
                  <BudgetProgressCard
                    key={progress.budget.id}
                    progress={progress}
                    onEdit={editorActions.openEdit}
                    onDelete={editorActions.requestDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BudgetEditSheet editor={editor} />
      <BudgetDeleteSheet editor={editor} />
    </div>
  );
}
