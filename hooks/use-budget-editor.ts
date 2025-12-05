import type { Budget, UpdateBudgetPayload } from "@/types/finance";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";

interface UseBudgetEditorOptions {
  onUpdate: (budgetId: string, payload: UpdateBudgetPayload) => Promise<unknown>;
  onDelete: (budgetId: string) => Promise<unknown>;
}

export interface BudgetEditorValues {
  amount: string;
}

export interface BudgetEditorState {
  editing: Budget | null;
  deleteTarget: Budget | null;
  values: BudgetEditorValues;
  isSubmitting: boolean;
  error: string | null;
}

export interface BudgetEditorActions {
  setValue: <K extends keyof BudgetEditorValues>(key: K, value: BudgetEditorValues[K]) => void;
  openEdit: (budget: Budget) => void;
  closeEdit: () => void;
  requestDelete: (budget: Budget) => void;
  cancelDelete: () => void;
  handleEditSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export type BudgetEditorHook = BudgetEditorState & {
  actions: BudgetEditorActions;
};

function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function useBudgetEditor({ onUpdate, onDelete }: UseBudgetEditorOptions): BudgetEditorHook {
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [values, setValues] = useState<BudgetEditorValues>({ amount: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = useCallback(<K extends keyof BudgetEditorValues>(key: K, value: BudgetEditorValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const openEdit = useCallback((budget: Budget) => {
    setEditing(budget);
    setValues({
      amount: String(budget.amount),
    });
    setError(null);
  }, []);

  const closeEdit = useCallback(() => {
    setEditing(null);
    setValues({ amount: "" });
    setError(null);
  }, []);

  const requestDelete = useCallback((budget: Budget) => {
    setDeleteTarget(budget);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleEditSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!editing) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const amount = parseCurrencyInput(values.amount);
        if (amount <= 0) {
          throw new Error("Informe um valor maior que zero");
        }

        const payload: UpdateBudgetPayload = { amount };
        await onUpdate(editing.id, payload);
        closeEdit();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao atualizar orçamento");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editing, values, onUpdate, closeEdit],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onDelete(deleteTarget.id);
      cancelDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir orçamento");
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteTarget, onDelete, cancelDelete]);

  return {
    editing,
    deleteTarget,
    values,
    isSubmitting,
    error,
    actions: {
      setValue,
      openEdit,
      closeEdit,
      requestDelete,
      cancelDelete,
      handleEditSubmit,
      handleDelete,
    },
  };
}
