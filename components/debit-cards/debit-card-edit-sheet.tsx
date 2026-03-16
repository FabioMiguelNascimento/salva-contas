"use client";

import { CardFlagIcon } from '@/components/credit-cards/card-flag-icon';
import { Button } from '@/components/ui/button';
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
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useFinance } from '@/hooks/use-finance';
import { creditCardFlags } from '@/lib/credit-cards/constants';
import { debitCardStatuses } from '@/lib/debit-cards/constants';
import type { CreditCardFlag, DebitCard, DebitCardStatus } from '@/types/finance';
import { useEffect, useState } from 'react';

interface DebitCardEditSheetProps {
  card: DebitCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebitCardEditSheet({ card, open, onOpenChange }: DebitCardEditSheetProps) {
  const { updateDebitCardEntry } = useFinance();
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
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar cartão de débito</SheetTitle>
          <SheetDescription>
            Atualize as informações do seu cartão de débito.
          </SheetDescription>
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
                    {creditCardFlags.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <CardFlagIcon flag={option.value} className="h-4 w-auto" />
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
                  {debitCardStatuses.map((option) => (
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
