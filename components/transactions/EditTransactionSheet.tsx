import { CategorySelect } from "@/components/category-select";
import { CreditCardSelect } from "@/components/credit-card-select";
import { DatePicker } from "@/components/date-picker";
import { DebitCardSelect } from "@/components/debit-card-select";
import { SplitPaymentBuilder, SplitRow } from "@/components/new-transaction/split-payment-builder";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/date-utils";
import { cn, getTransactionStatusLabel } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS, PaymentMethod, Transaction } from "@/types/finance";
import { Paperclip, Pencil, SplitSquareHorizontal, Trash2, X } from "lucide-react";
import { Badge } from "../ui/badge";

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
  editDebitCardId: string | null;
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
  setEditDebitCardId: (v: string | null) => void;
  setEditPaymentMethod: (v: PaymentMethod) => void;
  setEditIsSplitMode: (v: boolean) => void;
  setEditSplits: (splits: SplitRow[]) => void;
  installmentTransactions: Transaction[];
  isLoadingInstallments: boolean;
  onClose: () => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
  onViewAttachment?: (transaction: Transaction) => void;
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
  editDebitCardId,
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
  setEditDebitCardId,
  setEditPaymentMethod,
  setEditIsSplitMode,
  setEditSplits,
  installmentTransactions,
  isLoadingInstallments,
  onClose,
  onDeleteTransaction,
  onViewAttachment,
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
      <SheetContent className="flex min-h-0 flex-col" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle>Editar transação</SheetTitle>
              {transaction?.createdByName ? (
                <p className="text-xs text-muted-foreground">Criado por {transaction.createdByName}</p>
              ) : null}
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações da transação">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Editando transação atual" disabled>
                      <Pencil />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Editando</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Abrir anexo"
                      disabled={!transaction?.attachmentUrl}
                      onClick={() => {
                        if (transaction && onViewAttachment) {
                          onViewAttachment(transaction);
                        }
                      }}
                    >
                      <Paperclip />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Anexo</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Excluir transação"
                      disabled={!transaction}
                      onClick={() => {
                        if (transaction && onDeleteTransaction) {
                          onDeleteTransaction(transaction);
                        }
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Excluir</TooltipContent>
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

        <form id="edit-transaction-form" onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetBody className="min-h-0 space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <CategorySelect value={editCategoryId} onValueChange={setEditCategoryId} />
            </div>

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
                  {editIsSplitMode ? "Pagamento unico" : "Dividir pagamento"}
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

                  {editPaymentMethod === "debit" && (
                    <DebitCardSelect
                      value={editDebitCardId}
                      onValueChange={setEditDebitCardId}
                      placeholder="Selecione o débito"
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
              <Label>Parcelas</Label>
              {isLoadingInstallments ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              ) : installmentTransactions && installmentTransactions.length > 0 ? (
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wide">
                      <tr>
                        <th className="px-2 py-2">#</th>
                        <th className="px-2 py-2">Valor</th>
                        <th className="px-2 py-2">Vencimento</th>
                        <th className="px-2 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {installmentTransactions.map((installment) => (
                        <tr key={installment.id} className="border-t border-border">
                          <td className="px-2 py-2">{installment.installmentCurrent}</td>
                          <td className="px-2 py-2">{installment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                          <td className="px-2 py-2">{installment.dueDate ? formatDate(installment.dueDate) : "—"}</td>
                          <td className="px-2 py-2"><Badge
                            className={cn(
                              "text-xs",
                              installment.type === "income"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-destructive/15 text-destructive"
                            )}
                          >
                            {getTransactionStatusLabel(installment.status)}
                          </Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma parcela</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}


