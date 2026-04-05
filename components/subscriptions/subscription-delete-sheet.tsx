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
import type { SubscriptionEditorHook } from "@/hooks/use-subscription-editor";
import { Loader2, Trash2, X } from "lucide-react";

interface SubscriptionDeleteSheetProps {
  editor: SubscriptionEditorHook;
}

export function SubscriptionDeleteSheet({ editor }: SubscriptionDeleteSheetProps) {
  const { deleteTarget, error, isSubmitting, actions } = editor;
  const { cancelDelete, handleDelete } = actions;

  return (
    <Sheet open={!!deleteTarget} onOpenChange={(open) => (!open ? cancelDelete() : undefined)}>
      <SheetContent showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>Cancelar assinatura</SheetTitle>
              <SheetDescription>
                {deleteTarget ? `Tem certeza que deseja desativar e remover "${deleteTarget.description}"?` : ""}
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações de cancelamento da assinatura">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Cancelando assinatura" disabled>
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Cancelar assinatura</TooltipContent>
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


