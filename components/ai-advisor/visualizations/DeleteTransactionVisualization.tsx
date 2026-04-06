"use client";

import { formatCurrency } from "@/lib/currency-utils";
import { formatDate } from "@/lib/date-utils";
import type { AiVisualization } from "@/types/ai-advisor";
import type { VisualizationStatus } from "./types";
import { Badge } from "@/components/ui/badge";

interface DeleteTransactionVisualizationProps {
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
      <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
        Transação deletada com sucesso.
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-2 text-sm text-gray-600">
        Operação de deleção cancelada.
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onConfirm}
        disabled={status === "confirming"}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {status === "confirming" ? "Deletando..." : "Deletar transação"}
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

export default function DeleteTransactionVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: DeleteTransactionVisualizationProps) {
  const t = visualization.payload as any;

  if (t.success && t.deletedTransaction) {
    return (
      <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
        <p className="text-sm font-semibold text-rose-700">Transação deletada</p>
        <p className="text-xs text-rose-600">
          {t.deletedTransaction.description} — {formatCurrency(t.deletedTransaction.amount)}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-rose-600 mb-2">
        Deletar transação
      </p>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{t.description || "Transação"}</p>
          <p className="text-xs text-slate-500">
            {t.categoryName ?? t.category ?? "Sem categoria"}
          </p>
        </div>
        <p className="text-base font-semibold text-rose-700">{formatCurrency(t.amount)}</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500">
        {t.paymentDate && (
          <Badge variant={"outline"} className="rounded-md bg-rose-100/50 px-2 py-1">
            <span className="font-medium text-slate-600">Pago:</span> {formatDate(t.paymentDate)}
          </Badge>
        )}
        {t.dueDate && (
          <Badge variant={"outline"} className="rounded-md bg-rose-100/50 px-2 py-1">
            <span className="font-medium text-slate-600">Vencimento:</span> {formatDate(t.dueDate)}
          </Badge>
        )}
      </div>

      {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
    </div>
  );
}
