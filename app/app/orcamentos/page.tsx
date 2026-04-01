"use client";

import { AppShell } from "@/components/app-shell";
import { BudgetCreateSheet } from "@/components/budgets/budget-create-sheet";
import { BudgetDeleteSheet } from "@/components/budgets/budget-delete-sheet";
import { BudgetEditSheet } from "@/components/budgets/budget-edit-sheet";
import { BudgetProgressCard } from "@/components/budgets/budget-progress-card";
import { BudgetTable } from "@/components/budgets/budget-table";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetsProvider } from "@/context/budgets-context";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { useBudgetEditor } from "@/hooks/use-budget-editor";
import { useBudgetForm } from "@/hooks/use-budget-form";
import { useBudgetsHook } from "@/hooks/use-budgets";
import { formatCurrency } from "@/lib/currency-utils";
import { AlertTriangle, CheckCircle2, PiggyBank, TrendingDown } from "lucide-react";

function BudgetsPageContent() {
  const { budgetProgress, stats, isLoading, createBudgetRule, updateBudgetRule, deleteBudgetRule, filters } = useBudgetsHook();

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
        title="Orcamentos por categoria"
        description="Defina limites de gastos por categoria e acompanhe o progresso durante o mes."
      />

      <SummaryCardsGrid>
        <SummaryCard
          icon={PiggyBank}
          title="Orcamentos ativos"
          value={stats.totalBudgets}
          helper={`Total de ${formatCurrency(stats.totalBudgeted)} planejado`}
        />
        <SummaryCard
          icon={TrendingDown}
          title="Total gasto"
          value={formatCurrency(stats.totalSpent)}
          helper={`${stats.averagePercentage.toFixed(0)}% do orcamento total`}
          variant={stats.averagePercentage > 100 ? "danger" : "default"}
        />
        <SummaryCard
          icon={CheckCircle2}
          title="No limite"
          value={stats.onTrackCount}
          helper="Categorias dentro do orcamento"
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
          <CardTitle>Progresso dos orcamentos</CardTitle>
          <CardDescription>
            Acompanhe quanto ja foi gasto em cada categoria no periodo de {filters.month}/{filters.year}.
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
              Nenhum orcamento cadastrado para este periodo. Clique em "Novo Orcamento" para definir limites.
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

export default function BudgetsPage() {
  return (
    <BudgetsProvider>
      <AppShell>
        <BudgetsPageContent />
      </AppShell>
    </BudgetsProvider>
  );
}
