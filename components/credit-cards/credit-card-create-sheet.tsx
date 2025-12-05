"use client";

import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { Button } from "@/components/ui/button";
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
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useFinance } from "@/hooks/use-finance";
import { creditCardFlags } from "@/lib/credit-cards/constants";
import type { CreateCreditCardPayload, CreditCardFlag } from "@/types/finance";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export function CreditCardCreateSheet() {
  const { createCreditCardEntry } = useFinance();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [flag, setFlag] = useState<CreditCardFlag>("visa");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");

  const resetForm = () => {
    setName("");
    setFlag("visa");
    setLastFourDigits("");
    setLimit("");
    setClosingDay("");
    setDueDay("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: CreateCreditCardPayload = {
        name,
        flag,
        lastFourDigits: lastFourDigits || undefined,
        limit: Number(limit.replace(/,/g, ".")),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
      };

      await createCreditCardEntry(payload);
      resetForm();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Cartão
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo cartão de crédito</SheetTitle>
          <SheetDescription>
            Adicione um novo cartão para acompanhar seus gastos e limites.
          </SheetDescription>
        </SheetHeader>

        <form id="create-card-form" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do cartão</Label>
              <Input
                id="name"
                placeholder="Ex: Nubank, Itaú Platinum"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="flag">Bandeira</Label>
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
                <Label htmlFor="lastFourDigits">Últimos 4 dígitos</Label>
                <Input
                  id="lastFourDigits"
                  placeholder="1234"
                  maxLength={4}
                  value={lastFourDigits}
                  required
                  onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Limite do cartão</Label>
              <Input
                id="limit"
                placeholder="5000.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="closingDay">Dia do fechamento</Label>
                <Input
                  id="closingDay"
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
                <Label htmlFor="dueDay">Dia do vencimento</Label>
                <Input
                  id="dueDay"
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
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Criando..." : "Criar cartão"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
