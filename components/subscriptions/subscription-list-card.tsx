import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { getFrequencyLabel, getScheduleLabel } from "@/lib/subscriptions/utils";
import type { Subscription } from "@/types/finance";

interface SubscriptionListCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export function SubscriptionListCard({ subscription, onEdit, onDelete }: SubscriptionListCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{subscription.description}</p>
          <p className="text-xs text-muted-foreground">{subscription.category?.name ?? "Sem categoria"}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {getFrequencyLabel(subscription.frequency)}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <strong>{currencyFormatter.format(subscription.amount)}</strong>
        <Badge className={subscription.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}>
          {subscription.isActive ? "Ativa" : "Inativa"}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Dia programado: {getScheduleLabel(subscription)}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" className="flex-1" variant="outline" onClick={() => onEdit(subscription)}>
          Editar
        </Button>
        <Button size="sm" className="flex-1" variant="destructive" onClick={() => onDelete(subscription)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
