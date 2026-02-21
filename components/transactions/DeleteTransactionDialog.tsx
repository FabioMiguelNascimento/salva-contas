import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
    <Sheet open={open} onOpenChange={(o) => (o ? undefined : onClose())}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Remover transação</SheetTitle>
          <SheetDescription>Esta ação não pode ser desfeita.</SheetDescription>
        </SheetHeader>

        <SheetBody>
          <p className="text-sm text-muted-foreground">
            {transaction
              ? `Deseja excluir a transação "${transaction.description}"?`
              : ""}
          </p>
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
