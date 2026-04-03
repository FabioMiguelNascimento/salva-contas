"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { formatCurrency, parseAmount } from "@/lib/currency-utils";
import { formatDate } from "@/lib/date-utils";
import type { AiVisualization } from "@/types/ai-advisor";
import { useState } from "react";
import type { VisualizationStatus } from "./types";

interface ConfirmationListVisualizationProps {
  visualization: AiVisualization;
  status: VisualizationStatus;
  onConfirm: (selectedItems: Array<Record<string, any>>) => void;
  onCancel: () => void;
  requiresConfirmation: boolean;
}



function renderConfirmationActions(
  status: VisualizationStatus,
  onConfirm: (selectedItems: Array<Record<string, any>>) => void,
  onCancel: () => void,
  selectedItems: Array<Record<string, any>>,
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
        onClick={() => onConfirm(selectedItems)}
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

export default function ConfirmationListVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: ConfirmationListVisualizationProps) {
  const payload = visualization.payload as any;
  const allItems = payload.items as Array<{
    description?: string;
    amount?: number;
    category?: string;
    createdByName?: string | null;
  }>;
  const proposedTransactions = Array.isArray(payload.proposedTransactions)
    ? (payload.proposedTransactions as Array<Record<string, any>>)
    : [];

  const [deselectedIndices, setDeselectedIndices] = useState<Set<number>>(new Set());

  const selectedItems = allItems.filter((_, idx) => !deselectedIndices.has(idx));
  const selectedTransactions =
    proposedTransactions.length === allItems.length
      ? proposedTransactions.filter((_, idx) => !deselectedIndices.has(idx))
      : selectedItems;
  const total = selectedItems.reduce((sum, item) => sum + parseAmount(item.amount), 0);

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-3">
      <p className="text-xs font-semibold text-gray-600 mb-2">{visualization.title}</p>
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-emerald-50 p-2">
          <p className="text-xs text-emerald-700">Transações</p>
          <p className="font-semibold text-emerald-800">
            {selectedItems.length}
            {deselectedIndices.size > 0 && (
              <span className="ml-1 text-[10px] font-normal text-emerald-600/70">
                / {allItems.length}
              </span>
            )}
          </p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <p className="text-xs text-slate-600">Valor total</p>
          <p className="font-semibold text-slate-800">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto overflow-x-hidden pr-1">
        {allItems.map((item, idx) => {
          const displayDate = (item as any).paymentDate;
          const isSelected = !deselectedIndices.has(idx);

          return (
            <div
              key={`${item.description || "item"}-${idx}`}
              className={`w-full min-w-0 overflow-hidden rounded-md border px-2 py-1.5 transition-colors ${
                isSelected
                  ? "border-slate-100 bg-white"
                  : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex h-full items-center pt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={status !== "idle"}
                    onChange={() => {
                      setDeselectedIndices((prev) => {
                        const next = new Set(prev);
                        if (isSelected) next.add(idx);
                        else next.delete(idx);
                        return next;
                      });
                    }}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-600 disabled:opacity-50"
                  />
                </div>

                <div className="min-w-0 flex-1 flex-col">
                  <div className="flex w-full min-w-0 items-center justify-between gap-2">
                    <p
                      className={`w-0 flex-1 truncate text-xs font-medium ${
                        isSelected ? "text-slate-800" : "text-slate-500 line-through"
                      }`}
                    >
                      {item.description || "Sem descrição"}
                    </p>
                    <p
                      className={`shrink-0 whitespace-nowrap text-sm font-bold ${
                        isSelected ? "text-emerald-700" : "text-slate-400 line-through"
                      }`}
                    >
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <DynamicIcon name={item.category || "tag"} className="h-3 w-3 text-slate-500" />
                      <span className="max-w-[100px] truncate">
                        {item.category || "Sem categoria"}
                      </span>
                    </span>
                    {displayDate ? (
                      <span className="whitespace-nowrap text-slate-500">
                        {formatDate(displayDate)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sem data</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {requiresConfirmation &&
        renderConfirmationActions(
          status,
          onConfirm,
          onCancel,
          selectedTransactions,
        )}
    </div>
  );
}

