"use client";

import { CreditCardCreateSheet } from "@/components/credit-cards/credit-card-create-sheet";
import { CreditCardDeleteSheet } from "@/components/credit-cards/credit-card-delete-sheet";
import { CreditCardEditSheet } from "@/components/credit-cards/credit-card-edit-sheet";
import { CreditCardListCard } from "@/components/credit-cards/credit-card-list-card";
import { CreditCardTable } from "@/components/credit-cards/credit-card-table";
import { DebitCardCreateSheet } from "@/components/debit-cards/debit-card-create-sheet";
import { DebitCardDeleteSheet } from "@/components/debit-cards/debit-card-delete-sheet";
import { DebitCardEditSheet } from "@/components/debit-cards/debit-card-edit-sheet";
import { DebitCardListCard } from "@/components/debit-cards/debit-card-list-card";
import { DebitCardTable } from "@/components/debit-cards/debit-card-table";
import { PageHeader } from "@/components/page-header";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { useFinance } from "@/hooks/use-finance";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import type { CreditCard, DebitCard } from "@/types/finance";
import { CreditCard as CreditCardIcon, TrendingDown, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

export default function CartoesPage() {
  const { creditCards, debitCards, isLoading } = useFinance();

  const [editSheet, setEditSheet] = useState<{ open: boolean; card: CreditCard | null }>({
    open: false,
    card: null,
  });
  const [deleteSheet, setDeleteSheet] = useState<{ open: boolean; card: CreditCard | null }>({
    open: false,
    card: null,
  });
  const [editDebitSheet, setEditDebitSheet] = useState<{ open: boolean; card: DebitCard | null }>({
    open: false,
    card: null,
  });
  const [deleteDebitSheet, setDeleteDebitSheet] = useState<{ open: boolean; card: DebitCard | null }>({
    open: false,
    card: null,
  });

  const stats = useMemo(() => {
    const activeCards = creditCards.filter((c) => c.status === "active");
    const activeDebitCards = debitCards.filter((c) => c.status === "active");
    const totalLimit = activeCards.reduce((acc, c) => acc + c.limit, 0);
    const totalAvailable = activeCards.reduce((acc, c) => acc + c.availableLimit, 0);
    const totalUsed = totalLimit - totalAvailable;
    const highUsageCards = activeCards.filter((c) => {
      const usedPercentage = ((c.limit - c.availableLimit) / c.limit) * 100;
      return usedPercentage > 80;
    }).length;

    return {
      totalCards: activeCards.length,
      totalDebitCards: activeDebitCards.length,
      totalLimit,
      totalAvailable,
      totalUsed,
      totalPaymentCards: activeCards.length + activeDebitCards.length,
      highUsageCards,
      usagePercentage: totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0,
    };
  }, [creditCards, debitCards]);

  const openEdit = (card: CreditCard) => {
    setEditSheet({ open: true, card });
  };

  const openDelete = (card: CreditCard) => {
    setDeleteSheet({ open: true, card });
  };

  const openEditDebit = (card: DebitCard) => {
    setEditDebitSheet({ open: true, card });
  };

  const openDeleteDebit = (card: DebitCard) => {
    setDeleteDebitSheet({ open: true, card });
  };

  return (
    <div className="space-y-8">
      <TopbarAction>
        <div className="flex items-center gap-2">
          <CreditCardCreateSheet />
          <DebitCardCreateSheet />
        </div>
      </TopbarAction>

      <PageHeader
        tag="Finanças"
        title="Cartões de crédito"
        description="Gerencie seus cartões, limites e acompanhe os gastos de cada um."
      />

      <SummaryCardsGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
              <CreditCardIcon className="h-4 w-4" />
              Cartões cadastrados
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Crédito ativos</span>
                <span className="text-base font-semibold">{stats.totalCards}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Débito ativos</span>
                <span className="text-base font-semibold">{stats.totalDebitCards}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Wallet className="h-4 w-4" />
              Limites de crédito
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Limite total</span>
                <span className="text-base font-semibold">{currencyFormatter.format(stats.totalLimit)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Limite disponível</span>
                <span className="text-base font-semibold">{currencyFormatter.format(stats.totalAvailable)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
              <TrendingDown className="h-4 w-4" />
              Uso e alerta
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Total utilizado</span>
                <span className="text-base font-semibold">{currencyFormatter.format(stats.totalUsed)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Limite alto</span>
                <span className="text-base font-semibold">{stats.highUsageCards}</span>
              </div>
            </div>
          </CardContent>
        </Card>
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

      <Card>
        <CardHeader>
          <CardTitle>Seus cartões de débito</CardTitle>
          <CardDescription>
            Visualize e gerencie seus cartões de débito cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 w-full animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : debitCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              Nenhum cartão de débito cadastrado ainda. Clique em "Novo Débito" para adicionar o primeiro.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block">
                <DebitCardTable
                  debitCards={debitCards}
                  onEdit={openEditDebit}
                  onDelete={openDeleteDebit}
                />
              </div>
              <div className="grid gap-3 md:hidden">
                {debitCards.map((card) => (
                  <DebitCardListCard
                    key={card.id}
                    card={card}
                    onEdit={openEditDebit}
                    onDelete={openDeleteDebit}
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

      <DebitCardEditSheet
        card={editDebitSheet.card}
        open={editDebitSheet.open}
        onOpenChange={(open) => setEditDebitSheet({ open, card: open ? editDebitSheet.card : null })}
      />

      <DebitCardDeleteSheet
        card={deleteDebitSheet.card}
        open={deleteDebitSheet.open}
        onOpenChange={(open) => setDeleteDebitSheet({ open, card: open ? deleteDebitSheet.card : null })}
      />
    </div>
  );
}
