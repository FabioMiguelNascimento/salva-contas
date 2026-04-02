import { formatCurrency } from "@/lib/currency-utils";
import { formatDate as formatDateUtil } from "@/lib/date-utils";
import { getTransactionStatusLabel } from "@/lib/utils";
import type { InstallmentPlanItem } from "./types";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Cartão de crédito",
  debit: "Cartão de débito",
  pix: "PIX",
  cash: "Dinheiro",
  transfer: "Transferência",
  other: "Outro",
};

export const formatDate = (value?: string | Date | null) => {
  if (!value) return null;
  return formatDateUtil(value);
};

export const formatCurrencyFn = (value: unknown): string => {
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return "R$ 0,00";
  return formatCurrency(amount);
};

export const formatInstallmentStatus = (value: unknown) => {
  const baseLabel = getTransactionStatusLabel(String(value || "pending"));

  if (baseLabel === "Atrasado") return "Atrasada";
  if (baseLabel === "Cancelado") return "Cancelada";

  return baseLabel;
};

export function paymentMethodTitle(paymentMethod: string) {
  return PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod;
}

export function buildInstallmentSummary(
  plan: InstallmentPlanItem[],
  fallbackAmount: number,
  fallbackInstallments: number,
) {
  const effectivePlan =
    plan.length > 0
      ? plan
      : [
          {
            installment: 1,
            totalInstallments: fallbackInstallments,
            amount: fallbackAmount,
            dueDate: null,
            status: "pending",
          },
        ];

  if (effectivePlan.length <= 1 || effectivePlan[0].totalInstallments <= 1) {
    return "À vista";
  }

  return `${effectivePlan[0].totalInstallments}x de ${formatCurrencyFn(effectivePlan[0].amount)}`;
}

export function resolveSplitIconFlag(split: Record<string, any>): string | null {
  return (
    split.creditCardFlag ||
    split.debitCardFlag ||
    (split.paymentMethod ? String(split.paymentMethod).trim().toLowerCase() : null)
  );
}
