import { FlagIcon } from "@/components/flag-icon";
import { ArrowRight, Wallet } from "lucide-react";
import type { ResolvedPaymentMethod } from "./types";

export function PaymentMethodComparison({
  originalPaymentMethod,
  proposedPaymentMethod,
}: {
  originalPaymentMethod: ResolvedPaymentMethod;
  proposedPaymentMethod: ResolvedPaymentMethod;
}) {
  const OriginalPaymentMethodIcon = originalPaymentMethod.icon ?? Wallet;
  const ProposedPaymentMethodIcon = proposedPaymentMethod.icon ?? Wallet;

  return (
    <div className="border-t border-slate-200 pt-4">
      <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        <Wallet className="h-3.5 w-3.5" />
        Meio de pagamento
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div>
          <p className="text-[13px] text-slate-500">Antes</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              {originalPaymentMethod.flag ? (
                <FlagIcon flag={originalPaymentMethod.flag as any} className="h-6 w-9 rounded" />
              ) : (
                <OriginalPaymentMethodIcon className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-[14px] font-medium text-slate-800">{originalPaymentMethod.label}</p>
              {originalPaymentMethod.detail ? <p className="text-[11px] text-slate-500">{originalPaymentMethod.detail}</p> : null}
            </div>
          </div>
        </div>
        <ArrowRight className="mx-auto h-4 w-4 text-slate-400" />
        <div>
          <p className="text-[13px] text-slate-500">Depois</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              {proposedPaymentMethod.flag ? (
                <FlagIcon flag={proposedPaymentMethod.flag as any} className="h-6 w-9 rounded" />
              ) : (
                <ProposedPaymentMethodIcon className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-[18px] font-semibold text-slate-900">{proposedPaymentMethod.label}</p>
              {proposedPaymentMethod.detail ? <p className="text-[11px] text-slate-500">{proposedPaymentMethod.detail}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
