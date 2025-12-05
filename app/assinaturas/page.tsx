"use client";

import { SubscriptionDeleteDialog } from "@/components/subscriptions/subscription-delete-dialog";
import { SubscriptionEditDialog } from "@/components/subscriptions/subscription-edit-dialog";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { SubscriptionListCard } from "@/components/subscriptions/subscription-list-card";
import { SubscriptionSummaryCard } from "@/components/subscriptions/subscription-summary-card";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/hooks/use-finance";
import { useSubscriptionEditor } from "@/hooks/use-subscription-editor";
import { useSubscriptionFilters } from "@/hooks/use-subscription-filters";
import { useSubscriptionForm } from "@/hooks/use-subscription-form";
import { useSubscriptionStats } from "@/hooks/use-subscription-stats";
import { currencyFormatter, frequencyOptions } from "@/lib/subscriptions/constants";
import { PlusCircle, Shield, Zap } from "lucide-react";

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, createSubscriptionRule, updateSubscriptionRule, deleteSubscriptionRule } = useFinance();

  const filters = useSubscriptionFilters(subscriptions);
  const stats = useSubscriptionStats(subscriptions);
  const form = useSubscriptionForm({ onCreate: createSubscriptionRule });
  const editor = useSubscriptionEditor({ onUpdate: updateSubscriptionRule, onDelete: deleteSubscriptionRule });

  const { filteredSubscriptions, activeFilter, setActiveFilter } = filters;
  const { actions: editorActions } = editor;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Recorrências</p>
        <h1 className="text-3xl font-semibold">Assinaturas e débitos automáticos</h1>
        <p className="text-sm text-muted-foreground">
          Configure regras para Netflix, aluguel e outros serviços para que o AI Finance gere as transações sem digitação.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SubscriptionSummaryCard
          icon={Zap}
          label="Assinaturas ativas"
          value={stats.totalActive}
          helper="Regras prontas para gerar lançamentos"
        />
        <SubscriptionSummaryCard
          icon={Shield}
          label="Comprometido/mês"
          value={currencyFormatter.format(stats.totalAmount)}
          helper="Soma considerando valores atuais"
        />
        {frequencyOptions.slice(0, 2).map((option) => (
          <SubscriptionSummaryCard
            key={option.value}
            icon={PlusCircle}
            label={`Frequência ${option.label}`}
            value={stats.byFrequency[option.value] ?? 0}
            helper={option.helper}
          />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Assinaturas configuradas</CardTitle>
              <CardDescription>Gerencie e acompanhe todas as recorrências automatizadas.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={activeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveFilter("all")}>
                Todas
              </Button>
              {frequencyOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(option.value)}
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
                Nenhuma assinatura cadastrada ainda. Utilize o formulário ao lado para criar a primeira regra.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden md:block">
                  <SubscriptionTable
                    subscriptions={filteredSubscriptions}
                    onEdit={editorActions.openEdit}
                    onDelete={editorActions.requestDelete}
                  />
                </div>
                <div className="grid gap-3 md:hidden">
                  {filteredSubscriptions.map((subscription) => (
                    <SubscriptionListCard
                      key={subscription.id}
                      subscription={subscription}
                      onEdit={editorActions.openEdit}
                      onDelete={editorActions.requestDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nova assinatura</CardTitle>
            <CardDescription>Informe os parâmetros para gerar o lançamento automaticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionForm form={form} />
          </CardContent>
        </Card>
      </div>

      <SubscriptionEditDialog editor={editor} />
      <SubscriptionDeleteDialog editor={editor} />
    </div>
  );
}
