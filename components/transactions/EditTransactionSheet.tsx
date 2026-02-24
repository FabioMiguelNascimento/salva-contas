import { CategorySelect } from "@/components/category-select";
import { CreditCardSelect } from "@/components/credit-card-select";
import { DatePicker } from "@/components/date-picker";
import { SplitPaymentBuilder, SplitRow } from "@/components/new-transaction/split-payment-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHOD_LABELS, PaymentMethod, Transaction } from "@/types/finance";
import { SplitSquareHorizontal } from "lucide-react";

const PAYMENT_METHODS = Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][];

interface Props {
  open: boolean;
  transaction?: Transaction;
  isProcessing: boolean;
  error?: string | null;
  editDescription: string;
  editAmount: string;
  editType: string;
  editStatus: string;
  editDate?: Date;
  editCategoryId: string | null;
  editCreditCardId: string | null;
  editPaymentMethod: PaymentMethod;
  editIsSplitMode: boolean;
  editSplits: SplitRow[];
  setEditDescription: (v: string) => void;
  setEditAmount: (v: string) => void;
  setEditType: (v: string) => void;
  setEditStatus: (v: string) => void;
  setEditDate: (d: Date | undefined) => void;
  setEditCategoryId: (v: string | null) => void;
  setEditCreditCardId: (v: string | null) => void;
  setEditPaymentMethod: (v: PaymentMethod) => void;
  setEditIsSplitMode: (v: boolean) => void;
  setEditSplits: (splits: SplitRow[]) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function EditTransactionSheet({
  open,
  transaction,
  isProcessing,
  error,
  editDescription,
  editAmount,
  editType,
  editStatus,
  editDate,
  editCategoryId,
  editCreditCardId,
  editPaymentMethod,
  editIsSplitMode,
  editSplits,
  setEditDescription,
  setEditAmount,
  setEditType,
  setEditStatus,
  setEditDate,
  setEditCategoryId,
  setEditCreditCardId,
  setEditPaymentMethod,
  setEditIsSplitMode,
  setEditSplits,
  onClose,
  onSubmit,
}: Props) {
  const parsedAmount = Number(editAmount.replace(/,/g, ".")) || 0;

  function toggleSplitMode() {
    if (!editIsSplitMode) {
      const initial: SplitRow = {
        amount: parsedAmount,
        paymentMethod: editPaymentMethod === "credit_card" ? "credit_card" : editPaymentMethod,
        creditCardId: editPaymentMethod === "credit_card" ? (editCreditCardId ?? null) : null,
      };
      setEditSplits([initial]);
      setEditIsSplitMode(true);
    } else {
      setEditSplits([]);
      setEditIsSplitMode(false);
    }
  }

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

            {/* Payment section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Forma de pagamento</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground"
                  onClick={toggleSplitMode}
                >
                  <SplitSquareHorizontal className="h-3.5 w-3.5" />
                  {editIsSplitMode ? "Pagamento único" : "Dividir pagamento"}
                </Button>
              </div>

              {editIsSplitMode ? (
                <SplitPaymentBuilder
                  splits={editSplits}
                  totalAmount={parsedAmount}
                  onChange={setEditSplits}
                />
              ) : (
                <div className="space-y-2">
                  <Select value={editPaymentMethod} onValueChange={(v) => setEditPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {editPaymentMethod === "credit_card" && (
                    <CreditCardSelect
                      value={editCreditCardId}
                      onValueChange={setEditCreditCardId}
                      placeholder="Selecione o cartão"
                      allowClear
                    />
                  )}
                </div>
              )}
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

            {error && <p className="text-sm text-destructive">{error}</p>}
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
