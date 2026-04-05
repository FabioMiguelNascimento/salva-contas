import { DynamicIcon } from "@/components/dynamic-icon";
import { FlagIcon } from "@/components/flag-icon";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency-utils";
import { getFrequencyLabel, getScheduleLabel } from "@/lib/subscriptions/utils";
import type { Subscription } from "@/types/finance";

interface SubscriptionListCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
}

export function SubscriptionListCard({ subscription, onEdit }: SubscriptionListCardProps) {
  const iconName = subscription.category?.icon ?? "tag";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(subscription)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(subscription);
        }
      }}
      className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm cursor-pointer"
    >
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
      </div>
      <div className="mt-3 flex items-center justify-between">
        <strong className="font-bold text-gray-900">{formatCurrency(subscription.amount)}</strong>
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
              <FlagIcon flag={subscription.creditCard.flag} className="h-3.5 w-auto" />
              <span>{subscription.creditCard.name}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

