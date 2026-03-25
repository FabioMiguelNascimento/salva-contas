"use client";

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCardsHook } from '@/hooks/use-cards';
import { formatDebitCardNumber, getDebitFlagLabel } from '@/lib/debit-cards/constants';
import type { DebitCard } from '@/types/finance';
import { useState } from 'react';

interface DebitCardDeleteSheetProps {
  card: DebitCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebitCardDeleteSheet({ card, open, onOpenChange }: DebitCardDeleteSheetProps) {
  const { deleteDebitCardEntry } = useCardsHook();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!card) return;

    setIsSubmitting(true);
    try {
      await deleteDebitCardEntry(card.id);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!card) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Excluir cartão de débito</SheetTitle>
          <SheetDescription>
            Esta ação não pode ser desfeita. Tem certeza que deseja excluir este cartão?
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-4">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-semibold">{card.name}</p>
            <p className="text-sm text-muted-foreground">
              {getDebitFlagLabel(card.flag)} • {formatDebitCardNumber(card.lastFourDigits)}
            </p>
          </div>
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
            {isSubmitting ? 'Excluindo...' : 'Excluir cartão'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

