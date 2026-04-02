"use client";

import { formatCurrency } from "@/lib/currency-utils";
import { formatDate as formatDateUtil } from "@/lib/date-utils";
import type { AiVisualization } from "@/types/ai-advisor";
import type { Transaction } from "@/types/finance";
import { BadgeCheck, Banknote, CalendarDays, CreditCard, DollarSign, FileText, FolderOpen, Wallet } from "lucide-react";
import { useState } from "react";
import { DiffField } from "./transaction-diff/DiffField";
import { InstallmentSection } from "./transaction-diff/InstallmentSection";
import { PaymentMethodComparison } from "./transaction-diff/PaymentMethodComparison";
import { SplitComparison } from "./transaction-diff/SplitComparison";
import { TransactionActions } from "./transaction-diff/TransactionActions";
import { TransactionHeader } from "./transaction-diff/TransactionHeader";
import type { InstallmentPlanItem, ResolvedPaymentMethod } from "./transaction-diff/types";
import type { VisualizationStatus } from "./types";

type UpdateTransactionPayload = {
  transactionId: any;
  confirm: boolean;
} & Partial<
  Pick<
    Transaction,
    | "amount"
    | "description"
    | "categoryId"
    | "paymentDate"
    | "installments"
    | "type"
    | "status"
    | "creditCardId"
    | "debitCardId"
    | "splits"
  >
>;

interface TransactionDiffVisualizationProps {
  visualization: AiVisualization;
  status: VisualizationStatus;
  onConfirm: (payload: any) => void;
  onCancel: () => void;
  requiresConfirmation: boolean;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Cartão de crédito",
  debit: "Cartão de débito",
  pix: "PIX",
  cash: "Dinheiro",
  transfer: "Transferência",
  other: "Outro",
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return null;
  return formatDateUtil(value);
};

const formatCurrencyFn = (value: unknown): string => {
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return "R$ 0,00";
  return formatCurrency(amount);
};

const formatStatusLabel = (status?: string): string => {
  if (!status) return "";

  switch (status.toLowerCase()) {
    case "paid":
      return "Pago";
    case "pending":
      return "Pendente";
    case "overdue":
      return "Atrasado";
    case "cancelled":
    case "canceled":
      return "Cancelado";
    default:
      return status;
  }
};

function normalizeComparableValue(field: string, value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (field === "amount") {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "";
  }

  if (field === "paymentDate") {
    return formatDate(value) ?? "";
  }

  return String(value).trim().toLowerCase();
}

function hasChanged(original: any, proposed: any, field: string): boolean {
  return normalizeComparableValue(field, original?.[field]) !== normalizeComparableValue(field, proposed?.[field]);
}

function normalizeSplitsForCompare(splits: any): Array<Record<string, any>> {
  if (!Array.isArray(splits)) {
    return [];
  }

  return splits
    .map((split) => ({
      amount: Number(split?.amount || 0),
      paymentMethod: String(split?.paymentMethod || "").trim().toLowerCase(),
      creditCardId: split?.creditCardId ?? split?.creditCard?.id ?? null,
      debitCardId: split?.debitCardId ?? split?.debitCard?.id ?? null,
      creditCardName: split?.creditCard?.name ?? null,
      debitCardName: split?.debitCard?.name ?? null,
      creditCardFlag: split?.creditCard?.flag ?? null,
      debitCardFlag: split?.debitCard?.flag ?? null,
      creditCardLastFourDigits: split?.creditCard?.lastFourDigits ?? null,
      debitCardLastFourDigits: split?.debitCard?.lastFourDigits ?? null,
    }))
    .sort((left, right) => {
      const leftKey = `${left.paymentMethod}:${left.amount}:${left.creditCardId || ""}:${left.debitCardId || ""}`;
      const rightKey = `${right.paymentMethod}:${right.amount}:${right.creditCardId || ""}:${right.debitCardId || ""}`;
      return leftKey.localeCompare(rightKey);
    });
}

function normalizeInstallmentPlan(plan: unknown): InstallmentPlanItem[] {
  if (!Array.isArray(plan)) {
    return [];
  }

  return plan
    .map((item) => {
      const installment = Number(item?.installment ?? 0);
      const totalInstallments = Number(item?.totalInstallments ?? 0);
      const amount = Number(item?.amount ?? 0);

      if (!Number.isFinite(installment) || installment <= 0) {
        return null;
      }

      return {
        installment: Math.trunc(installment),
        totalInstallments:
          Number.isFinite(totalInstallments) && totalInstallments > 0
            ? Math.trunc(totalInstallments)
            : Math.trunc(installment),
        amount: Number.isFinite(amount) ? amount : 0,
        dueDate: item?.dueDate ? String(item.dueDate) : null,
        status: String(item?.status || "pending"),
      };
    })
    .filter((item): item is InstallmentPlanItem => item !== null)
    .sort((left, right) => left.installment - right.installment);
}

function resolvePaymentMethod(transaction: Record<string, any>): ResolvedPaymentMethod {
  const explicitPaymentMethod = String(transaction?.paymentMethod || "").trim().toLowerCase();
  const singleMethod = Array.isArray(transaction?.paymentMethods) && transaction.paymentMethods.length === 1
    ? transaction.paymentMethods[0]
    : null;

  const creditCardName = transaction?.creditCardName ?? transaction?.creditCard?.name ?? null;
  const debitCardName = transaction?.debitCardName ?? transaction?.debitCard?.name ?? null;
  const creditCardFlag = transaction?.creditCardFlag ?? transaction?.creditCard?.flag ?? null;
  const debitCardFlag = transaction?.debitCardFlag ?? transaction?.debitCard?.flag ?? null;

  if (creditCardName || transaction?.creditCardId) {
    return {
      kind: "credit_card",
      label: creditCardName || "Cartão de crédito",
      detail: transaction?.creditCardLastFourDigits ? `•••• ${transaction.creditCardLastFourDigits}` : null,
      flag: creditCardFlag,
      icon: CreditCard,
    };
  }

  if (debitCardName || transaction?.debitCardId) {
    return {
      kind: "debit",
      label: debitCardName || "Cartão de débito",
      detail: transaction?.debitCardLastFourDigits ? `•••• ${transaction.debitCardLastFourDigits}` : null,
      flag: debitCardFlag,
      icon: CreditCard,
    };
  }

  const resolvedMethod = explicitPaymentMethod || String(singleMethod?.paymentMethod || "").trim().toLowerCase();

  if (resolvedMethod && PAYMENT_METHOD_LABELS[resolvedMethod]) {
    return {
      kind: resolvedMethod,
      label: PAYMENT_METHOD_LABELS[resolvedMethod],
      detail: null,
      flag: resolvedMethod,
      icon: resolvedMethod === "cash" ? Banknote : Wallet,
    };
  }

  return {
    kind: "cash",
    label: "Dinheiro",
    detail: null,
    flag: "cash",
    icon: Banknote,
  };
}

export default function TransactionDiffVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: TransactionDiffVisualizationProps) {
  const [showInstallmentPlan, setShowInstallmentPlan] = useState(false);
  const payload = visualization.payload as any;
  const original = payload?.original || {};
  const proposed = payload?.proposed || {};
  const originalInstallmentPlan = normalizeInstallmentPlan(original?.installmentPlan);
  const proposedInstallmentPlan = normalizeInstallmentPlan(proposed?.installmentPlan);

  const amountChanged = hasChanged(original, proposed, "amount");
  const descriptionChanged = hasChanged(original, proposed, "description");
  const categoryChanged = hasChanged(original, proposed, "categoryName");
  const paymentDateChanged = hasChanged(original, proposed, "paymentDate");
  const installmentsChanged = hasChanged(original, proposed, "installments");
  const creditCardChanged = hasChanged(original, proposed, "creditCardName");
  const debitCardChanged = hasChanged(original, proposed, "debitCardName");
  const statusChanged = hasChanged(original, proposed, "status");
  const originalPaymentMethod = resolvePaymentMethod(original);
  const proposedPaymentMethod = resolvePaymentMethod(proposed);
  const originalSplits = normalizeSplitsForCompare(original.splits);
  const proposedSplits = normalizeSplitsForCompare(proposed.splits);
  const hasAnySplits = originalSplits.length > 0 || proposedSplits.length > 0;
  const splitsChanged = JSON.stringify(originalSplits) !== JSON.stringify(proposedSplits);
  const shouldShowInstallmentSection =
    installmentsChanged || originalInstallmentPlan.length > 1 || proposedInstallmentPlan.length > 1;
  const paymentMethodChanged =
    !hasAnySplits &&
    (originalPaymentMethod.kind !== proposedPaymentMethod.kind ||
      originalPaymentMethod.label !== proposedPaymentMethod.label ||
      originalPaymentMethod.detail !== proposedPaymentMethod.detail);

  const anyChanges =
    amountChanged ||
    descriptionChanged ||
    categoryChanged ||
    paymentDateChanged ||
    installmentsChanged ||
    creditCardChanged ||
    debitCardChanged ||
    statusChanged ||
    splitsChanged ||
    paymentMethodChanged;

  const handleConfirm = () => {
    const updatePayload: UpdateTransactionPayload = {
      transactionId: payload?.transactionId,
      confirm: true,
    };

    if (amountChanged && proposed.amount !== undefined) {
      updatePayload.amount = proposed.amount;
    }
    if (descriptionChanged && proposed.description !== undefined) {
      updatePayload.description = proposed.description;
    }
    if (categoryChanged && proposed.categoryId !== undefined) {
      updatePayload.categoryId = proposed.categoryId;
    }
    if (paymentDateChanged && proposed.paymentDate !== undefined) {
      updatePayload.paymentDate = proposed.paymentDate;
    }
    if (installmentsChanged && proposed.installments !== undefined) {
      updatePayload.installments = proposed.installments;
    }
    if (creditCardChanged && proposed.creditCardId !== undefined) {
      updatePayload.creditCardId = proposed.creditCardId;
    }
    if (debitCardChanged && proposed.debitCardId !== undefined) {
      updatePayload.debitCardId = proposed.debitCardId;
    }
    if (statusChanged && proposed.status !== undefined) {
      updatePayload.status = proposed.status;
    }
    if (splitsChanged && proposed.splits !== undefined) {
      updatePayload.splits = proposed.splits;
    }

    onConfirm(updatePayload);
  };

  const changeCount = [
    amountChanged,
    descriptionChanged,
    categoryChanged,
    paymentDateChanged,
    installmentsChanged,
    creditCardChanged,
    debitCardChanged,
    statusChanged,
    splitsChanged,
    paymentMethodChanged,
  ].filter(Boolean).length;

  return (
    <div className="mt-3 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TransactionHeader original={original} changeCount={changeCount} />

      <div className="p-5">
        {!anyChanges && (
          <div className="py-4 text-center">
            <p className="text-[13px] text-slate-600">Nenhuma alteração foi detectada.</p>
          </div>
        )}

        {anyChanges && (
          <div className="space-y-4">
            {amountChanged && (
              <DiffField
                label={<span className="inline-flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />Valor</span>}
                originalValue={original.amount}
                proposedValue={proposed.amount}
                renderValue={formatCurrencyFn}
              />
            )}

            {descriptionChanged && (
              <DiffField
                label={<span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Descrição</span>}
                originalValue={original.description}
                proposedValue={proposed.description}
              />
            )}

            {categoryChanged && (
              <DiffField
                label={<span className="inline-flex items-center gap-1.5"><FolderOpen className="h-3.5 w-3.5" />Categoria</span>}
                originalValue={original.categoryName}
                proposedValue={proposed.categoryName}
              />
            )}

            {paymentDateChanged && (
              <DiffField
                label={<span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Data de Pagamento</span>}
                originalValue={original.paymentDate}
                proposedValue={proposed.paymentDate}
                renderValue={formatDate}
              />
            )}

            {shouldShowInstallmentSection && (
              <InstallmentSection
                originalInstallmentPlan={originalInstallmentPlan}
                proposedInstallmentPlan={proposedInstallmentPlan}
                original={original}
                proposed={proposed}
                showInstallmentPlan={showInstallmentPlan}
                onToggleInstallmentPlan={() => setShowInstallmentPlan((prev) => !prev)}
              />
            )}

            {paymentMethodChanged && (
              <PaymentMethodComparison
                originalPaymentMethod={originalPaymentMethod}
                proposedPaymentMethod={proposedPaymentMethod}
              />
            )}

            {splitsChanged && <SplitComparison originalSplits={originalSplits} proposedSplits={proposedSplits} />}

            {statusChanged && (
              <DiffField
                label={<span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5" />Status</span>}
                originalValue={original.status}
                proposedValue={proposed.status}
                renderValue={formatStatusLabel}
              />
            )}
          </div>
        )}

        <TransactionActions
          requiresConfirmation={requiresConfirmation}
          status={status}
          onCancel={onCancel}
          handleConfirm={handleConfirm}
          anyChanges={anyChanges}
        />
      </div>
    </div>
  );
}
