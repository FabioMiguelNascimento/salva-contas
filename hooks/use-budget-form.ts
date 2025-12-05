import type { CreateBudgetPayload } from "@/types/finance";
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";

interface UseBudgetFormOptions {
  onCreate: (payload: CreateBudgetPayload) => Promise<unknown>;
  defaultMonth?: number;
  defaultYear?: number;
}

export interface BudgetFormValues {
  categoryId: string;
  amount: string;
  month: number;
  year: number;
}

export interface BudgetFormState {
  values: BudgetFormValues;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface BudgetFormActions {
  setValue: <K extends keyof BudgetFormValues>(key: K, value: BudgetFormValues[K]) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  resetSuccess: () => void;
  reset: () => void;
}

export type BudgetFormHook = BudgetFormState & {
  actions: BudgetFormActions;
};

function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function useBudgetForm({
  onCreate,
  defaultMonth,
  defaultYear,
}: UseBudgetFormOptions): BudgetFormHook {
  const today = new Date();
  const initialValues: BudgetFormValues = useMemo(
    () => ({
      categoryId: "",
      amount: "",
      month: defaultMonth ?? today.getMonth() + 1,
      year: defaultYear ?? today.getFullYear(),
    }),
    [defaultMonth, defaultYear],
  );

  const [values, setValues] = useState<BudgetFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setValue: BudgetFormActions["setValue"] = useCallback((key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setError(null);
    setSuccessMessage(null);
  }, [initialValues]);

  const resetSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);

      try {
        if (!values.categoryId) {
          throw new Error("Selecione uma categoria");
        }

        const amount = parseCurrencyInput(values.amount);
        if (amount <= 0) {
          throw new Error("Informe um valor maior que zero");
        }

        const payload: CreateBudgetPayload = {
          categoryId: values.categoryId,
          amount,
          month: values.month,
          year: values.year,
        };

        await onCreate(payload);
        setSuccessMessage("Orçamento criado com sucesso!");
        reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao criar orçamento");
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onCreate, reset],
  );

  return {
    values,
    isSubmitting,
    error,
    successMessage,
    actions: {
      setValue,
      handleSubmit,
      resetSuccess,
      reset,
    },
  };
}
