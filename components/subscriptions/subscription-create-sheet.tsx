"use client";

import { CategorySelect } from "@/components/category-select";
import { CreditCardSelect } from "@/components/credit-card-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import type { SubscriptionFormHook } from "@/hooks/use-subscription-form";
import { frequencyOptions, months, weekDays } from "@/lib/subscriptions/constants";
import type { SubscriptionFrequency } from "@/types/finance";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";

interface SubscriptionCreateSheetProps {
  form: SubscriptionFormHook;
  trigger?: React.ReactNode;
}

export function SubscriptionCreateSheet({ form, trigger }: SubscriptionCreateSheetProps) {
  const [open, setOpen] = useState(false);
  const { values, error, isSubmitting, successMessage, actions } = form;
  const { setValue, handleSubmit, resetSuccess } = actions;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  // Fecha o sheet quando houver sucesso
  if (successMessage && open) {
    setOpen(false);
    resetSuccess();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nova Assinatura
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Nova assinatura</SheetTitle>
          <SheetDescription>
            Informe os parâmetros para gerar o lançamento automaticamente.
          </SheetDescription>
        </SheetHeader>

        <form id="create-subscription-form" className="flex flex-1 flex-col" onSubmit={onSubmit}>
          <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex.: Netflix"
                value={values.description}
                onChange={(e) => setValue("description", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                placeholder="120,00"
                value={values.amount}
                onChange={(e) => setValue("amount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <CategorySelect
                value={values.categoryId}
                onValueChange={(value) => setValue("categoryId", value ?? "")}
                placeholder="Selecione uma categoria"
              />
            </div>
            <div className="space-y-2">
              <Label>Cartão de crédito</Label>
              <CreditCardSelect
                value={values.creditCardId}
                onValueChange={(value) => setValue("creditCardId", value)}
                placeholder="Nenhum (opcional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select
                value={values.frequency}
                onValueChange={(value: SubscriptionFrequency) => setValue("frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(values.frequency === "monthly" || values.frequency === "yearly") && (
              <div className="space-y-2">
                <Label>Dia do mês</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={values.dayOfMonth}
                  onChange={(e) => setValue("dayOfMonth", Number(e.target.value))}
                />
              </div>
            )}
            {values.frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Dia da semana</Label>
                <Select
                  value={String(values.dayOfWeek)}
                  onValueChange={(value) => setValue("dayOfWeek", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map((day) => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {values.frequency === "yearly" && (
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select
                  value={String(values.month)}
                  onValueChange={(value) => setValue("month", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={String(month.value)}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="active-create"
                checked={values.isActive}
                onCheckedChange={(checked) => setValue("isActive", !!checked)}
              />
              <Label htmlFor="active-create" className="cursor-pointer">
                Ativar assinatura
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Desmarque para guardar a regra sem gerar faturas.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </SheetBody>

          <SheetFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Assinatura
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
