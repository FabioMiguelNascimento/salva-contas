"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import type { AiVisualization } from "@/types/finance";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { VisualizationStatus } from "./types";

interface TransactionVisualizationProps {
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

export default function TransactionVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: TransactionVisualizationProps) {
  const transaction = visualization.payload as any;

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex flex-1 flex-col">
          <p className="text-sm font-semibold text-slate-900 truncate w-0 flex-1">
            {transaction.description || "Transação registrada"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-2 whitespace-nowrap">
              {transaction.categoryIcon ? (
                <DynamicIcon name={transaction.categoryIcon} className="h-4 w-4 text-slate-500" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              )}
              <span className="truncate">
                {transaction.categoryName ?? transaction.category ?? "Sem categoria"}
              </span>
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
            <p className="text-base font-semibold text-emerald-700">
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-xs text-slate-500">{formatStatusLabel(transaction.status)}</p>
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
          <span className="font-medium text-slate-600">Tipo:</span>{" "}
          {transaction.type === "income" ? "Receita" : "Despesa"}
        </div>
      </div>
      {requiresConfirmation && renderConfirmationActions(status, onConfirm, onCancel)}
    </div>
  );
}