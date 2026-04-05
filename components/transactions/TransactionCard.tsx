import { CardFlagStack } from "@/components/transactions/CardFlagStack";
import { formatCurrency } from "@/lib/currency-utils";
import { formatDateWithoutYear } from "@/lib/date-utils";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { toast } from "sonner";

interface Props {
    transaction: Transaction;
    onEdit: (tx: Transaction) => void;
    isLoading: boolean;
}

export function TransactionCard({
  transaction,
  onEdit,
  isLoading,
}: Props) {
  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      toast.success("ID da transação copiado");
    } catch {
      toast.error("Não foi possível copiar o ID");
    }
  };

  if (isLoading) {
    return <div className="h-28 w-full rounded-2xl bg-slate-100 animate-pulse" />;
  }

  const displayDate = transaction.paymentDate
    ? formatDateWithoutYear(transaction.paymentDate)
    : transaction.dueDate
    ? formatDateWithoutYear(transaction.dueDate)
    : "—";

  const handleOpenEdit = () => {
    onEdit(transaction);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenEdit}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenEdit();
        }
      }}
      className="border-b border-border/40 px-0 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              copyTransactionId();
            }}
            className="inline-block max-w-full truncate text-left text-[15px] font-medium leading-6 hover:underline decoration-dotted"
            title="Clique para copiar o ID da transação"
          >
            {transaction.description}
          </button>
        </div>
        <span
          className={cn(
            "shrink-0 text-right text-[15px] font-semibold tracking-tight",
            transaction.type === "income" ? "text-emerald-500" : "text-slate-900"
          )}
        >
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-500">
        <span>{displayDate}</span>
        <span className="min-w-0 truncate">{getTransactionCategoryLabel(transaction)}</span>
        <CardFlagStack transaction={transaction} />
      </div>
    </div>
  );
}

