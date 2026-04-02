"use client";

import { formatCurrency } from "@/lib/currency-utils";
import type { AiVisualization } from "@/types/ai-advisor";
import type { VisualizationStatus } from "./types";

interface SummaryVisualizationProps {
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

export default function SummaryVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: SummaryVisualizationProps) {
  const payload = visualization.payload as any;

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-3">
      <p className="text-xs font-semibold text-gray-600 mb-2">{visualization.title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-emerald-50 p-2">
          <p className="text-xs text-emerald-700">Receitas</p>
          <p className="font-semibold text-emerald-800">{formatCurrency(payload.totalIncome)}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2">
          <p className="text-xs text-rose-700">Despesas</p>
          <p className="font-semibold text-rose-800">{formatCurrency(payload.totalExpenses)}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <p className="text-xs text-slate-600">Saldo</p>
          <p className="font-semibold text-slate-800">{formatCurrency(payload.balance)}</p>
        </div>
      </div>
      {payload.attachmentUrl && (
        <div className="mt-3 rounded-lg border border-dashed border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-semibold text-emerald-700 mb-1">Anexo disponível</p>
          <a
            href={payload.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            {payload.attachmentOriginalName || "Abrir anexo"}
          </a>
        </div>
      )}
      {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
    </div>
  );
}

