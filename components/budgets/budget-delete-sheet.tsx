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
import type { BudgetEditorHook } from "@/hooks/use-budget-editor";
import { formatCurrency } from "@/lib/currency-utils";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface BudgetDeleteSheetProps {
  editor: BudgetEditorHook;
}

export function BudgetDeleteSheet({ editor }: BudgetDeleteSheetProps) {
  const { deleteTarget, isSubmitting, error, actions } = editor;
  const { cancelDelete, handleDelete } = actions;

  return (
    <Sheet open={!!deleteTarget} onOpenChange={(open) => !open && cancelDelete()}>
      <SheetContent className="flex flex-col overflow-y-auto" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>Excluir orçamento</SheetTitle>
              <SheetDescription>
                Esta ação não pode ser desfeita.
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações de exclusão do orçamento">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Excluindo orçamento" disabled>
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
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Confirmar exclusão</p>
              <p className="text-sm text-muted-foreground">
                O orçamento será removido permanentemente.
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p className="font-medium">{deleteTarget?.category?.name ?? deleteTarget?.categoryId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Limite</p>
              <p className="font-medium">{formatCurrency(deleteTarget?.amount ?? 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="font-medium">
                {deleteTarget?.month}/{deleteTarget?.year}
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </SheetBody>

        <SheetFooter>
          <Button type="button" variant="outline" className="flex-1" onClick={cancelDelete}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


