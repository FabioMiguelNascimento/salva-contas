import { ArrowRight, ChevronDown, ChevronUp, Wallet } from "lucide-react";
import { buildInstallmentSummary, formatCurrencyFn, formatDate, formatInstallmentStatus } from "./helpers";
import type { InstallmentPlanItem } from "./types";

export function InstallmentSection({
  originalInstallmentPlan,
  proposedInstallmentPlan,
  original,
  proposed,
  showInstallmentPlan,
  onToggleInstallmentPlan,
}: {
  originalInstallmentPlan: InstallmentPlanItem[];
  proposedInstallmentPlan: InstallmentPlanItem[];
  original: Record<string, any>;
  proposed: Record<string, any>;
  showInstallmentPlan: boolean;
  onToggleInstallmentPlan: () => void;
}) {
  return (
    <div className="border-t border-slate-200 pt-4">
      <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        <Wallet className="h-3.5 w-3.5" />
        Parcelas
      </p>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[13px] text-slate-500">Antes</p>
          <p className="text-[18px] font-medium text-slate-700 line-through decoration-1">
            {buildInstallmentSummary(originalInstallmentPlan, Number(original.amount ?? 0), Number(original.installments ?? 1))}
          </p>
        </div>

        <ArrowRight className="h-4 w-4 text-slate-400" />

        <div className="flex-1">
          <p className="text-[13px] text-slate-500">Depois</p>
          <p className="text-[18px] font-semibold text-slate-900">
            {buildInstallmentSummary(proposedInstallmentPlan, Number(proposed.amount ?? 0), Number(proposed.installments ?? 1))}
          </p>
        </div>
      </div>

      {proposedInstallmentPlan.length > 1 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onToggleInstallmentPlan}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            {showInstallmentPlan ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showInstallmentPlan ? "Ocultar parcelas" : "Ver parcelas"}
          </button>

          {showInstallmentPlan && (
            <div className="mt-3 space-y-2">
              {proposedInstallmentPlan.map((item) => (
                <div key={`installment-${item.installment}-${item.totalInstallments}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[16px] font-semibold text-slate-700">{item.installment}/{item.totalInstallments}</span>
                    <span className="text-[13px] text-slate-600">{item.dueDate ? formatDate(item.dueDate) : "-"}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[16px] font-semibold text-slate-900">{formatCurrencyFn(item.amount)}</span>
                    <span className="text-[13px] font-semibold text-slate-700">{formatInstallmentStatus(item.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
