"use client";

import { CategorySelect } from "@/components/category-select";
import { Button } from "@/components/ui/button";
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
import type { BudgetFormHook } from "@/hooks/use-budget-form";
import { months } from "@/lib/subscriptions/constants";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";

interface BudgetCreateSheetProps {
  form: BudgetFormHook;
  trigger?: React.ReactNode;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

export function BudgetCreateSheet({ form, trigger }: BudgetCreateSheetProps) {
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
            Novo Orçamento
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo orçamento</SheetTitle>
          <SheetDescription>
            Defina um limite de gastos para uma categoria específica.
          </SheetDescription>
        </SheetHeader>

        <form id="create-budget-form" className="flex flex-1 flex-col" onSubmit={onSubmit}>
          <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <CategorySelect
                value={values.categoryId}
                onValueChange={(value) => setValue("categoryId", value ?? "")}
                placeholder="Selecione uma categoria"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor limite</Label>
              <Input
                placeholder="1.500,00"
                value={values.amount}
                onChange={(e) => setValue("amount", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label>Ano</Label>
                <Select
                  value={String(values.year)}
                  onValueChange={(value) => setValue("year", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </SheetBody>

          <SheetFooter>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Orçamento
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
