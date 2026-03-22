"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import type { AiVisualization } from "@/types/finance";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export type VisualizationStatus = "idle" | "confirming" | "confirmed" | "cancelled";

interface AiAdvisorVisualizationRendererProps {
  visualization: AiVisualization;
  status: VisualizationStatus;
  onConfirmVisualization: (payload: any) => Promise<void>;
  onCancelVisualization: () => void;
}

function renderConfirmationActions(
  status: VisualizationStatus,
  onConfirmVisualization: () => void,
  onCancelVisualization: () => void,
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
      <Button size="sm" variant="secondary" onClick={onConfirmVisualization} disabled={status === "confirming"}>
        {status === "confirming" ? "Confirmando..." : "Confirmar"}
      </Button>
      <Button size="sm" variant="outline" onClick={onCancelVisualization}>
        Cancelar
      </Button>
    </div>
  );
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return null;
  try {
    let date: Date;
    if (typeof value === "string") {
      date = parseISO(value);
    } else if (value instanceof Date) {
      date = value;
    } else {
      return String(value);
    }
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return String(value);
  }
};

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

const formatCurrency = (value: unknown): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseAmount(value));
};

export default function AiAdvisorVisualizationRenderer({
  visualization,
  status,
  onConfirmVisualization,
  onCancelVisualization,
}: AiAdvisorVisualizationRendererProps) {
  const payload = visualization.payload || {};
  const requiresConfirmation = Boolean((payload as any).requiresConfirmation);
  const [deselectedIndices, setDeselectedIndices] = useState<Set<number>>(new Set());

  const confirmData = () => {
    const proposedTransactions = Array.isArray((payload as any).proposedTransactions)
      ? (payload as any).proposedTransactions
      : null;

    if (proposedTransactions) {
      return proposedTransactions.filter((_: any, idx: number) => !deselectedIndices.has(idx));
    }

    if (payload && typeof payload === "object") {
      const { requiresConfirmation: _req, proposedTransactions: _prop, ...rest } = payload as any;
      return [rest];
    }

    return [];
  };

  const onConfirm = async () => {
    if (!requiresConfirmation || status === "confirming" || status === "confirmed") return;
    await onConfirmVisualization(confirmData());
  };

  const onCancel = () => {
    if (!requiresConfirmation || status === "confirmed") return;
    onCancelVisualization();
  };

  if (visualization.type === "transaction") {
    const transaction = payload as any;
    return (
      <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex flex-1 flex-col">
            <p className="text-sm font-semibold text-slate-900 truncate w-0 flex-1">{transaction.description || "Transação registrada"}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-2 whitespace-nowrap">
                {transaction.categoryIcon ? (
                  <DynamicIcon name={transaction.categoryIcon} className="h-4 w-4 text-slate-500" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                )}
                <span className="truncate">{transaction.categoryName ?? transaction.category ?? "Sem categoria"}</span>
              </span>
              {transaction.createdByName ? (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Criado por {transaction.createdByName}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-base font-semibold text-emerald-700">{formatCurrency(transaction.amount)}</p>
              <p className="text-xs text-slate-500">{transaction.status === "paid" ? "Liquidado" : "Pendente"}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-500">
          {transaction.paymentDate && (
            <div className="rounded-md bg-slate-50 px-2 py-1">
              <span className="font-medium text-slate-600">Pago:</span> {formatDate(transaction.paymentDate)}
            </div>
          )}
          {transaction.dueDate && (
            <div className="rounded-md bg-slate-50 px-2 py-1">
              <span className="font-medium text-slate-600">Vencimento:</span> {formatDate(transaction.dueDate)}
            </div>
          )}
          <div className="rounded-md bg-slate-50 px-2 py-1">
            <span className="font-medium text-slate-600">Tipo:</span> {transaction.type === "income" ? "Receita" : "Despesa"}
          </div>
        </div>
        {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
      </div>
    );
  }

  if (visualization.type === "chart_line") {
    const points = Array.isArray((payload as any).points)
      ? ((payload as any).points as Array<{ date?: string; total?: number | string }>)
      : [];

    const total = points.reduce((sum, point) => sum + parseAmount(point.total), 0);
    const peak = points.reduce((max, point) => Math.max(max, parseAmount(point.total)), 0);

    return (
      <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-3">
        <p className="mb-2 text-xs font-semibold text-gray-600">{visualization.title}</p>
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <p className="text-xs text-emerald-700">Periodo</p>
            <p className="font-semibold text-emerald-800">{points.length} dias</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2">
            <p className="text-xs text-slate-600">Total no periodo</p>
            <p className="font-semibold text-slate-800">{formatCurrency(total)}</p>
          </div>
          <div className="rounded-lg bg-rose-50 p-2">
            <p className="text-xs text-rose-700">Pico diario</p>
            <p className="font-semibold text-rose-800">{formatCurrency(peak)}</p>
          </div>
        </div>

        {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
      </div>
    );
  }

  if (
    visualization.type === "table_summary" &&
    visualization.payload &&
    typeof visualization.payload === "object" &&
    "description" in visualization.payload &&
    "amount" in visualization.payload
  ) {
    const t = visualization.payload as any;

    const items = Array.isArray(payload.items) ? payload.items as any[] : [];

    return (
      <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{t.description || "Transação"}</p>
            <p className="text-xs text-slate-500">{t.categoryName ?? t.category ?? "Sem categoria"}</p>
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

  if (Array.isArray(payload.items)) {
    const allItems = payload.items as Array<{ description?: string; amount?: number; category?: string; createdByName?: string | null }>;
    const selectedItems = allItems.filter((_, idx) => !deselectedIndices.has(idx));
    const total = selectedItems.reduce((sum, item) => sum + parseAmount(item.amount), 0);

    return (
      <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">{visualization.title}</p>
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <p className="text-xs text-emerald-700">Transações</p>
            <p className="font-semibold text-emerald-800">
              {selectedItems.length}
              {deselectedIndices.size > 0 && <span className="ml-1 text-[10px] font-normal text-emerald-600/70">/ {allItems.length}</span>}
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
                  isSelected ? "border-slate-100 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
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
                    <p className={`w-0 flex-1 truncate text-xs font-medium ${isSelected ? "text-slate-800" : "text-slate-500 line-through"}`}>
                      {item.description || "Sem descricao"}
                    </p>
                    <p className={`shrink-0 whitespace-nowrap text-sm font-bold ${isSelected ? "text-emerald-700" : "text-slate-400 line-through"}`}>
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <DynamicIcon name={item.category || "tag"} className="h-3 w-3 text-slate-500" />
                      <span className="max-w-[100px] truncate">{item.category || "Sem categoria"}</span>
                    </span>
                    {displayDate ? (
                      <span className="whitespace-nowrap text-slate-500">{formatDate(displayDate)}</span>
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

        {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
      </div>
    );
  }

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-3">
      <p className="text-xs font-semibold text-gray-600 mb-2">{visualization.title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-emerald-50 p-2">
          <p className="text-xs text-emerald-700">Receitas</p>
          <p className="font-semibold text-emerald-800">{formatCurrency((payload as any).totalIncome)}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2">
          <p className="text-xs text-rose-700">Despesas</p>
          <p className="font-semibold text-rose-800">{formatCurrency((payload as any).totalExpenses)}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <p className="text-xs text-slate-600">Saldo</p>
          <p className="font-semibold text-slate-800">{formatCurrency((payload as any).balance)}</p>
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
            {payload.attachmentOriginalName || 'Abrir anexo'}
          </a>
        </div>
      )}
      {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
    </div>
  );
}
