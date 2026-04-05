"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  deleteNotification,
  fetchNotifications,
  fetchUnreadCount,
  generateNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notifications";
import type { Notification } from "@/types/finance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"] as const;
const POLLING_INTERVAL = 60_000; // 1 minute

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  generate: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => fetchNotifications(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const unreadCountQuery = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnreadCount,
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });

  const notifications = useMemo(
    () => notificationsQuery.data ?? [],
    [notificationsQuery.data],
  );

  const unreadCount = unreadCountQuery.data ?? 0;
  const isLoading = notificationsQuery.isLoading;

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
  }, [queryClient]);

  const markAsRead = useCallback(async (id: string) => {
    const updated = await markNotificationAsRead(id);
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev: Notification[] | undefined) =>
      prev?.map((n) => (n.id === id ? updated : n)) ?? [],
    );
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
  }, [queryClient]);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev: Notification[] | undefined) =>
      prev?.map((n) => ({ ...n, status: "read" as const, readAt: new Date().toISOString() })) ?? [],
    );
    queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, 0);
  }, [queryClient]);

  const remove = useCallback(async (id: string) => {
    await deleteNotification(id);
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev: Notification[] | undefined) =>
      prev?.filter((n) => n.id !== id) ?? [],
    );
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
  }, [queryClient]);

  const generate = useCallback(async () => {
    await generateNotifications();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, []);
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, 0);
    }
  }, [isAuthenticated, queryClient]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      refresh,
      markAsRead,
      markAllAsRead,
      remove,
      generate,
    }),
    [notifications, unreadCount, isLoading, refresh, markAsRead, markAllAsRead, remove, generate],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
