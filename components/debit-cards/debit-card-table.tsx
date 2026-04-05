"use client";

import { FlagIcon } from '@/components/flag-icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDebitCardNumber, getFlagLabel, getStatusLabel, getStatusVariant } from '@/lib/card-utils';
import { cn } from '@/lib/utils';
import type { DebitCard } from '@/types/finance';

interface DebitCardTableProps {
  debitCards: DebitCard[];
  onEdit: (card: DebitCard) => void;
}

export function DebitCardTable({ debitCards, onEdit }: DebitCardTableProps) {
  if (debitCards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Nenhum cartão de débito encontrado.
      </div>
    );
  }

  return (
    <Table className="min-w-[760px]">
      <TableHeader>
        <TableRow>
          <TableHead>Cartão</TableHead>
          <TableHead>Bandeira</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {debitCards.map((card) => (
          <TableRow
            key={card.id}
            onClick={() => onEdit(card)}
            className="cursor-pointer hover:bg-muted/30"
          >
            <TableCell>
              <div className="max-w-60 min-w-0">
                <p className="truncate font-semibold">{card.name}</p>
                <p className="truncate text-xs text-muted-foreground">{formatDebitCardNumber(card.lastFourDigits)}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <FlagIcon flag={card.flag} className="h-6 w-auto" />
                <span className="text-xs text-muted-foreground">{getFlagLabel(card.flag)}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                className={cn(
                  'text-xs',
                  getStatusVariant(card.status) === 'success' && 'bg-emerald-100 text-emerald-800',
                  getStatusVariant(card.status) === 'warning' && 'bg-yellow-100 text-yellow-800',
                  getStatusVariant(card.status) === 'danger' && 'bg-destructive/15 text-destructive',
                  getStatusVariant(card.status) === 'muted' && 'bg-muted text-muted-foreground'
                )}
              >
                {getStatusLabel(card.status)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


