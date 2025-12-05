import type { Subscription } from "@/types/finance";
import { useMemo } from "react";

export interface SubscriptionStats {
  totalActive: number;
  totalAmount: number;
  byFrequency: Record<string, number>;
}

export function useSubscriptionStats(subscriptions: Subscription[]): SubscriptionStats {
  return useMemo(() => {
    const summary: SubscriptionStats = {
      totalActive: 0,
      totalAmount: 0,
      byFrequency: {},
    };

    for (const subscription of subscriptions) {
      if (subscription.isActive) {
        summary.totalActive += 1;
      }

      summary.totalAmount += subscription.amount;
      summary.byFrequency[subscription.frequency] = (summary.byFrequency[subscription.frequency] ?? 0) + 1;
    }

    return summary;
  }, [subscriptions]);
}
