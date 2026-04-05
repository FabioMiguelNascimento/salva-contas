"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TransactionCategory } from "@/types/finance";
import { AlertTriangle, Lock, Trash2, X } from "lucide-react";

interface CategoryDeleteSheetProps {
  open: boolean;
  category: TransactionCategory | null;
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function CategoryDeleteSheet({
  open,
  category,
  isDeleting,
  error,
  onClose,
  onConfirm,
}: CategoryDeleteSheetProps) {
  const isGlobal = Boolean(category?.isGlobal);

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent className="flex min-h-0 flex-col" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle>Excluir categoria</SheetTitle>
              <SheetDescription>
                {isGlobal
                  ? "Categorias globais não podem ser excluídas."
                  : "Essa ação não pode ser desfeita. Transações vinculadas ficarão sem categoria."}
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações da categoria">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={isGlobal ? "Categoria protegida" : "Excluir categoria"}
                      disabled
                    >
                      {isGlobal ? <Lock data-icon="inline-start" /> : <Trash2 data-icon="inline-start" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isGlobal ? "Categoria protegida" : "Excluir categoria"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Fechar" onClick={onClose}>
                      <X data-icon="inline-start" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fechar</TooltipContent>
                </Tooltip>
              </ButtonGroup>
            </TooltipProvider>
          </div>
        </SheetHeader>

        <SheetBody className="flex min-h-0 flex-1 flex-col gap-4">
          {isGlobal ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              Somente categorias pessoais podem ser excluídas.
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="shrink-0" />
              <span>
                Tem certeza que deseja excluir &ldquo;{category?.name}&rdquo;?
              </span>
            </div>
          )}

          {error ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </SheetBody>

        <SheetFooter className="flex-row gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          {!isGlobal ? (
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              Excluir
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
