import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Transaction } from "@/types/finance";
import { Trash2, X } from "lucide-react";

interface Props {
  open: boolean;
  transaction?: Transaction;
  isProcessing: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteTransactionDialog({
  open,
  transaction,
  isProcessing,
  onClose,
  onDelete,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(o) => (o ? undefined : onClose())}>
      <SheetContent className="flex flex-col" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>Remover transação</SheetTitle>
              <SheetDescription>Esta ação não pode ser desfeita.</SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações de remoção da transação">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Removendo transação" disabled>
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Remover</TooltipContent>
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

        <SheetBody>
          <p className="text-sm text-muted-foreground">
            {transaction
              ? `Deseja excluir a transação "${transaction.description}"?`
              : ""}
          </p>
          {transaction?.createdByName ? (
            <p className="mt-2 text-xs text-muted-foreground">Criado por {transaction.createdByName}</p>
          ) : null}
        </SheetBody>

        <SheetFooter className="flex-row gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isProcessing} className="flex-1">
            {isProcessing ? "Removendo..." : "Excluir"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

