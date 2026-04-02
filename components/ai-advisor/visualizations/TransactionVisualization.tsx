"use client";

import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { DynamicIcon } from "@/components/dynamic-icon";
import { formatCurrency } from "@/lib/currency-utils";
import { formatDate as formatDateUtil } from "@/lib/date-utils";
import type { AiVisualization } from "@/types/ai-advisor";
import type { CreditCardFlag, PaymentMethod, TransactionDetailsPayload } from "@/types/finance";
import { PAYMENT_METHOD_LABELS } from "@/types/finance";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { VisualizationStatus } from "./types";

interface TransactionVisualizationProps {
  visualization: AiVisualization;
  status: VisualizationStatus;
  onConfirm: () => void;
  onCancel: () => void;
  requiresConfirmation: boolean;
}



function renderConfirmationActions(
  status: VisualizationStatus,
  onConfirm: () => void,
  onCancel: () => void,
  confirmLabel: string,
  confirmedLabel: string,
) {
  if (status === "confirmed") {
    return (
      <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">
        {confirmedLabel}
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
        Transação cancelada. A ação não será realizada.
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onConfirm}
        disabled={status === "confirming"}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {status === "confirming" ? "Confirmando..." : confirmLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Cancelar
      </button>
    </div>
  );
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

const paymentMethodLabel = (
  method: PaymentMethod,
  creditCardFlag?: CreditCardFlag | null,
  debitCardFlag?: CreditCardFlag | null,
): string => {
  if (creditCardFlag) {
    return creditCardFlag.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (debitCardFlag) {
    return debitCardFlag.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return PAYMENT_METHOD_LABELS[method] ?? method.replace(/_/g, " ");
};

export default function TransactionVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: TransactionVisualizationProps) {
  const transaction = visualization.payload as TransactionDetailsPayload;
  const isExpense = transaction.type === "expense";
  const headerBg = isExpense ? "bg-rose-600" : "bg-emerald-600";

  const paymentMethods = transaction.paymentMethods ?? [];
  const hasMultipleMethods = paymentMethods.length > 1;
  const isUpdateTransaction = visualization.toolName === "update_transaction";
  const confirmLabel = isUpdateTransaction ? "Confirmar Alteração" : "Confirmar";
  const confirmedLabel = isUpdateTransaction
    ? "Alteração confirmada com sucesso."
    : "Transação confirmada com sucesso.";

  return (
    <div className="mt-3 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`${headerBg} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
              {transaction.categoryRel?.icon ? (
                <DynamicIcon name={transaction.categoryRel.icon} className="h-6 w-6 text-white" />
              ) : (
                <span className="inline-block h-6 w-6 rounded-md bg-white/30" />
              )}
            </div>
            <div>
              <p className="text-xs text-white/80">
                {transaction.categoryName ?? transaction.category ?? "Sem categoria"}
              </p>
              <p className="text-[28px] font-bold leading-tight tracking-tight text-white">
                {formatCurrencyFn(transaction.amount)}
              </p>
              <p className="text-sm text-white/80">
                {transaction.description ?? "Sem descrição"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="shrink-0 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              {formatStatusLabel(transaction.status)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-white">
              {transaction.type === "expense" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              {transaction.type === "expense" ? "Saida" : "Entrada"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="mb-1 text-[11px] text-slate-400">Data de pagamento</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-slate-800">
                {formatDate(transaction.paymentDate) ?? "—"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="mb-1 text-[11px] text-slate-400">Criado em</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-slate-800">
                {formatDate(transaction.createdAt) ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {(paymentMethods.length > 0 || (transaction.splits?.length ?? 0) > 0) && (
          <>
            <div className="my-4 h-px bg-slate-100" />

            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Meios de pagamento
            </p>

            {hasMultipleMethods && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700">
                Pagamento dividido em {paymentMethods.length}
              </div>
            )}

            <div className="space-y-2">
              {paymentMethods.map((method, index) => {
                const matchingSplit = transaction.splits?.find((s) => s.id === method.id);
                const resolvedCardFlag =
                  method.creditCard?.flag ||
                  method.debitCard?.flag ||
                  matchingSplit?.creditCard?.flag ||
                  matchingSplit?.debitCard?.flag ||
                  (method.paymentMethod === 'credit_card' ? transaction.creditCard?.flag : undefined) ||
                  (method.paymentMethod === 'debit' ? transaction.debitCard?.flag : undefined);

                const showCardIcon = Boolean(resolvedCardFlag);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      {showCardIcon ? (
                        <CardFlagIcon
                          flag={resolvedCardFlag as any}
                          className="h-7 w-10 rounded-md border border-slate-200 bg-white"
                        />
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                          {method.paymentMethod.replace("_", " ")}
                        </span>
                      )}
                      <div>
                        <p className="text-[13px] font-medium text-slate-800">
                          {paymentMethodLabel(
                            method.paymentMethod,
                            resolvedCardFlag as any,
                            undefined,
                          )}
                        </p>
                        {(method.creditCard?.lastFourDigits || method.debitCard?.lastFourDigits || matchingSplit?.creditCard?.lastFourDigits || matchingSplit?.debitCard?.lastFourDigits) && (
                          <p className="text-[11px] text-slate-400">
                            {`•••• ${
                              method.creditCard?.lastFourDigits ||
                              method.debitCard?.lastFourDigits ||
                              matchingSplit?.creditCard?.lastFourDigits ||
                              matchingSplit?.debitCard?.lastFourDigits ||
                              ''
                            }`}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-[14px] font-semibold text-slate-800">
                      {formatCurrencyFn(method.amount)}
                    </p>
                  </div>
                );
              })}

              {transaction.splits && transaction.splits.length > 0 && paymentMethods.length === 0 && (
                <p className="text-xs text-slate-500">
                  Pagamento dividido em {transaction.splits.length}x
                </p>
              )}
            </div>
          </>
        )}

        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="text-[12px] text-slate-400">Criado por</span>
          <span className="text-[12px] font-medium text-slate-600">
            {transaction.createdByName ?? "Desconhecido"}
          </span>
        </div>

        {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel, confirmLabel, confirmedLabel)}
      </div>
    </div>
  );
}