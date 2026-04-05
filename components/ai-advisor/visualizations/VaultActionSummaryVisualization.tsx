"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { formatCurrency } from "@/lib/currency-utils";
import type { AiVisualization } from "@/types/ai-advisor";
import { VisualizationStatus } from "./types";

interface VaultActionSummaryVisualizationProps {
  visualization: AiVisualization;
  status: VisualizationStatus;
  onConfirm: () => void;
  onCancel: () => void;
  requiresConfirmation: boolean;
}

export default function VaultActionSummaryVisualization({
  visualization,
  status,
  onConfirm,
  onCancel,
  requiresConfirmation,
}: VaultActionSummaryVisualizationProps) {
  const payload = visualization.payload as {
    id?: string;
    name?: string;
    currentAmount?: number;
    targetAmount?: number | null;
    color?: string | null;
    icon?: string | null;
    addedAmount?: number;
    actionType?: 'deposit' | 'withdraw' | 'yield';
    actionAmount?: number;
    items?: Array<{
      vault?: string;
      action?: 'deposit' | 'withdraw' | 'yield';
      amount?: number | string;
      balance?: number | string;
    }>;
  };

  const firstItem = Array.isArray(payload.items) && payload.items.length > 0
    ? payload.items[0]
    : null;

  const actionType = firstItem?.action ?? payload.actionType;
  const vaultName = firstItem?.vault ?? payload.name;
  const currentAmount = Number(firstItem?.balance ?? payload.currentAmount ?? 0);
  const targetAmount = Number(payload.targetAmount ?? 0);
  const actionAmount = Number(
    firstItem?.amount ?? payload.actionAmount ?? payload.addedAmount ?? 0,
  );

  const missingAmount = targetAmount > 0 ? Math.max(0, targetAmount - currentAmount) : 0;
  const isDeposit = actionType === 'deposit' || actionType === 'yield';
  const hasTarget = targetAmount > 0;
  const actionLabel = actionType === 'withdraw' ? 'Resgatado' : 'Adicionado';
  const actionDisplay = Math.abs(actionAmount);

  return (
    <div className="mt-3 w-full min-w-0 overflow-hidden rounded-2xl border border-emerald-900/30 bg-emerald-950/80 p-4 shadow-lg">
      <div className="mb-4 flex items-start gap-3">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl text-white"
          style={{ backgroundColor: payload.color ?? '#047857' }}
        >
          <DynamicIcon name={payload.icon ?? 'piggy-bank'} className="text-2xl" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-emerald-300/90">Meta</p>
          <p className="text-2xl font-bold text-white">{vaultName ?? 'Cofrinho'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-800 bg-emerald-900/60 p-3">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-300">{actionLabel}</p>
        <p className="mt-1 text-3xl font-extrabold text-emerald-300">
          {isDeposit ? '+' : '-'} {formatCurrency(actionDisplay)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-emerald-800 bg-emerald-900/60 p-3">
          <p className="text-xs text-emerald-300">Já acumulado</p>
          <p className="text-xl font-bold text-white">{formatCurrency(currentAmount)}</p>
        </div>
        {hasTarget ? (
          <div className="rounded-lg border border-emerald-800 bg-emerald-900/60 p-3">
            <p className="text-xs text-emerald-300">Meta total</p>
            <p className="text-xl font-bold text-white">{formatCurrency(targetAmount)}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-800 bg-emerald-900/60 p-3">
            <p className="text-xs text-emerald-300">Objetivo</p>
            <p className="text-base font-semibold text-white">Sem meta definida</p>
          </div>
        )}
      </div>

      {hasTarget && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-800 bg-emerald-900/60 p-3">
          <p className="text-sm font-medium text-emerald-300">Falta</p>
          <p className="text-lg font-bold text-white">{formatCurrency(missingAmount)}</p>
        </div>
      )}

      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-300"
          style={{ width: `${Math.min(100, hasTarget ? (currentAmount / targetAmount) * 100 : 0)}%` }}
        />
      </div>

      <p className="mt-1 text-xs text-emerald-200">
        {hasTarget
          ? `${Math.min(100, (currentAmount / targetAmount) * 100).toFixed(0)}% Concluido`
          : 'Sem meta definida'}
      </p>

      {requiresConfirmation && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={status === 'confirming'}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'confirming' ? 'Confirmando...' : 'Confirmar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-lg border border-emerald-300 bg-transparent px-4 py-2 font-medium text-emerald-200 hover:border-emerald-100 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

