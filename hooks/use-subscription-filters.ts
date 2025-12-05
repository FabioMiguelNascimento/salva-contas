import type { Subscription, SubscriptionFrequency } from "@/types/finance";
import { useMemo, useState } from "react";

export type SubscriptionFilterValue = "all" | SubscriptionFrequency;

export function useSubscriptionFilters(subscriptions: Subscription[]) {
  const [activeFilter, setActiveFilter] = useState<SubscriptionFilterValue>("all");

  const filteredSubscriptions = useMemo(() => {
    if (activeFilter === "all") {
      return subscriptions;
    }

    return subscriptions.filter((item) => item.frequency === activeFilter);
  }, [subscriptions, activeFilter]);

  return {
    activeFilter,
    setActiveFilter,
    filteredSubscriptions,
    isFiltered: activeFilter !== "all",
  };
}
