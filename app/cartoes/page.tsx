"use client";

import { CreditCardCreateSheet } from "@/components/credit-cards/credit-card-create-sheet";
import { CreditCardDeleteSheet } from "@/components/credit-cards/credit-card-delete-sheet";
import { CreditCardEditSheet } from "@/components/credit-cards/credit-card-edit-sheet";
import { CreditCardListCard } from "@/components/credit-cards/credit-card-list-card";
import { CreditCardTable } from "@/components/credit-cards/credit-card-table";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { useFinance } from "@/hooks/use-finance";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import type { CreditCard } from "@/types/finance";
import { AlertTriangle, CreditCard as CreditCardIcon, TrendingDown, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

export default function CartoesPage() {
  const { creditCards, isLoading } = useFinance();

  const [editSheet, setEditSheet] = useState<{ open: boolean; card: CreditCard | null }>({
    open: false,
    card: null,
  });
  const [deleteSheet, setDeleteSheet] = useState<{ open: boolean; card: CreditCard | null }>({
    open: false,
    card: null,
  });

  const stats = useMemo(() => {
    const activeCards = creditCards.filter((c) => c.status === "active");
    const totalLimit = activeCards.reduce((acc, c) => acc + c.limit, 0);
    const totalAvailable = activeCards.reduce((acc, c) => acc + c.availableLimit, 0);
    const totalUsed = totalLimit - totalAvailable;
    const highUsageCards = activeCards.filter((c) => {
      const usedPercentage = ((c.limit - c.availableLimit) / c.limit) * 100;
      return usedPercentage > 80;
    }).length;

    return {
      totalCards: activeCards.length,
      totalLimit,
      totalAvailable,
      totalUsed,
      highUsageCards,
      usagePercentage: totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0,
    };
  }, [creditCards]);

  const openEdit = (card: CreditCard) => {
    setEditSheet({ open: true, card });
  };

  const openDelete = (card: CreditCard) => {
    setDeleteSheet({ open: true, card });
  };

  return (
    <div className="space-y-8">
      <TopbarAction>
        <CreditCardCreateSheet />
      </TopbarAction>

      <PageHeader
        tag="Finanças"
        title="Cartões de crédito"
        description="Gerencie seus cartões, limites e acompanhe os gastos de cada um."
      />

      <SummaryCardsGrid>
        <SummaryCard
          icon={CreditCardIcon}
          title="Cartões ativos"
          value={stats.totalCards}
          helper="Cartões disponíveis para uso"
        />
        <SummaryCard
          icon={Wallet}
          title="Limite total"
          value={currencyFormatter.format(stats.totalLimit)}
          helper="Soma dos limites dos cartões ativos"
        />
        <SummaryCard
          icon={TrendingDown}
          title="Total utilizado"
          value={currencyFormatter.format(stats.totalUsed)}
          helper={`${stats.usagePercentage.toFixed(0)}% do limite total`}
          variant={stats.usagePercentage > 80 ? "danger" : "default"}
        />
        <SummaryCard
          icon={AlertTriangle}
          title="Limite alto"
          value={stats.highUsageCards}
          helper="Cartões com mais de 80% do limite usado"
          variant={stats.highUsageCards > 0 ? "warning" : "default"}
        />
      </SummaryCardsGrid>

      <Card>
        <CardHeader>
          <CardTitle>Seus cartões</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os seus cartões de crédito cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 w-full animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : creditCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              Nenhum cartão cadastrado ainda. Clique em "Novo Cartão" para adicionar o primeiro.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block">
                <CreditCardTable
                  creditCards={creditCards}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              </div>
              <div className="grid gap-3 md:hidden">
                {creditCards.map((card) => (
                  <CreditCardListCard
                    key={card.id}
                    card={card}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreditCardEditSheet
        card={editSheet.card}
        open={editSheet.open}
        onOpenChange={(open) => setEditSheet({ open, card: open ? editSheet.card : null })}
      />
      <CreditCardDeleteSheet
        card={deleteSheet.card}
        open={deleteSheet.open}
        onOpenChange={(open) => setDeleteSheet({ open, card: open ? deleteSheet.card : null })}
      />
    </div>
  );
}
