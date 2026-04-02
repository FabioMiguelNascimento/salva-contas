"use client";

import { FlagIcon } from '@/components/flag-icon';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDebitCardNumber, getStatusLabel } from '@/lib/card-utils';
import { cn } from '@/lib/utils';
import type { DebitCard } from '@/types/finance';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface DebitCardListCardProps {
  card: DebitCard;
  onEdit: (card: DebitCard) => void;
  onDelete: (card: DebitCard) => void;
}

const flagGradients: Record<string, string> = {
  visa: 'from-blue-700 to-blue-900',
  mastercard: 'from-gray-700 to-gray-900',
  american_express: 'from-sky-600 to-sky-900',
  elo: 'from-zinc-800 to-zinc-950',
  hipercard: 'from-red-700 to-red-950',
};

export function DebitCardListCard({ card, onEdit, onDelete }: DebitCardListCardProps) {
  const gradient = flagGradients[card.flag] ?? 'from-indigo-600 to-purple-800';

  return (
    <div className={cn('rounded-2xl p-5 text-white shadow-lg bg-linear-to-br', gradient)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <FlagIcon flag={card.flag} className="h-8 w-auto shrink-0 opacity-90" />
          <div>
            <p className="font-bold text-white">{card.name}</p>
            <p className="text-xs text-white/60">{formatDebitCardNumber(card.lastFourDigits)}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-white/70 hover:text-white hover:bg-white/10">
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
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-white/60">Cart�o de d�bito</span>
        <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
          {getStatusLabel(card.status)}
        </span>
      </div>
    </div>
  );
}


