"use client";

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    Sheet,
    SheetBody,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCardsHook } from '@/hooks/use-cards';
import { formatDebitCardNumber, getFlagLabel } from '@/lib/card-utils';
import type { DebitCard } from '@/types/finance';
import { Trash2, X } from 'lucide-react';
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
      <SheetContent className="flex flex-col overflow-y-auto" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>Excluir cartão de débito</SheetTitle>
              <SheetDescription>
                Esta ação não pode ser desfeita. Tem certeza que deseja excluir este cartão?
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações de exclusão do cartão de débito">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Excluindo cartão" disabled>
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Exclusão</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetClose asChild>
                      <Button type="button" variant="outline" size="icon-sm" aria-label="Fechar">
                        <X />
                      </Button>
                    </SheetClose>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Fechar</TooltipContent>
                </Tooltip>
              </ButtonGroup>
            </TooltipProvider>
          </div>
        </SheetHeader>

        <SheetBody className="space-y-4">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-semibold">{card.name}</p>
            <p className="text-sm text-muted-foreground">
              {getFlagLabel(card.flag)} • {formatDebitCardNumber(card.lastFourDigits)}
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

