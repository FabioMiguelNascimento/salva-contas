"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { BudgetEditorHook } from "@/hooks/use-budget-editor";
import { Loader2 } from "lucide-react";

interface BudgetEditSheetProps {
  editor: BudgetEditorHook;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function BudgetEditSheet({ editor }: BudgetEditSheetProps) {
  const { editing, values, isSubmitting, error, actions } = editor;
  const { setValue, closeEdit, handleEditSubmit } = actions;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleEditSubmit(e);
  };

  return (
    <Sheet open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Editar orçamento</SheetTitle>
          <SheetDescription>
            {editing?.category?.name ?? "Categoria"} – Altere o valor limite para esta categoria.
          </SheetDescription>
        </SheetHeader>

        <form id="edit-budget-form" className="flex flex-1 flex-col" onSubmit={onSubmit}>
          <SheetBody className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p className="font-medium">{editing?.category?.name ?? editing?.categoryId}</p>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="font-medium">
                {editing?.month}/{editing?.year}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Novo valor limite</Label>
              <Input
                placeholder="1.500,00"
                value={values.amount}
                onChange={(e) => setValue("amount", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Valor atual: {currencyFormatter.format(editing?.amount ?? 0)}
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </SheetBody>

          <SheetFooter>
            <Button type="button" variant="outline" className="flex-1" onClick={closeEdit}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
