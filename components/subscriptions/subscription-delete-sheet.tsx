import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { SubscriptionEditorHook } from "@/hooks/use-subscription-editor";
import { Loader2, Trash2 } from "lucide-react";

interface SubscriptionDeleteSheetProps {
  editor: SubscriptionEditorHook;
}

export function SubscriptionDeleteSheet({ editor }: SubscriptionDeleteSheetProps) {
  const { deleteTarget, error, isSubmitting, actions } = editor;
  const { cancelDelete, handleDelete } = actions;

  return (
    <Sheet open={!!deleteTarget} onOpenChange={(open) => (!open ? cancelDelete() : undefined)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Cancelar assinatura
          </SheetTitle>
          <SheetDescription>
            {deleteTarget ? `Tem certeza que deseja desativar e remover "${deleteTarget.description}"?` : ""}
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="text-sm text-muted-foreground">
            Esta ação irá remover a regra de recorrência. Lançamentos já gerados não serão afetados.
          </p>
          {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
        </SheetBody>
        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" onClick={cancelDelete} disabled={isSubmitting} className="flex-1">
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancelar assinatura
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
