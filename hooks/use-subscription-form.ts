import { parseCurrencyInput, validateSchedule } from "@/lib/subscriptions/validation";
import type { CreateSubscriptionPayload, SubscriptionFrequency } from "@/types/finance";
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";

interface UseSubscriptionFormOptions {
  onCreate: (payload: CreateSubscriptionPayload) => Promise<unknown>;
  defaults?: {
    dayOfMonth?: number;
    dayOfWeek?: number;
    month?: number;
  };
}

export interface SubscriptionFormValues {
  description: string;
  amount: string;
  categoryId: string;
  creditCardId: string | null;
  frequency: SubscriptionFrequency;
  dayOfMonth: number;
  dayOfWeek: number;
  month: number;
  isActive: boolean;
}

export interface SubscriptionFormState {
  values: SubscriptionFormValues;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface SubscriptionFormActions {
  setValue: <K extends keyof SubscriptionFormValues>(key: K, value: SubscriptionFormValues[K]) => void;
  setFrequency: (frequency: SubscriptionFrequency) => void;
  setIsActive: (isActive: boolean) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  resetSuccess: () => void;
}

export type SubscriptionFormHook = SubscriptionFormState & {
  actions: SubscriptionFormActions;
};

export function useSubscriptionForm({
  onCreate,
  defaults = { dayOfMonth: 15, dayOfWeek: 1, month: 1 },
}: UseSubscriptionFormOptions) {
  const initialValues: SubscriptionFormValues = useMemo(
    () => ({
      description: "",
      amount: "",
      categoryId: "",
      creditCardId: null,
      frequency: "monthly",
      dayOfMonth: defaults.dayOfMonth ?? 15,
      dayOfWeek: defaults.dayOfWeek ?? 1,
      month: defaults.month ?? 1,
      isActive: true,
    }),
    [defaults.dayOfMonth, defaults.dayOfWeek, defaults.month],
  );

  const [values, setValues] = useState<SubscriptionFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setValue: SubscriptionFormActions["setValue"] = useCallback((key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setFrequency = useCallback((frequency: SubscriptionFrequency) => {
    setValues((prev) => ({
      ...prev,
      frequency,
    }));
  }, []);

  const setIsActive = useCallback((nextIsActive: boolean) => {
    setValues((prev) => ({
      ...prev,
      isActive: nextIsActive,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSubmit: SubscriptionFormActions["handleSubmit"] = useCallback(
    async (event) => {
      event.preventDefault();
      setError(null);
      setSuccessMessage(null);

      if (!values.description.trim() || !values.amount.trim() || !values.categoryId.trim()) {
        setError("Preencha descrição, valor e categoria.");
        return;
      }

      const parsedAmount = parseCurrencyInput(values.amount);
      if (Number.isNaN(parsedAmount)) {
        setError("Informe um valor válido.");
        return;
      }

      const scheduleError = validateSchedule({
        frequency: values.frequency,
        dayOfMonth: values.dayOfMonth,
        dayOfWeek: values.dayOfWeek,
        month: values.month,
      });

      if (scheduleError) {
        setError(scheduleError);
        return;
      }

      setIsSubmitting(true);
      try {
        await onCreate({
          description: values.description.trim(),
          amount: parsedAmount,
          categoryId: values.categoryId.trim(),
          creditCardId: values.creditCardId || undefined,
          frequency: values.frequency,
          dayOfMonth: values.frequency === "weekly" ? undefined : values.dayOfMonth,
          dayOfWeek: values.frequency === "weekly" ? values.dayOfWeek : undefined,
          month: values.frequency === "yearly" ? values.month : undefined,
          isActive: values.isActive,
        });
        resetForm();
        setSuccessMessage("Assinatura criada com sucesso!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível criar a assinatura agora.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onCreate, resetForm, values],
  );

  const resetSuccess = useCallback(() => setSuccessMessage(null), []);

  const api: SubscriptionFormHook = {
    values,
    isSubmitting,
    error,
    successMessage,
    actions: {
      setValue,
      setFrequency,
      setIsActive,
      handleSubmit,
      resetSuccess,
    },
  };

  return api;
}
