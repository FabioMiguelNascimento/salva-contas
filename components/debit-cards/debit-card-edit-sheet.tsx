"use client";

import { FlagIcon } from '@/components/flag-icon';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { cardFlags, cardStatuses } from '@/lib/card-utils';
import type { CreditCardFlag, DebitCard, DebitCardStatus } from '@/types/finance';
import { Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DebitCardEditSheetProps {
  card: DebitCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestDelete?: (card: DebitCard) => void;
}

export function DebitCardEditSheet({ card, open, onOpenChange, onRequestDelete }: DebitCardEditSheetProps) {
  const { updateDebitCardEntry } = useCardsHook();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [flag, setFlag] = useState<CreditCardFlag>('visa');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [status, setStatus] = useState<DebitCardStatus>('active');

  useEffect(() => {
    if (card) {
      setName(card.name);
      setFlag(card.flag);
      setLastFourDigits(card.lastFourDigits ?? '');
      setStatus(card.status);
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    setIsSubmitting(true);

    try {
      await updateDebitCardEntry(card.id, {
        name,
        flag,
        lastFourDigits: lastFourDigits || undefined,
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
              <SheetTitle>Editar cartão de débito</SheetTitle>
              <SheetDescription>
                Atualize as informações do seu cartão de débito.
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações do cartão de débito">
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

        <form id="edit-debit-card-form" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-debit-name">Nome do cartão</Label>
              <Input
                id="edit-debit-name"
                placeholder="Ex: Itaú Débito"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-debit-flag">Bandeira</Label>
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
                <Label htmlFor="edit-debit-lastFourDigits">Últimos 4 dígitos</Label>
                <Input
                  id="edit-debit-lastFourDigits"
                  placeholder="1234"
                  maxLength={4}
                  value={lastFourDigits}
                  onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-debit-status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as DebitCardStatus)}>
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
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
