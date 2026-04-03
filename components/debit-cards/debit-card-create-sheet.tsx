"use client";

import { FlagIcon } from '@/components/flag-icon';
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
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCardsHook } from '@/hooks/use-cards';
import { cardFlags } from '@/lib/card-utils';
import type { CreateDebitCardPayload, CreditCardFlag } from '@/types/finance';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

export function DebitCardCreateSheet() {
  const { createDebitCardEntry } = useCardsHook();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [flag, setFlag] = useState<CreditCardFlag>('visa');
  const [lastFourDigits, setLastFourDigits] = useState('');

  const resetForm = () => {
    setName('');
    setFlag('visa');
    setLastFourDigits('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: CreateDebitCardPayload = {
        name,
        flag,
        lastFourDigits: lastFourDigits || undefined,
      };

      await createDebitCardEntry(payload);
      resetForm();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Débito
        </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo cartão de débito</SheetTitle>
          <SheetDescription>
            Adicione seu cartão de débito para organizar melhor seus meios de pagamento.
          </SheetDescription>
        </SheetHeader>

        <form id="create-debit-card-form" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="debit-name">Nome do cartão</Label>
              <Input
                id="debit-name"
                placeholder="Ex: Itaú Débito, Inter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debit-flag">Bandeira</Label>
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
                <Label htmlFor="debit-lastFourDigits">Últimos 4 dígitos</Label>
                <Input
                  id="debit-lastFourDigits"
                  placeholder="1234"
                  maxLength={4}
                  value={lastFourDigits}
                  required
                  onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Criando...' : 'Criar cartão'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}


