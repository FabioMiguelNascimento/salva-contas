"use client";

import { FlagIcon } from '@/components/flag-icon';
import { formatDebitCardNumber, getStatusLabel } from '@/lib/card-utils';
import { cn } from '@/lib/utils';
import type { DebitCard } from '@/types/finance';

interface DebitCardListCardProps {
  card: DebitCard;
  onEdit: (card: DebitCard) => void;
}

const flagGradients: Record<string, string> = {
  visa: 'from-blue-700 to-blue-900',
  mastercard: 'from-gray-700 to-gray-900',
  american_express: 'from-sky-600 to-sky-900',
  elo: 'from-zinc-800 to-zinc-950',
  hipercard: 'from-red-700 to-red-950',
};

export function DebitCardListCard({ card, onEdit }: DebitCardListCardProps) {
  const gradient = flagGradients[card.flag] ?? 'from-indigo-600 to-purple-800';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(card)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(card);
        }
      }}
      className={cn('rounded-2xl p-5 text-white shadow-lg bg-linear-to-br cursor-pointer', gradient)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <FlagIcon flag={card.flag} className="h-8 w-auto shrink-0 opacity-90" />
          <div>
            <p className="font-bold text-white">{card.name}</p>
            <p className="text-xs text-white/60">{formatDebitCardNumber(card.lastFourDigits)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-white/60">Cartão de débito</span>
        <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
          {getStatusLabel(card.status)}
        </span>
      </div>
    </div>
  );
}


