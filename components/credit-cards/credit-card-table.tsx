"use client";

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
import { formatCardNumber, getFlagLabel, getStatusLabel, getStatusVariant } from "@/lib/credit-cards/constants";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { CreditCard } from "@/types/finance";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface CreditCardTableProps {
  creditCards: CreditCard[];
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
}

export function CreditCardTable({ creditCards, onEdit, onDelete }: CreditCardTableProps) {
  if (creditCards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Nenhum cartão de crédito encontrado.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cartão</TableHead>
          <TableHead>Bandeira</TableHead>
          <TableHead className="text-right">Limite</TableHead>
          <TableHead className="text-right">Disponível</TableHead>
          <TableHead>Fechamento</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {creditCards.map((card) => {
          const usedPercentage = ((card.limit - card.availableLimit) / card.limit) * 100;
          const isHighUsage = usedPercentage > 80;

          return (
            <TableRow key={card.id}>
              <TableCell>
                <div>
                  <p className="font-semibold">{card.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCardNumber(card.lastFourDigits)}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CardFlagIcon flag={card.flag} className="h-6 w-auto" />
                  <span className="text-xs text-muted-foreground">{getFlagLabel(card.flag)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {currencyFormatter.format(card.limit)}
              </TableCell>
              <TableCell className={cn("text-right font-medium", isHighUsage && "text-destructive")}>
                {currencyFormatter.format(card.availableLimit)}
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
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(card)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(card)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
