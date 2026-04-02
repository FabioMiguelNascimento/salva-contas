import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function DiffField({
  label,
  originalValue,
  proposedValue,
  renderValue = (value) => String(value || "—"),
}: {
  label: ReactNode;
  originalValue: any;
  proposedValue: any;
  renderValue?: (value: any) => ReactNode;
}) {
  const changed = originalValue !== proposedValue;

  return (
    <div className="py-2">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[13px] text-slate-500">Antes</p>
          <p className="text-[18px] font-medium text-slate-700 line-through decoration-1">{renderValue(originalValue)}</p>
        </div>

        {changed && (
          <>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-[13px] text-slate-500">Depois</p>
              <p className="text-[18px] font-semibold text-slate-900">{renderValue(proposedValue)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
