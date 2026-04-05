"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    Sheet,
    SheetBody,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCardsHook } from "@/hooks/use-cards";
import { formatCardNumber, getFlagLabel } from "@/lib/card-utils";
import { formatCurrency } from "@/lib/currency-utils";
import type { CreditCard } from "@/types/finance";
import { Trash2, X } from "lucide-react";
import { useState } from "react";

interface CreditCardDeleteSheetProps {
  card: CreditCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditCardDeleteSheet({ card, open, onOpenChange }: CreditCardDeleteSheetProps) {
  const { deleteCreditCardEntry } = useCardsHook();
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
      <SheetContent className="flex flex-col overflow-y-auto" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>Excluir cartão de crédito</SheetTitle>
              <SheetDescription>
                Esta ação não pode ser desfeita. Tem certeza que deseja excluir este cartão?
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações de exclusão do cartão de crédito">
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
              {getFlagLabel(card.flag)} • {formatCardNumber(card.lastFourDigits)}
            </p>
            <p className="mt-2 text-sm">
              Limite: <span className="font-medium">{formatCurrency(card.limit)}</span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Ao excluir este cartão, todas as transações associadas a ele perderao a referencia.
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

