"use client";

import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCardNumber } from "@/lib/credit-cards/constants";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { CreditCard } from "@/types/finance";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface CreditCardListCardProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
}

const flagGradients: Record<string, string> = {
  visa: "from-blue-700 to-blue-900",
  mastercard: "from-gray-700 to-gray-900",
  american_express: "from-sky-600 to-sky-900",
  elo: "from-zinc-800 to-zinc-950",
  hipercard: "from-red-700 to-red-950",
};

export function CreditCardListCard({ card, onEdit, onDelete }: CreditCardListCardProps) {
  const usedAmount = card.limit - card.availableLimit;
  const usedPercentage = card.limit > 0 ? (usedAmount / card.limit) * 100 : 0;
  const gradient = flagGradients[card.flag] ?? "from-indigo-600 to-purple-800";

  return (
    <div className={cn("rounded-2xl p-5 text-white shadow-lg bg-linear-to-br", gradient)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <CardFlagIcon flag={card.flag} className="h-8 w-auto shrink-0 opacity-90" />
          <div>
            <p className="font-bold text-white">{card.name}</p>
            <p className="text-xs text-white/60">
              {formatCardNumber(card.lastFourDigits)}
            </p>
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

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Usado</span>
          <span className="font-bold text-white">
            {currencyFormatter.format(usedAmount)} de {currencyFormatter.format(card.limit)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/80 transition-all"
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Fecha dia {card.closingDay}</span>
          <span className="text-xs text-white/40">•</span>
          <span className="text-xs text-white/60">Vence dia {card.dueDay}</span>
        </div>
        <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
          {usedPercentage > 80 ? "Alta utilização" : usedPercentage > 50 ? "Moderado" : "Disponível"}
        </span>
      </div>
    </div>
  );
}
