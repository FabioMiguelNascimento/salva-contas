"use client";

import { AppShell } from "@/components/app-shell";
import { CreditCardCreateSheet } from "@/components/credit-cards/credit-card-create-sheet";
import { CreditCardDeleteSheet } from "@/components/credit-cards/credit-card-delete-sheet";
import { CreditCardEditSheet } from "@/components/credit-cards/credit-card-edit-sheet";
import { CreditCardListCard } from "@/components/credit-cards/credit-card-list-card";
import { CreditCardTable } from "@/components/credit-cards/credit-card-table";
import { CreditCardsSummaryGrid } from "@/components/credit-cards/credit-cards-summary-grid";
import { DebitCardCreateSheet } from "@/components/debit-cards/debit-card-create-sheet";
import { DebitCardDeleteSheet } from "@/components/debit-cards/debit-card-delete-sheet";
import { DebitCardEditSheet } from "@/components/debit-cards/debit-card-edit-sheet";
import { DebitCardListCard } from "@/components/debit-cards/debit-card-list-card";
import { DebitCardTable } from "@/components/debit-cards/debit-card-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardsProvider } from "@/context/cards-context";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { useCardsHook } from "@/hooks/use-cards";
import type {
    CreditCard,
    DebitCard,
} from "@/types/finance";
import { useState } from "react";

type SheetState<TCard> = {
  open: boolean;
  card: TCard | null;
};

const initialSheetState = <TCard,>(): SheetState<TCard> => ({
  open: false,
  card: null,
});

function CartoesPageContent() {
  const { creditCards, debitCards, isLoading, stats } = useCardsHook();

  const [editSheet, setEditSheet] = useState<SheetState<CreditCard>>(initialSheetState);
  const [deleteSheet, setDeleteSheet] = useState<SheetState<CreditCard>>(initialSheetState);
  const [editDebitSheet, setEditDebitSheet] = useState<SheetState<DebitCard>>(initialSheetState);
  const [deleteDebitSheet, setDeleteDebitSheet] = useState<SheetState<DebitCard>>(initialSheetState);

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

      <CreditCardsSummaryGrid stats={stats} />

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
                />
              </div>
              <div className="grid gap-3 md:hidden">
                {creditCards.map((card) => (
                  <CreditCardListCard
                    key={card.id}
                    card={card}
                    onEdit={openEdit}
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
                />
              </div>
              <div className="grid gap-3 md:hidden">
                {debitCards.map((card) => (
                  <DebitCardListCard
                    key={card.id}
                    card={card}
                    onEdit={openEditDebit}
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
        onRequestDelete={openDelete}
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
        onRequestDelete={openDeleteDebit}
      />

      <DebitCardDeleteSheet
        card={deleteDebitSheet.card}
        open={deleteDebitSheet.open}
        onOpenChange={(open) => setDeleteDebitSheet({ open, card: open ? deleteDebitSheet.card : null })}
      />
    </div>
  );
}

export default function CartoesPage() {
  return (
    <CardsProvider>
      <AppShell>
        <CartoesPageContent />
      </AppShell>
    </CardsProvider>
  );
}
