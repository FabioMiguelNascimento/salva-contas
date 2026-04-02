"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { FlagIcon } from "@/components/flag-icon";
import { formatCurrency } from "@/lib/currency-utils";
import { formatDate as formatDateUtil } from "@/lib/date-utils";
import type { AiVisualization } from "@/types/ai-advisor";
import type { Transaction } from "@/types/finance";
import { ArrowRight, BadgeCheck, Banknote, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, CreditCard, DollarSign, FileText, FolderOpen, Wallet } from "lucide-react";
import { useState } from "react";
import type { VisualizationStatus } from "./types";
import { Badge } from "@/components/ui/badge";

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
  const normalized = status.toLowerCase();
  switch (normalized) {
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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Cartão de crédito",
  debit: "Cartão de débito",
  pix: "PIX",
  cash: "Dinheiro",
  transfer: "Transferência",
  other: "Outro",
};

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
    .sort((a, b) => {
      const keyA = `${a.paymentMethod}:${a.amount}:${a.creditCardId || ""}:${a.debitCardId || ""}`;
      const keyB = `${b.paymentMethod}:${b.amount}:${b.creditCardId || ""}:${b.debitCardId || ""}`;
      return keyA.localeCompare(keyB);
    });
}

function resolvePaymentMethod(transaction: Record<string, any>) {
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

  const resolvedMethod =
    explicitPaymentMethod ||
    String(singleMethod?.paymentMethod || "").trim().toLowerCase();

  if (resolvedMethod && PAYMENT_METHOD_LABELS[resolvedMethod]) {
    return {
      kind: resolvedMethod,
      label: PAYMENT_METHOD_LABELS[resolvedMethod],
      detail: null,
      flag: resolvedMethod,
      icon: Wallet,
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

interface DiffFieldProps {
  label: React.ReactNode;
  originalValue: any;
  proposedValue: any;
  renderValue?: (value: any) => React.ReactNode;
}

function DiffField({
  label,
  originalValue,
  proposedValue,
  renderValue = (v) => String(v || "—"),
}: DiffFieldProps) {
  const changed = originalValue !== proposedValue;

  return (
    <div className="py-2">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[13px] text-slate-500">Antes</p>
          <p className="text-[18px] font-medium text-slate-700 line-through decoration-1">
            {renderValue(originalValue)}
          </p>
        </div>

        {changed && (
          <>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-[13px] text-slate-500">Depois</p>
              <p className="text-[18px] font-semibold text-slate-900">
                {renderValue(proposedValue)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const formatInstallments = (value: unknown) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 1) {
    return "À vista";
  }

  return `${Math.trunc(parsed)}x`;
};

const formatInstallmentStatus = (value: unknown) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "paid") return "Pago";
  if (normalized === "pending") return "Pendente";
  if (normalized === "overdue") return "Atrasada";
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelada";

  return "Pendente";
};

function normalizeInstallmentPlan(plan: any): Array<{
  installment: number;
  totalInstallments: number;
  amount: number;
  dueDate: string | null;
  status: string;
}> {
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
    .filter(
      (
        item,
      ): item is {
        installment: number;
        totalInstallments: number;
        amount: number;
        dueDate: string | null;
        status: string;
      } => item !== null,
    )
    .sort((a, b) => a.installment - b.installment) as Array<{
    installment: number;
    totalInstallments: number;
    amount: number;
    dueDate: string | null;
    status: string;
  }>;
}

function buildInstallmentSummary(plan: Array<{ totalInstallments: number; amount: number }>) {
  if (!Array.isArray(plan) || plan.length <= 1) {
    return "À vista";
  }

  const totalInstallments = plan[0]?.totalInstallments || plan.length;
  const firstAmount = plan[0]?.amount ?? 0;

  return `${totalInstallments}x de ${formatCurrencyFn(firstAmount)}`;
}

function resolveSplitIconFlag(split: Record<string, any>): string | null {
  return (
    split.creditCardFlag ||
    split.debitCardFlag ||
    (split.paymentMethod ? String(split.paymentMethod).trim().toLowerCase() : null)
  );
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
  const transactionId = payload?.transactionId;
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
    installmentsChanged ||
    originalInstallmentPlan.length > 1 ||
    proposedInstallmentPlan.length > 1;
  const paymentMethodChanged =
    !hasAnySplits &&
    (
      originalPaymentMethod.kind !== proposedPaymentMethod.kind ||
      originalPaymentMethod.label !== proposedPaymentMethod.label ||
      originalPaymentMethod.detail !== proposedPaymentMethod.detail
    );
  const OriginalPaymentMethodIcon = originalPaymentMethod.icon ?? Wallet;
  const ProposedPaymentMethodIcon = proposedPaymentMethod.icon ?? Wallet;
  const OriginalPaymentMethodFlag = originalPaymentMethod.flag;
  const ProposedPaymentMethodFlag = proposedPaymentMethod.flag;

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
      transactionId,
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

  return (
    <div className="mt-3 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {original.categoryIcon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary">
                <DynamicIcon
                  name={original.categoryIcon}
                  className="h-6 w-6 text-white"
                />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold">
                PROPOSTA DE ALTERAÇÃO
              </p>
              <p className="text-[18px] font-bold ">
                {original.description || "Transação"}
              </p>
            </div>
          </div>
          <Badge className="rounded-full px-3 py-1">
            <span className="text-[11px] font-semibold ">
              {anyChanges ? `${[amountChanged, descriptionChanged, categoryChanged, paymentDateChanged, installmentsChanged, creditCardChanged, debitCardChanged, statusChanged, splitsChanged].filter(Boolean).length} alteração${[amountChanged, descriptionChanged, categoryChanged, paymentDateChanged, installmentsChanged, creditCardChanged, debitCardChanged, statusChanged, splitsChanged].filter(Boolean).length > 1 ? "s" : ""}`
                : "Sem alterações"}
            </span>
          </Badge>
        </div>
      </div>

      <div className="p-5">
        {!anyChanges && (
          <div className="py-4 text-center">
            <p className="text-[13px] text-slate-600">
              Nenhuma alteração foi detectada.
            </p>
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
              <div className="border-t border-slate-200 pt-4">
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  <Wallet className="h-3.5 w-3.5" />
                  Parcelas
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[13px] text-slate-500">Antes</p>
                    <p className="text-[18px] font-medium text-slate-700 line-through decoration-1">
                      {buildInstallmentSummary(originalInstallmentPlan.length > 0 ? originalInstallmentPlan : [{ totalInstallments: Number(original.installments ?? 1), amount: Number(original.amount ?? 0) }])}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400" />

                  <div className="flex-1">
                    <p className="text-[13px] text-slate-500">Depois</p>
                    <p className="text-[18px] font-semibold text-slate-900">
                      {buildInstallmentSummary(proposedInstallmentPlan.length > 0 ? proposedInstallmentPlan : [{ totalInstallments: Number(proposed.installments ?? 1), amount: Number(proposed.amount ?? 0) }])}
                    </p>
                  </div>
                </div>

                {proposedInstallmentPlan.length > 1 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowInstallmentPlan((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      {showInstallmentPlan ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {showInstallmentPlan ? "Ocultar parcelas" : "Ver parcelas"}
                    </button>

                    {showInstallmentPlan && (
                      <div className="mt-3 space-y-2">
                        {proposedInstallmentPlan.map((item) => (
                          <div
                            key={`installment-${item.installment}-${item.totalInstallments}`}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[16px] font-semibold text-slate-700">
                                {item.installment}/{item.totalInstallments}
                              </span>
                              <span className="text-[13px] text-slate-600">
                                {item.dueDate ? formatDate(item.dueDate) : "-"}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-[16px] font-semibold text-slate-900">
                                {formatCurrencyFn(item.amount)}
                              </span>
                              <span className="text-[13px] font-semibold text-slate-700">
                                {formatInstallmentStatus(item.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {paymentMethodChanged && (
              <div className="border-t border-slate-200 pt-4">
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  <Wallet className="h-3.5 w-3.5" />
                  Meio de pagamento
                </p>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div>
                    <p className="text-[13px] text-slate-500">Antes</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        {OriginalPaymentMethodFlag ? (
                          <FlagIcon
                            flag={OriginalPaymentMethodFlag as any}
                            className="h-6 w-9 rounded"
                          />
                        ) : (
                          <OriginalPaymentMethodIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-slate-800">{originalPaymentMethod.label}</p>
                        {originalPaymentMethod.detail ? <p className="text-[11px] text-slate-500">{originalPaymentMethod.detail}</p> : null}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="mx-auto h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[13px] text-slate-500">Depois</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                        {ProposedPaymentMethodFlag ? (
                          <FlagIcon
                            flag={ProposedPaymentMethodFlag as any}
                            className="h-6 w-9 rounded"
                          />
                        ) : (
                          <ProposedPaymentMethodIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-[18px] font-semibold text-slate-900">{proposedPaymentMethod.label}</p>
                        {proposedPaymentMethod.detail ? <p className="text-[11px] text-slate-500">{proposedPaymentMethod.detail}</p> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {splitsChanged && (
              <div className="border-t border-slate-200 pt-4">
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  <Wallet className="h-3.5 w-3.5" />
                  Pagamento dividido
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[13px] text-slate-500">Antes</p>
                    <div className="space-y-2">
                      {originalSplits.length === 0 ? (
                        <p className="text-[13px] text-slate-600">Sem divisão de pagamento</p>
                      ) : (
                        originalSplits.map((split, index) => (
                          <div key={`original-split-${index}`} className="flex items-center justify-between gap-2 py-1.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-7 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500">
                                {resolveSplitIconFlag(split) ? (
                                  <FlagIcon
                                    flag={resolveSplitIconFlag(split) as any}
                                    className="h-5 w-8 rounded"
                                  />
                                ) : (
                                  <Wallet className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-slate-800">
                                  {split.creditCardName || split.debitCardName || PAYMENT_METHOD_LABELS[split.paymentMethod] || split.paymentMethod}
                                </p>
                                {(split.creditCardLastFourDigits || split.debitCardLastFourDigits) ? (
                                  <p className="text-[11px] text-slate-500">•••• {split.creditCardLastFourDigits || split.debitCardLastFourDigits}</p>
                                ) : null}
                              </div>
                            </div>
                            <p className="shrink-0 text-[18px] font-medium text-slate-700 line-through decoration-1">{formatCurrencyFn(split.amount)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[13px] text-slate-500">Depois</p>
                    <div className="space-y-2">
                      {proposedSplits.length === 0 ? (
                        <p className="text-[13px] text-slate-600">Sem divisão de pagamento</p>
                      ) : (
                        proposedSplits.map((split, index) => (
                          <div key={`proposed-split-${index}`} className="flex items-center justify-between gap-2 py-1.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-7 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700">
                                {resolveSplitIconFlag(split) ? (
                                  <FlagIcon
                                    flag={resolveSplitIconFlag(split) as any}
                                    className="h-5 w-8 rounded"
                                  />
                                ) : (
                                  <Wallet className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[18px] font-semibold text-slate-900">
                                  {split.creditCardName || split.debitCardName || PAYMENT_METHOD_LABELS[split.paymentMethod] || split.paymentMethod}
                                </p>
                                {(split.creditCardLastFourDigits || split.debitCardLastFourDigits) ? (
                                  <p className="text-[11px] text-slate-500">•••• {split.creditCardLastFourDigits || split.debitCardLastFourDigits}</p>
                                ) : null}
                              </div>
                            </div>
                            <p className="shrink-0 text-[18px] font-semibold text-slate-900">{formatCurrencyFn(split.amount)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {statusChanged && (
              <DiffField
                label={<span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5" />Status</span>}
                originalValue={original.status}
                proposedValue={proposed.status}
                renderValue={formatStatusLabel}
              />
            )}

            {creditCardChanged && (
              <div className="border-t border-slate-200 pt-4">
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  Cartão de Crédito
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[13px] text-slate-500">Antes</p>
                    <p className="text-[14px] font-medium text-slate-800">
                      {original.creditCardName || "Nenhum"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-[13px] text-slate-500">Depois</p>
                    <p className="text-[18px] font-semibold text-slate-900">
                      {proposed.creditCardName || "Nenhum"}
                    </p>
                  </div>
                </div>
                {(original.creditCardFlag || proposed.creditCardFlag) && (
                  <div className="mt-2 flex gap-2">
                    {original.creditCardFlag && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Antes:</span>
                        <FlagIcon
                          flag={original.creditCardFlag as any}
                          className="h-6 w-8 rounded border border-slate-200"
                        />
                      </div>
                    )}
                    {proposed.creditCardFlag && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Depois:</span>
                        <FlagIcon
                          flag={proposed.creditCardFlag as any}
                          className="h-6 w-8 rounded border border-emerald-300 bg-emerald-50"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {debitCardChanged && (
              <div className="border-t border-slate-200 pt-4">
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  Cartão de Débito
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[13px] text-slate-500">Antes</p>
                    <p className="text-[14px] font-medium text-slate-800">
                      {original.debitCardName || "Nenhum"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-[13px] text-slate-500">Depois</p>
                    <p className="text-[18px] font-semibold text-slate-900">
                      {proposed.debitCardName || "Nenhum"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {requiresConfirmation && (
          <div className="mt-4 flex flex-wrap gap-2">
            {status === "confirmed" ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                Alteração confirmada com sucesso!
              </div>
            ) : status === "cancelled" ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                Alteração cancelada. Nenhuma mudança será realizada.
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={status === "confirming" || !anyChanges}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  {status === "confirming" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirmar Alteração
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

