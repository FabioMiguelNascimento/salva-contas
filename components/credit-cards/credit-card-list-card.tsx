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
import { Progress } from "@/components/ui/progress";
import { formatCardNumber, getStatusLabel, getStatusVariant } from "@/lib/credit-cards/constants";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { CreditCard } from "@/types/finance";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface CreditCardListCardProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
}

export function CreditCardListCard({ card, onEdit, onDelete }: CreditCardListCardProps) {
  const usedAmount = card.limit - card.availableLimit;
  const usedPercentage = (usedAmount / card.limit) * 100;
  const isHighUsage = usedPercentage > 80;

  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <CardFlagIcon flag={card.flag} className="h-8 w-auto shrink-0" />
          <div>
            <p className="font-semibold">{card.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCardNumber(card.lastFourDigits)}
            </p>
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

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Usado</span>
          <span className={cn("font-medium", isHighUsage && "text-destructive")}>
            {currencyFormatter.format(usedAmount)} de {currencyFormatter.format(card.limit)}
          </span>
        </div>
        <Progress
          value={usedPercentage}
          className={cn("h-2", isHighUsage && "[&>div]:bg-destructive")}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Fecha dia {card.closingDay}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">Vence dia {card.dueDay}</span>
        </div>
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
      </div>
    </div>
  );
}
