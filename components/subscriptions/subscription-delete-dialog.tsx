import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { SubscriptionEditorHook } from "@/hooks/use-subscription-editor";
import { Loader2 } from "lucide-react";

interface SubscriptionDeleteDialogProps {
  editor: SubscriptionEditorHook;
}

export function SubscriptionDeleteDialog({ editor }: SubscriptionDeleteDialogProps) {
  const { deleteTarget, error, isSubmitting, actions } = editor;
  const { cancelDelete, handleDelete } = actions;

  return (
    <Dialog open={!!deleteTarget} onOpenChange={(open) => (!open ? cancelDelete() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar assinatura</DialogTitle>
          <DialogDescription>
            {deleteTarget ? `Desativar e remover "${deleteTarget.description}"?` : ""}
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={cancelDelete} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cancelar assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
