"use client";

import CategoryDonut from "@/components/category-donut";
import type { AiVisualization } from "@/types/finance";
import type { VisualizationStatus } from "./types";

interface DonutChartVisualizationProps {
  visualization: AiVisualization;
  status: VisualizationStatus;
  onConfirm: () => void;
  onCancel: () => void;
  requiresConfirmation: boolean;
}

const parseAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .replace(/\s/g, "")
      .replace(/R\$/gi, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(/,/g, ".");

    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

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

export default function DonutChartVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: DonutChartVisualizationProps) {
  const items = Array.isArray((visualization.payload as any).items)
    ? ((visualization.payload as any).items as Array<{ category?: string; total?: number | string }>)
    : [];

  const donutData = items.map((item) => ({
    category: item.category || "Sem categoria",
    total: parseAmount(item.total),
  }));

  const total = items.reduce((sum, item) => sum + parseAmount(item.total), 0);

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl bg-white p-3">
      <p className="mb-2 text-xs font-semibold text-gray-600">{visualization.title}</p>
      <div className="mb-3 flex items-center justify-center rounded-lg bg-slate-50/60 p-2">
        <CategoryDonut data={donutData} total={total} />
      </div>
      {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
    </div>
  );
}