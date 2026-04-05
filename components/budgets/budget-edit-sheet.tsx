"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import type { BudgetEditorHook } from "@/hooks/use-budget-editor";
import { formatCurrency } from "@/lib/currency-utils";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { DynamicIcon } from "../dynamic-icon";
import { Badge } from "../ui/badge";

interface BudgetEditSheetProps {
  editor: BudgetEditorHook;
}

export function BudgetEditSheet({ editor }: BudgetEditSheetProps) {
  const { editing, history, isLoadingHistory, historyError, values, isSubmitting, error, actions } = editor;
  const { setValue, closeEdit, handleEditSubmit, requestDelete } = actions;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleEditSubmit(e);
  };

  return (
    <Sheet open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
      <SheetContent className="flex flex-col overflow-y-auto" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle>Editar orçamento</SheetTitle>
              <SheetDescription>
                Altere o valor limite para está categoria.
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações do orçamento">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Editando orçamento atual" disabled>
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
                      aria-label="Excluir orçamento"
                      disabled={!editing}
                      onClick={() => {
                        if (editing) {
                          requestDelete(editing);
                          closeEdit();
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

        <form id="edit-budget-form" className="flex flex-1 flex-col" onSubmit={onSubmit}>
          <SheetBody className="space-y-4">
            <div className=" flex gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <DynamicIcon name={editing?.category?.icon!}  />
                <p className="">{editing?.category?.name}</p>
              </div>
              <span className="flex-col items-center">
                <p className="text-right text-muted-foreground text-xs">Período</p>
                <Badge variant={"outline"}>  {editing?.month}/{editing?.year} </Badge>
              </span>
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
                Valor atual: {formatCurrency(editing?.amount ?? 0)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Histórico mensal</Label>

              {isLoadingHistory ? (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              ) : historyError ? (
                <p className="text-xs text-destructive">{historyError}</p>
              ) : history.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum histórico disponível.</p>
              ) : (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  {history.map((entry) => {
                    const progressValue = Math.max(0, Math.min(entry.spentPercentage, 100));
                    const spentPercentageLabel = `${Math.min(entry.spentPercentage, 999).toFixed(0)}% usado`;
                    const remainingLabel =
                      entry.remainingAmount >= 0
                        ? `Sobra ${formatCurrency(entry.remainingAmount)}`
                        : `Acima em ${formatCurrency(Math.abs(entry.remainingAmount))}`;

                    return (
                      <div key={entry.id} className="flex flex-col gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {String(entry.month).padStart(2, "0")}/{entry.year}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              Gasto {formatCurrency(entry.spentAmount)} de {formatCurrency(entry.budgetAmount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{spentPercentageLabel}</p>
                            <p className="text-xs text-muted-foreground">{remainingLabel}</p>
                          </div>
                        </div>
                        <Progress value={progressValue} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              )}
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



