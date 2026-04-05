"use client";

import { FlagIcon } from "@/components/flag-icon";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCardNumber, getFlagLabel, getStatusLabel, getStatusVariant } from "@/lib/card-utils";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import type { CreditCard } from "@/types/finance";

interface CreditCardTableProps {
  creditCards: CreditCard[];
  onEdit: (card: CreditCard) => void;
}

export function CreditCardTable({ creditCards, onEdit }: CreditCardTableProps) {
  if (creditCards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Nenhum cartão de crédito encontrado.
      </div>
    );
  }

  return (
    <Table className="min-w-[920px]">
      <TableHeader>
        <TableRow>
          <TableHead>Cartão</TableHead>
          <TableHead>Bandeira</TableHead>
          <TableHead className="text-right">Limite</TableHead>
          <TableHead className="text-right">Disponível</TableHead>
          <TableHead>Fechamento</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creditCards.map((card) => {
          const usedPercentage = ((card.limit - card.availableLimit) / card.limit) * 100;
          const isHighUsage = usedPercentage > 80;

          return (
            <TableRow
              key={card.id}
              onClick={() => onEdit(card)}
              className="cursor-pointer hover:bg-muted/30"
            >
              <TableCell>
                <div className="max-w-[220px] min-w-0">
                  <p className="truncate font-semibold">{card.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{formatCardNumber(card.lastFourDigits)}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FlagIcon flag={card.flag} className="h-6 w-auto" />
                  <span className="text-xs text-muted-foreground">{getFlagLabel(card.flag)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(card.limit)}
              </TableCell>
              <TableCell className={cn("text-right font-medium", isHighUsage && "text-destructive")}>
                {formatCurrency(card.availableLimit)}
              </TableCell>
              <TableCell>Dia {card.closingDay}</TableCell>
              <TableCell>Dia {card.dueDay}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "text-xs",
                    getStatusVariant(card.status) === "success" && "bg-emerald-100 text-emerald-800",
                    getStatusVariant(card.status) === "warning" && "bg-yellow-100 text-yellow-800",
                    getStatusVariant(card.status) === "danger" && "bg-destructive/15 text-destructive",
                    getStatusVariant(card.status) === "muted" && "bg-muted text-muted-foreground"
                  )}
                >
                  {getStatusLabel(card.status)}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}



