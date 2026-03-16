"use client";

import { CardFlagIcon } from '@/components/credit-cards/card-flag-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDebitCardNumber, getDebitFlagLabel, getDebitStatusLabel, getDebitStatusVariant } from '@/lib/debit-cards/constants';
import { cn } from '@/lib/utils';
import type { DebitCard } from '@/types/finance';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface DebitCardTableProps {
  debitCards: DebitCard[];
  onEdit: (card: DebitCard) => void;
  onDelete: (card: DebitCard) => void;
}

export function DebitCardTable({ debitCards, onEdit, onDelete }: DebitCardTableProps) {
  if (debitCards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Nenhum cartão de débito encontrado.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cartão</TableHead>
          <TableHead>Bandeira</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {debitCards.map((card) => (
          <TableRow key={card.id}>
            <TableCell>
              <div>
                <p className="font-semibold">{card.name}</p>
                <p className="text-xs text-muted-foreground">{formatDebitCardNumber(card.lastFourDigits)}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <CardFlagIcon flag={card.flag} className="h-6 w-auto" />
                <span className="text-xs text-muted-foreground">{getDebitFlagLabel(card.flag)}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                className={cn(
                  'text-xs',
                  getDebitStatusVariant(card.status) === 'success' && 'bg-emerald-100 text-emerald-800',
                  getDebitStatusVariant(card.status) === 'warning' && 'bg-yellow-100 text-yellow-800',
                  getDebitStatusVariant(card.status) === 'danger' && 'bg-destructive/15 text-destructive',
                  getDebitStatusVariant(card.status) === 'muted' && 'bg-muted text-muted-foreground'
                )}
              >
                {getDebitStatusLabel(card.status)}
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
        ))}
      </TableBody>
    </Table>
  );
}
