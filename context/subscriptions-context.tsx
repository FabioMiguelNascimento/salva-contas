"use client";

import {
    createSubscription,
    deleteSubscription,
    fetchSubscriptions,
    updateSubscription,
} from "@/services/subscriptions";
import type {
    CreateSubscriptionPayload,
    Subscription,
    UpdateSubscriptionPayload,
} from "@/types/finance";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface SubscriptionsContextValue {
  subscriptions: Subscription[];
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
  const isSubscriptionsRoute = pathname === "/assinaturas" || pathname.startsWith("/assinaturas/");

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSubscriptionsRoute) return;

    setIsSyncing(true);
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data);
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
    setSubscriptions((prev) => [subscription, ...prev]);
    return subscription;
  }, []);

  const updateSubscriptionRule = useCallback(async (id: string, payload: UpdateSubscriptionPayload) => {
    const subscription = await updateSubscription(id, payload);
    setSubscriptions((prev) => prev.map((item) => (item.id === id ? subscription : item)));
    return subscription;
  }, []);

  const deleteSubscriptionRule = useCallback(async (id: string) => {
    await deleteSubscription(id);
    setSubscriptions((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
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
