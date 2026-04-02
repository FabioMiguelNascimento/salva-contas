"use client";

import { formatCurrency } from "@/lib/currency-utils";
import { formatDate } from "@/lib/date-utils";
import type { AiVisualization } from "@/types/ai-advisor";
import type { VisualizationStatus } from "./types";

interface SingleTransactionSummaryVisualizationProps {
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
) {
  if (status === "confirmed") {
    return (
      <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">
        Transação confirmada com sucesso.
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
        {status === "confirming" ? "Confirmando..." : "Confirmar"}
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

export default function SingleTransactionSummaryVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: SingleTransactionSummaryVisualizationProps) {
  const t = visualization.payload as any;

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{t.description || "Transação"}</p>
          <p className="text-xs text-slate-500">
            {t.categoryName ?? t.category ?? "Sem categoria"}
          </p>
        </div>
        <p className="text-base font-semibold text-emerald-700">{formatCurrency(t.amount)}</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-500">
        {t.paymentDate && (
          <div className="rounded-md bg-slate-50 px-2 py-1">
            <span className="font-medium text-slate-600">Pago:</span> {formatDate(t.paymentDate)}
          </div>
        )}
        {t.dueDate && (
          <div className="rounded-md bg-slate-50 px-2 py-1">
            <span className="font-medium text-slate-600">Vencimento:</span> {formatDate(t.dueDate)}
          </div>
        )}
        {t.createdByName && (
          <div className="rounded-md bg-slate-50 px-2 py-1">
            <span className="font-medium text-slate-600">Criado por:</span> {t.createdByName}
          </div>
        )}
      </div>
      {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
    </div>
  );
}

