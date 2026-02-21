import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
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

export function TransactionTable({ transactions, isLoading, onEdit, onDelete }: Props) {
  const pageSize = 8;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Cartão</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead className="w-12" />
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
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction)}</TableCell>
              <TableCell>
                <div>
                  <p className="font-semibold">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.status === "paid" ? "Liquidado" : "Pendente"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {getTransactionCategoryLabel(transaction)}
                </Badge>
              </TableCell>
              <TableCell>
                {transaction.creditCard ? (
                  <div className="flex items-center gap-2">
                    <CardFlagIcon flag={transaction.creditCard.flag} className="h-5 w-auto" />
                    <span className="text-xs text-muted-foreground">
                      {transaction.creditCard.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
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
                {currencyFormatter.format(transaction.amount)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
