"use client";

import {
  createSubscription,
  deleteSubscription,
  fetchSubscriptionMetrics,
  fetchSubscriptions,
  updateSubscription,
} from "@/services/subscriptions";
import type {
  CreateSubscriptionPayload,
  Subscription,
  SubscriptionMetrics,
  UpdateSubscriptionPayload,
} from "@/types/finance";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

interface SubscriptionStats {
  totalActive: number;
  totalAmount: number;
  byFrequency: Record<string, number>;
}

interface SubscriptionsContextValue {
  subscriptions: Subscription[];
  subscriptionMetrics: SubscriptionMetrics | null;
  stats: SubscriptionStats;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSync: string | null;
  refresh: () => Promise<void>;
  createSubscriptionRule: (payload: CreateSubscriptionPayload) => Promise<Subscription>;
  updateSubscriptionRule: (id: string, payload: UpdateSubscriptionPayload) => Promise<Subscription>;
  deleteSubscriptionRule: (id: string) => Promise<void>;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSubscriptionsRoute = pathname === "/app/assinaturas" || pathname.startsWith("/app/assinaturas/");

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSubscriptionsRoute) return;

    setIsSyncing(true);
    try {
      const [data, metrics] = await Promise.all([
        fetchSubscriptions(),
        fetchSubscriptionMetrics(),
      ]);
      setSubscriptions(data);
      setSubscriptionMetrics(metrics);
      setError(null);
      setLastSync(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar assinaturas.");
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [isSubscriptionsRoute]);

  const lastRefreshParams = useRef<{ refresh: any; isSubscriptionsRoute: boolean } | null>(null);

  useEffect(() => {
    if (
      lastRefreshParams.current?.refresh === refresh &&
      lastRefreshParams.current?.isSubscriptionsRoute === isSubscriptionsRoute
    ) {
      return;
    }
    lastRefreshParams.current = { refresh, isSubscriptionsRoute };

    if (!isSubscriptionsRoute) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    void refresh();
  }, [isSubscriptionsRoute, refresh]);

  const createSubscriptionRule = useCallback(async (payload: CreateSubscriptionPayload) => {
    const subscription = await createSubscription(payload);
    await refresh();
    return subscription;
  }, [refresh]);

  const updateSubscriptionRule = useCallback(async (id: string, payload: UpdateSubscriptionPayload) => {
    const subscription = await updateSubscription(id, payload);
    await refresh();
    return subscription;
  }, [refresh]);

  const deleteSubscriptionRule = useCallback(async (id: string) => {
    await deleteSubscription(id);
    await refresh();
  }, [refresh]);

  const stats = useMemo<SubscriptionStats>(() => {
    return {
      totalActive: subscriptionMetrics?.activeCount ?? 0,
      totalAmount: subscriptionMetrics?.totalMonthly ?? 0,
      byFrequency: {
        weekly: subscriptionMetrics?.byFrequency.weekly ?? 0,
        monthly: subscriptionMetrics?.byFrequency.monthly ?? 0,
        yearly: subscriptionMetrics?.byFrequency.yearly ?? 0,
      },
    };
  }, [subscriptionMetrics]);

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        subscriptionMetrics,
        stats,
        isLoading,
        isSyncing,
        error,
        lastSync,
        refresh,
        createSubscriptionRule,
        updateSubscriptionRule,
        deleteSubscriptionRule,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error("useSubscriptions deve ser utilizado dentro de SubscriptionsProvider");
  }
  return context;
}
