"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SubscriptionCreateSheet } from "@/components/subscriptions/subscription-create-sheet";
import { SubscriptionDeleteSheet } from "@/components/subscriptions/subscription-delete-sheet";
import { SubscriptionEditSheet } from "@/components/subscriptions/subscription-edit-sheet";
import { SubscriptionListCard } from "@/components/subscriptions/subscription-list-card";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardsProvider } from "@/context/cards-context";
import { SubscriptionsProvider } from "@/context/subscriptions-context";
import { TransactionsProvider } from "@/context/transactions-context";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { useSubscriptionEditor } from "@/hooks/use-subscription-editor";
import { useSubscriptionFilters } from "@/hooks/use-subscription-filters";
import { useSubscriptionForm } from "@/hooks/use-subscription-form";
import { useSubscriptionsHook } from "@/hooks/use-subscriptions";
import { formatCurrency } from "@/lib/currency-utils";
import { frequencyOptions } from "@/lib/subscriptions/constants";
import { PlusCircle, Shield, Zap } from "lucide-react";

function SubscriptionsPageContent() {
  const { subscriptions, stats, isLoading, createSubscriptionRule, updateSubscriptionRule, deleteSubscriptionRule } = useSubscriptionsHook();

  const filters = useSubscriptionFilters(subscriptions);
  const form = useSubscriptionForm({ onCreate: createSubscriptionRule });
  const editor = useSubscriptionEditor({ onUpdate: updateSubscriptionRule, onDelete: deleteSubscriptionRule });

  const { filteredSubscriptions, activeFilter, setActiveFilter } = filters;
  const { actions: editorActions } = editor;

  return (
    <div className="space-y-8">
      <TopbarAction>
        <SubscriptionCreateSheet form={form} />
      </TopbarAction>

      <PageHeader
        tag="Recorrências"
        title="Assinaturas e débitos automáticos"
        description="Configure regras para Netflix, aluguel e outros serviços para que o Salva Contas gere as transações sem digitação."
      />

      <SummaryCardsGrid>
        <SummaryCard
          icon={Zap}
          title="Assinaturas ativas"
          value={stats.totalActive}
          helper="Regras prontas para gerar lançamentos"
        />
        <SummaryCard
          icon={Shield}
          title="Comprometido/mês"
          value={formatCurrency(stats.totalAmount)}
          helper="Soma considerando valores atuais"
        />
        {frequencyOptions.slice(0, 2).map((option) => (
          <SummaryCard
            key={option.value}
            icon={PlusCircle}
            title={`Frequência ${option.label}`}
            value={stats.byFrequency[option.value] ?? 0}
            helper={option.helper}
          />
        ))}
      </SummaryCardsGrid>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros de assinaturas">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
              className="min-h-10"
              aria-pressed={activeFilter === "all"}
            >
              Todas
            </Button>
            {frequencyOptions.map((option) => (
              <Button
                key={option.value}
                variant={activeFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(option.value)}
                className="min-h-10"
                aria-pressed={activeFilter === option.value}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 w-full animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              Nenhuma assinatura cadastrada ainda. Clique em "Nova Assinatura" para criar a primeira regra.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block">
                <SubscriptionTable
                  subscriptions={filteredSubscriptions}
                  onEdit={editorActions.openEdit}
                />
              </div>
              <div className="grid gap-3 md:hidden">
                {filteredSubscriptions.map((subscription) => (
                  <SubscriptionListCard
                    key={subscription.id}
                    subscription={subscription}
                    onEdit={editorActions.openEdit}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SubscriptionEditSheet editor={editor} />
      <SubscriptionDeleteSheet editor={editor} />
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <SubscriptionsProvider>
      <TransactionsProvider >
        <CardsProvider>
          <AppShell>
            <SubscriptionsPageContent />
          </AppShell>
        </CardsProvider>
      </TransactionsProvider>
    </SubscriptionsProvider>
  );
}
