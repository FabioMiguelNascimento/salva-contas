import { DynamicIcon } from "@/components/dynamic-icon";
import { CardFlagStack } from "@/components/transactions/CardFlagStack";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency-utils";
import { formatDate } from "@/lib/date-utils";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (tx: Transaction) => void;
}

export function TransactionTable({ transactions, isLoading, onEdit }: Props) {
  const pageSize = 15;

  const copyTransactionId = async (transaction: Transaction) => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      toast.success("ID da transação copiado");
    } catch {
      toast.error("Não foi possível copiar o ID");
    }
  };

  return (
    <Table className="min-w-[1100px]">
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Criado por</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Cartão</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: pageSize }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell colSpan={7}>
                <div className="h-12 w-full bg-slate-100 animate-pulse" />
              </TableCell>
            </TableRow>
          ))
        ) : transactions.length ? (
          transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              onClick={() => onEdit(transaction)}
              className="cursor-pointer hover:bg-muted/30"
            >
              <TableCell className="text-xs text-muted-foreground">
                {transaction.paymentDate ? formatDate(transaction.paymentDate) : transaction.dueDate ? `${formatDate(transaction.dueDate)}` : "—"}
              </TableCell>
              <TableCell className="max-w-[420px]">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyTransactionId(transaction);
                    }}
                    className="inline-flex max-w-full items-center gap-2 text-left hover:underline decoration-dotted"
                    title="Clique para copiar o ID da transação"
                  >
                    <span className="block min-w-0 truncate font-semibold">
                      {transaction.description}
                    </span>
                    {transaction.installmentCurrent && transaction.installments ? (
                      <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                        {transaction.installmentCurrent}/{transaction.installments}
                      </Badge>
                    ) : null}
                  </button>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {transaction.createdByName || "—"}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <DynamicIcon
                      name={transaction.categoryRel?.icon ?? "tag"}
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    <span>{getTransactionCategoryLabel(transaction)}</span>
                  </span>
                </Badge>
              </TableCell>
              <TableCell>
                <CardFlagStack transaction={transaction} />
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "text-xs",
                    transaction.type === "income"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-destructive/15 text-destructive"
                  )}
                >
                  {transaction.type === "income" ? "Receita" : "Despesa"}
                </Badge>
              </TableCell>
              <TableCell
                className={cn(
                  "font-semibold",
                  transaction.type === "income"
                    ? "text-emerald-600"
                    : "text-destructive"
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
              Nenhuma transação encontrada.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}


