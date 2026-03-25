import { useSubscriptions } from "@/context/subscriptions-context";

export function useSubscriptionsHook() {
  return useSubscriptions();
}
