"use client";

import { FlagIcon } from "@/components/flag-icon";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { cardFlags, cardStatuses } from "@/lib/card-utils";
import type { CreditCard, CreditCardFlag, CreditCardStatus } from "@/types/finance";
import { Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface CreditCardEditSheetProps {
  card: CreditCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestDelete?: (card: CreditCard) => void;
}

export function CreditCardEditSheet({ card, open, onOpenChange, onRequestDelete }: CreditCardEditSheetProps) {
  const { updateCreditCardEntry } = useCardsHook();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [flag, setFlag] = useState<CreditCardFlag>("visa");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [status, setStatus] = useState<CreditCardStatus>("active");

  useEffect(() => {
    if (card) {
      setName(card.name);
      setFlag(card.flag);
      setLastFourDigits(card.lastFourDigits ?? "");
      setLimit(String(card.limit));
      setClosingDay(String(card.closingDay));
      setDueDay(String(card.dueDay));
      setStatus(card.status);
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    setIsSubmitting(true);

    try {
      await updateCreditCardEntry(card.id, {
        name,
        flag,
        lastFourDigits: lastFourDigits || undefined,
        limit: Number(limit.replace(/,/g, ".")),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
        status,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle>Editar cartão de crédito</SheetTitle>
              <SheetDescription>
                Atualize as informações do seu cartão.
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações do cartão de crédito">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Editando cartão atual" disabled>
                      <Pencil />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Editando</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Excluir cartão"
                      disabled={!card}
                      onClick={() => {
                        if (card && onRequestDelete) {
                          onRequestDelete(card);
                          onOpenChange(false);
                        }
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Excluir</TooltipContent>
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

        <form id="edit-card-form" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do cartão</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Nubank, Itau Platinum"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-flag">Bandeira</Label>
                <Select value={flag} onValueChange={(value) => setFlag(value as CreditCardFlag)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cardFlags.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <FlagIcon flag={option.value} className="h-4 w-auto" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastFourDigits">Últimos 4 dígitos</Label>
                <Input
                  id="edit-lastFourDigits"
                  placeholder="1234"
                  maxLength={4}
                  value={lastFourDigits}
                  onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              </div>

              <div className="space-y-2">
              <Label htmlFor="edit-limit">Limite do cartão</Label>
              <Input
                id="edit-limit"
                placeholder="5000.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
              />
              </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-closingDay">Dia do fechamento</Label>
                <Input
                  id="edit-closingDay"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="15"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueDay">Dia do vencimento</Label>
                <Input
                  id="edit-dueDay"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="10"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as CreditCardStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardStatuses.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}


