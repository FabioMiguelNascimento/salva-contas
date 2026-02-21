import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface Props {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onViewAttachment?: (tx: Transaction) => void;
  isLoading: boolean;
}

function formatDate(tx: Transaction) {
  if (tx.paymentDate) {
    return format(new Date(tx.paymentDate), "dd/MM/yyyy", { locale: ptBR });
  }
  if (tx.dueDate) {
    return `${format(new Date(tx.dueDate), "dd/MM", { locale: ptBR })} (previsto)`;
  }
  return "—";
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  onViewAttachment,
  isLoading,
}: Props) {
  if (isLoading) {
    return <div className="h-28 w-full rounded-2xl bg-slate-100 animate-pulse" />;
  }

  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-semibold">{transaction.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(transaction)}</span>
            {transaction.creditCard && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CardFlagIcon flag={transaction.creditCard.flag} className="h-3.5 w-auto" />
                  <span>{transaction.creditCard.name}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {transaction.attachmentUrl && onViewAttachment && (
              <DropdownMenuItem onClick={() => onViewAttachment(transaction)}>
                <FileText className="mr-2 h-4 w-4" />
                Ver anexo
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(transaction)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <Badge variant="outline">{getTransactionCategoryLabel(transaction)}</Badge>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "text-xs",
              transaction.type === "income"
                ? "bg-emerald-100 text-emerald-900"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {transaction.type === "income" ? "Receita" : "Despesa"}
          </Badge>
          <span
            className={cn(
              "font-semibold",
              transaction.type === "income" ? "text-emerald-600" : "text-destructive"
            )}
          >
            {transaction.type === "income" ? "+" : "-"}
            {currencyFormatter.format(transaction.amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
