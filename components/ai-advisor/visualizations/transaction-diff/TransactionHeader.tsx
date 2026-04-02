import { DynamicIcon } from "@/components/dynamic-icon";
import { Badge } from "@/components/ui/badge";

function HeaderBadge({ count }: { count: number }) {
  return (
    <Badge className="rounded-full px-3 py-1">
      <span className="text-[11px] font-semibold">{count > 0 ? `${count} alteração${count > 1 ? "s" : ""}` : "Sem alterações"}</span>
    </Badge>
  );
}

export function TransactionHeader({ original, changeCount }: { original: Record<string, any>; changeCount: number }) {
  return (
    <div className="border-b border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {original.categoryIcon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary">
              <DynamicIcon name={original.categoryIcon} className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold">PROPOSTA DE ALTERAÇÃO</p>
            <p className="text-[18px] font-bold">{original.description || "Transação"}</p>
          </div>
        </div>
        <HeaderBadge count={changeCount} />
      </div>
    </div>
  );
}
