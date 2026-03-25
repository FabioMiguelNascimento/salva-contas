import type { SplitRow } from "@/components/new-transaction/split-payment-builder";
import { useTransactions } from "@/context/transactions-context";
import type { PaymentMethod, Transaction } from "@/types/finance";
import { useCallback, useState } from "react";

export function useTransactionEditor() {
  const { updateExistingTransaction } = useTransactions();
  const [open, setOpen] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCreditCardId, setEditCreditCardId] = useState<string | null>(null);
  const [editDebitCardId, setEditDebitCardId] = useState<string | null>(null);
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>("cash");
  const [editIsSplitMode, setEditIsSplitMode] = useState(false);
  const [editSplits, setEditSplits] = useState<SplitRow[]>([]);
  const [editType, setEditType] = useState("expense");
  const [editStatus, setEditStatus] = useState("paid");

  const openEditor = useCallback((tx: Transaction) => {
    setTransaction(tx);
    setEditDescription(tx.description);
    setEditAmount(String(tx.amount));
    setEditCategoryId(tx.categoryId ?? null);
    setEditType(tx.type);
    setEditStatus(tx.status);
    setEditDate(tx.paymentDate ? new Date(tx.paymentDate) : undefined);

    // Init payment method / splits
    if (tx.splits && tx.splits.length > 0) {
      setEditIsSplitMode(true);
      setEditSplits(
        tx.splits.map((s) => ({
          amount: Number(s.amount),
          paymentMethod: s.paymentMethod,
          creditCardId: s.creditCardId ?? null,
          debitCardId: (s as any).debitCardId ?? null,
        }))
      );
      setEditCreditCardId(null);
      setEditDebitCardId(null);
      setEditPaymentMethod("cash");
    } else {
      setEditIsSplitMode(false);
      setEditSplits([]);
      setEditCreditCardId(tx.creditCardId ?? null);
      setEditDebitCardId(tx.debitCardId ?? null);
      setEditPaymentMethod(tx.creditCardId ? "credit_card" : tx.debitCardId ? "debit" : "cash");
    }

    setOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setOpen(false);
    setTransaction(undefined);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!transaction) return;
      const parsedAmount = Number(editAmount.replace(/,/g, "."));
      setIsProcessing(true);
      setError(null);
      try {
        const payload: Parameters<typeof updateExistingTransaction>[1] = {
          description: editDescription,
          amount: parsedAmount,
          type: editType as Transaction["type"],
          status: editStatus as Transaction["status"],
          paymentDate: editDate ? editDate.toISOString() : null,
          categoryId: editCategoryId,
        };

        if (editIsSplitMode) {
          payload.splits = editSplits;
          payload.creditCardId = null;
          payload.debitCardId = null;
        } else {
          payload.creditCardId = editPaymentMethod === "credit_card" ? editCreditCardId : null;
          payload.debitCardId = editPaymentMethod === "debit" ? editDebitCardId : null;
        }

        await updateExistingTransaction(transaction.id, payload);
        closeEditor();
      } catch (err) {
        let msg = err instanceof Error ? err.message : "Erro ao atualizar transação";
        // user-friendly overrides based on validation paths
        if (msg.includes("categoryId") || msg.includes("expected string, received null")) {
          msg = "Categoria inválida ou não fornecida";
        }
        setError(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [transaction, editAmount, editDescription, editType, editStatus, editDate, editCategoryId, editCreditCardId, editDebitCardId, editPaymentMethod, editIsSplitMode, editSplits, updateExistingTransaction, closeEditor]
  );

  return {
    open,
    transaction,
    isProcessing,
    error,
    editDate,
    editAmount,
    editDescription,
    editCategoryId,
    editCreditCardId,
    editDebitCardId,
    editPaymentMethod,
    editIsSplitMode,
    editSplits,
    editType,
    editStatus,
    setEditDate,
    setEditAmount,
    setEditDescription,
    setEditCategoryId,
    setEditCreditCardId,
    setEditDebitCardId,
    setEditPaymentMethod,
    setEditIsSplitMode,
    setEditSplits,
    setEditType,
    setEditStatus,
    openEditor,
    closeEditor,
    handleSubmit,
  };
}
