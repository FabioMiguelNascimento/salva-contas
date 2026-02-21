import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { DynamicIcon } from "@/components/dynamic-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { getFrequencyLabel, getScheduleLabel } from "@/lib/subscriptions/utils";
import type { Subscription } from "@/types/finance";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface SubscriptionListCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export function SubscriptionListCard({ subscription, onEdit, onDelete }: SubscriptionListCardProps) {
  const iconName = subscription.category?.icon ?? "tag";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 shrink-0">
            <DynamicIcon name={iconName} className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 truncate">{subscription.description}</p>
            <p className="text-xs text-gray-400">{subscription.category?.name ?? "Sem categoria"}</p>
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
            <DropdownMenuItem onClick={() => onEdit(subscription)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(subscription)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cancelar assinatura
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <strong className="font-bold text-gray-900">{currencyFormatter.format(subscription.amount)}</strong>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {getFrequencyLabel(subscription.frequency)}
          </Badge>
          <Badge className={subscription.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}>
            {subscription.isActive ? "Ativa" : "Inativa"}
          </Badge>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <span>Dia programado: {getScheduleLabel(subscription)}</span>
        {subscription.creditCard && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1">
              <CardFlagIcon flag={subscription.creditCard.flag} className="h-3.5 w-auto" />
              <span>{subscription.creditCard.name}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
