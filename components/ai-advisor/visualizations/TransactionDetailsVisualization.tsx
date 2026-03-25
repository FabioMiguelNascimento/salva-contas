"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import type { AiVisualization } from "@/types/finance";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { VisualizationStatus } from "./types";

interface TransactionDetailsVisualizationProps {
  visualization: AiVisualization;
  status: VisualizationStatus;
  onConfirm: () => void;
  onCancel: () => void;
  requiresConfirmation: boolean;
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

const formatStatusLabel = (status?: string | null): string => {
  if (!status) return "";

  const normalized = String(status).toLowerCase().trim();

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
    case "received":
      return "Recebido";
    default:
      return status;
  }
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

export default function TransactionDetailsVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: TransactionDetailsVisualizationProps) {
  const payload = visualization.payload as any;
  const items = payload.items as Array<{
    id?: string;
    description?: string;
    amount?: number | string;
    type?: "income" | "expense";
    category?: string;
    status?: string;
    paymentDate?: string | null;
    dueDate?: string | null;
  }>;

  const totalTransactions = Number(payload.totalTransactions || items.length || 0);
  const totalAmount =
    typeof payload.totalAmount === "number"
      ? Number(payload.totalAmount)
      : items.reduce((sum, item) => sum + parseAmount(item.amount), 0);

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-3">
      <p className="mb-2 text-xs font-semibold text-gray-600">{visualization.title}</p>
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-emerald-50 p-2">
          <p className="text-xs text-emerald-700">Transações encontradas</p>
          <p className="font-semibold text-emerald-800">{totalTransactions}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2 sm:col-span-2">
          <p className="text-xs text-slate-600">Valor total encontrado</p>
          <p className="font-semibold text-slate-800">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="max-h-56 space-y-1 overflow-y-auto overflow-x-hidden pr-1">
          {items.map((item, idx) => (
            <div
              key={`${item.id || item.description || "transaction"}-${idx}`}
              className="w-full min-w-0 overflow-hidden rounded-md border border-slate-100 bg-white px-2 py-1.5"
            >
              <div className="flex w-full min-w-0 items-center justify-between gap-2">
                <p className="w-0 flex-1 truncate text-xs font-medium text-slate-800">
                  {item.description || "Sem descrição"}
                </p>
                <p
                  className={`shrink-0 whitespace-nowrap text-sm font-bold ${
                    item.type === "income" ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {item.type === "income" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </p>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <DynamicIcon name={item.category || "tag"} className="h-3 w-3 text-slate-500" />
                  <span className="max-w-[120px] truncate">
                    {item.category || "Sem categoria"}
                  </span>
                </span>
                {item.paymentDate ? (
                  <span className="whitespace-nowrap text-slate-500">
                    Pago: {formatDate(item.paymentDate)}
                  </span>
                ) : item.dueDate ? (
                  <span className="whitespace-nowrap text-slate-500">
                    Vence: {formatDate(item.dueDate)}
                  </span>
                ) : null}
                {item.status ? (
                  <span className="whitespace-nowrap text-slate-400">
                    {formatStatusLabel(item.status)}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Nenhuma transação encontrada para este termo.
        </div>
      )}

      {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
    </div>
  );
}

