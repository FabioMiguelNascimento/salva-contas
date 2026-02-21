import { useFinance } from "@/hooks/use-finance";
import type { Transaction } from "@/types/finance";
import { useCallback, useState } from "react";

export function useTransactionEditor() {
  const { updateExistingTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCreditCardId, setEditCreditCardId] = useState<string | null>(null);
  const [editType, setEditType] = useState("expense");
  const [editStatus, setEditStatus] = useState("paid");

  const openEditor = useCallback((tx: Transaction) => {
    setTransaction(tx);
    setEditDescription(tx.description);
    setEditAmount(String(tx.amount));
    setEditCategoryId(tx.categoryId ?? null);
    setEditCreditCardId(tx.creditCardId ?? null);
    setEditType(tx.type);
    setEditStatus(tx.status);
    setEditDate(tx.paymentDate ? new Date(tx.paymentDate) : undefined);
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
        await updateExistingTransaction(transaction.id, {
          description: editDescription,
          amount: parsedAmount,
          type: editType as Transaction["type"],
          status: editStatus as Transaction["status"],
          paymentDate: editDate ? editDate.toISOString() : null,
          categoryId: editCategoryId,
          creditCardId: editCreditCardId,
        });
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
    [transaction, editAmount, editDescription, editType, editStatus, editDate, editCategoryId, editCreditCardId, updateExistingTransaction, closeEditor]
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
    editType,
    editStatus,
    setEditDate,
    setEditAmount,
    setEditDescription,
    setEditCategoryId,
    setEditCreditCardId,
    setEditType,
    setEditStatus,
    openEditor,
    closeEditor,
    handleSubmit,
  };
}
