import { parseCurrencyInput, validateSchedule } from "@/lib/subscriptions/validation";
import type { Subscription, SubscriptionFrequency, UpdateSubscriptionPayload } from "@/types/finance";
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";

interface UseSubscriptionEditorOptions {
  onUpdate: (subscriptionId: string, payload: UpdateSubscriptionPayload) => Promise<unknown>;
  onDelete: (subscriptionId: string) => Promise<unknown>;
  defaults?: {
    dayOfMonth?: number;
    dayOfWeek?: number;
    month?: number;
  };
}

export interface SubscriptionEditorValues {
  description: string;
  amount: string;
  categoryId: string;
  frequency: SubscriptionFrequency;
  dayOfMonth: number;
  dayOfWeek: number;
  month: number;
  isActive: boolean;
}

export interface SubscriptionEditorState {
  editing: Subscription | null;
  deleteTarget: Subscription | null;
  values: SubscriptionEditorValues;
  isSubmitting: boolean;
  error: string | null;
}

export interface SubscriptionEditorActions {
  setValue: <K extends keyof SubscriptionEditorValues>(key: K, value: SubscriptionEditorValues[K]) => void;
  openEdit: (subscription: Subscription) => void;
  closeEdit: () => void;
  requestDelete: (subscription: Subscription) => void;
  cancelDelete: () => void;
  handleEditSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export type SubscriptionEditorHook = SubscriptionEditorState & {
  actions: SubscriptionEditorActions;
};

export function useSubscriptionEditor({ onUpdate, onDelete, defaults }: UseSubscriptionEditorOptions): SubscriptionEditorHook {
  const initialValues: SubscriptionEditorValues = useMemo(
    () => ({
      description: "",
      amount: "",
      categoryId: "",
      frequency: "monthly",
      dayOfMonth: defaults?.dayOfMonth ?? 15,
      dayOfWeek: defaults?.dayOfWeek ?? 1,
      month: defaults?.month ?? 1,
      isActive: true,
    }),
    [defaults?.dayOfMonth, defaults?.dayOfWeek, defaults?.month],
  );

  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [values, setValues] = useState<SubscriptionEditorValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = useCallback(<K extends keyof SubscriptionEditorValues>(key: K, value: SubscriptionEditorValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const openEdit = useCallback((subscription: Subscription) => {
    setEditing(subscription);
    setValues({
      description: subscription.description,
      amount: String(subscription.amount),
      categoryId: subscription.categoryId,
      frequency: subscription.frequency,
      dayOfMonth: subscription.dayOfMonth ?? (defaults?.dayOfMonth ?? 15),
      dayOfWeek: subscription.dayOfWeek ?? (defaults?.dayOfWeek ?? 1),
      month: subscription.month ?? (defaults?.month ?? 1),
      isActive: subscription.isActive,
    });
    setError(null);
    setIsSubmitting(false);
  }, [defaults?.dayOfMonth, defaults?.dayOfWeek, defaults?.month]);

  const closeEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const requestDelete = useCallback((subscription: Subscription) => {
    setDeleteTarget(subscription);
    setError(null);
    setIsSubmitting(false);
  }, []);

  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  const handleEditSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!editing) return;
      setError(null);

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
        const payload: UpdateSubscriptionPayload = {
          description: values.description.trim(),
          amount: parsedAmount,
          categoryId: values.categoryId.trim(),
          frequency: values.frequency,
          dayOfMonth: values.frequency === "weekly" ? undefined : values.dayOfMonth,
          dayOfWeek: values.frequency === "weekly" ? values.dayOfWeek : undefined,
          month: values.frequency === "yearly" ? values.month : undefined,
          isActive: values.isActive,
        };
        await onUpdate(editing.id, payload);
        closeEdit();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível atualizar agora.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [closeEdit, editing, onUpdate, values],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir assinatura.");
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteTarget, onDelete]);

  const api: SubscriptionEditorHook = {
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

  return api;
}
