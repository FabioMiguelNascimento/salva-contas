import { CategorySelect } from "@/components/category-select";
import { CreditCardSelect } from "@/components/credit-card-select";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Transaction } from "@/types/finance";

interface Props {
  open: boolean;
  transaction?: Transaction;
  isProcessing: boolean;
  editDescription: string;
  editAmount: string;
  editType: string;
  editStatus: string;
  editDate?: Date;
  editCategoryId: string | null;
  editCreditCardId: string | null;
  setEditDescription: (v: string) => void;
  setEditAmount: (v: string) => void;
  setEditType: (v: string) => void;
  setEditStatus: (v: string) => void;
  setEditDate: (d: Date | undefined) => void;
  setEditCategoryId: (v: string | null) => void;
  setEditCreditCardId: (v: string | null) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function EditTransactionSheet({
  open,
  transaction,
  isProcessing,
  editDescription,
  editAmount,
  editType,
  editStatus,
  editDate,
  editCategoryId,
  editCreditCardId,
  setEditDescription,
  setEditAmount,
  setEditType,
  setEditStatus,
  setEditDate,
  setEditCategoryId,
  setEditCreditCardId,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(o) => (o ? undefined : onClose())}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Editar transação</SheetTitle>
        </SheetHeader>

        <form id="edit-transaction-form" onSubmit={onSubmit} className="flex flex-1 flex-col">
          <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <CategorySelect value={editCategoryId} onValueChange={setEditCategoryId} />
            </div>
            <div className="space-y-2">
              <Label>Cartão de crédito</Label>
              <CreditCardSelect value={editCreditCardId} onValueChange={setEditCreditCardId} placeholder="Nenhum (opcional)" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input value={editAmount} onChange={(event) => setEditAmount(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{editStatus === "paid" ? "Data do pagamento" : "Data prevista"}</Label>
                <DatePicker date={editDate} onChange={setEditDate} placeholder="Selecione" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas internas</Label>
              <Textarea placeholder="Adicione um contexto adicional" disabled />
            </div>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? "Salvando..." : "Salvar alterações"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
