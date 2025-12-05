"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useFinance } from "@/hooks/use-finance";
import { formatCardNumber, getFlagLabel } from "@/lib/credit-cards/constants";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import type { CreditCard } from "@/types/finance";
import { useState } from "react";

interface CreditCardDeleteSheetProps {
  card: CreditCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditCardDeleteSheet({ card, open, onOpenChange }: CreditCardDeleteSheetProps) {
  const { deleteCreditCardEntry } = useFinance();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!card) return;

    setIsSubmitting(true);
    try {
      await deleteCreditCardEntry(card.id);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!card) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Excluir cartão de crédito</SheetTitle>
          <SheetDescription>
            Esta ação não pode ser desfeita. Tem certeza que deseja excluir este cartão?
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-4">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-semibold">{card.name}</p>
            <p className="text-sm text-muted-foreground">
              {getFlagLabel(card.flag)} • {formatCardNumber(card.lastFourDigits)}
            </p>
            <p className="mt-2 text-sm">
              Limite: <span className="font-medium">{currencyFormatter.format(card.limit)}</span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Ao excluir este cartão, todas as transações associadas a ele perderão a referência.
          </p>
        </SheetBody>

        <SheetFooter className="flex-row gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Excluindo..." : "Excluir cartão"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
