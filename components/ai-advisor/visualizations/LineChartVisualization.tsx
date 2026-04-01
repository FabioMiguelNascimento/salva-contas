"use client";

import { formatCurrency, parseAmount } from "@/lib/currency-utils";
import type { AiVisualization } from "@/types/finance";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VisualizationStatus } from "./types";

interface LineChartVisualizationProps {
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

export default function LineChartVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: LineChartVisualizationProps) {
  type PointLike = { date?: string; total?: number | string; amount?: number | string };
  const rawPoints = Array.isArray((visualization.payload as any).points)
    ? ((visualization.payload as any).points as PointLike[])
    : Array.isArray((visualization.payload as any).items)
    ? ((visualization.payload as any).items as PointLike[])
    : ([] as PointLike[]);

  const points = rawPoints.map((point) => ({
    date: point.date ?? "",
    total: parseAmount(point.total ?? point.amount),
  }));

  const total = points.reduce((sum, point) => sum + point.total, 0);
  const peak = points.reduce((max, point) => Math.max(max, point.total), 0);

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-3">
      <p className="mb-2 text-xs font-semibold text-gray-600">{visualization.title}</p>

      <div className="h-60 w-full mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-emerald-50 p-2">
          <p className="text-xs text-emerald-700">Período</p>
          <p className="font-semibold text-emerald-800">{points.length} dias</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <p className="text-xs text-slate-600">Total no período</p>
          <p className="font-semibold text-slate-800">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2">
          <p className="text-xs text-rose-700">Pico diário</p>
          <p className="font-semibold text-rose-800">{formatCurrency(peak)}</p>
        </div>
      </div>

      {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
    </div>
  );
}


