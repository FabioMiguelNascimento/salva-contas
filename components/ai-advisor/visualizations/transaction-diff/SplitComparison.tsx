import { FlagIcon } from "@/components/flag-icon";
import { Wallet } from "lucide-react";
import { formatCurrencyFn, paymentMethodTitle, resolveSplitIconFlag } from "./helpers";

function SplitLine({ split, variant }: { split: Record<string, any>; variant: "original" | "proposed" }) {
  const isOriginal = variant === "original";
  const label = split.creditCardName || split.debitCardName || paymentMethodTitle(split.paymentMethod) || split.paymentMethod;

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <div className={isOriginal ? "flex h-7 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500" : "flex h-7 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700"}>
          {resolveSplitIconFlag(split) ? (
            <FlagIcon flag={resolveSplitIconFlag(split) as any} className="h-5 w-8 rounded" />
          ) : (
            <Wallet className="h-3.5 w-3.5" />
          )}
        </div>
        <div className="min-w-0">
          <p className={isOriginal ? "truncate text-[13px] font-medium text-slate-800" : "truncate text-[18px] font-semibold text-slate-900"}>
            {label}
          </p>
          {(split.creditCardLastFourDigits || split.debitCardLastFourDigits) ? (
            <p className="text-[11px] text-slate-500">•••• {split.creditCardLastFourDigits || split.debitCardLastFourDigits}</p>
          ) : null}
        </div>
      </div>
      <p className={isOriginal ? "shrink-0 text-[18px] font-medium text-slate-700 line-through decoration-1" : "shrink-0 text-[18px] font-semibold text-slate-900"}>
        {formatCurrencyFn(split.amount)}
      </p>
    </div>
  );
}

export function SplitComparison({
  originalSplits,
  proposedSplits,
}: {
  originalSplits: Array<Record<string, any>>;
  proposedSplits: Array<Record<string, any>>;
}) {
  return (
    <div className="border-t border-slate-200 pt-4">
      <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        <Wallet className="h-3.5 w-3.5" />
        Pagamento dividido
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[13px] text-slate-500">Antes</p>
          <div className="space-y-2">
            {originalSplits.length === 0 ? (
              <p className="text-[13px] text-slate-600">Sem divisão de pagamento</p>
            ) : (
              originalSplits.map((split, index) => <SplitLine key={`original-split-${index}`} split={split} variant="original" />)
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] text-slate-500">Depois</p>
          <div className="space-y-2">
            {proposedSplits.length === 0 ? (
              <p className="text-[13px] text-slate-600">Sem divisão de pagamento</p>
            ) : (
              proposedSplits.map((split, index) => <SplitLine key={`proposed-split-${index}`} split={split} variant="proposed" />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
