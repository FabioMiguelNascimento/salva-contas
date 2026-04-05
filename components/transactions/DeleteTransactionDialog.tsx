import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Transaction } from "@/types/finance";

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
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent className="flex min-h-0 flex-col" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle>Remover transação</SheetTitle>
              <SheetDescription>Essa ação não pode ser desfeita.</SheetDescription>
            </div>

            <ButtonGroup aria-label="Ações de remoção da transação">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Removendo transação"
                disabled
              >
                <Trash2 data-icon="inline-start" />
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="outline" size="icon-sm" aria-label="Fechar">
                  <X data-icon="inline-start" />
                </Button>
              </SheetClose>
            </ButtonGroup>
          </div>
        </SheetHeader>

        <SheetBody className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="shrink-0" />
            <span>
              Tem certeza que deseja excluir &ldquo;{transaction?.description}&rdquo;?
            </span>
          </div>

          {transaction?.createdByName ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              Criado por {transaction.createdByName}
            </div>
          ) : null}
        </SheetBody>

        <SheetFooter className="flex-row gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" className="flex-1" onClick={onDelete} disabled={isProcessing}>
            {isProcessing ? "Removendo..." : "Excluir"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
