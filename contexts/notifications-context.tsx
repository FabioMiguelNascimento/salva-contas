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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

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

const POLLING_INTERVAL = 60000; // 1 minute

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return; // don't call API when unauthenticated
    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadNotifications();
    setIsLoading(false);
  }, [loadNotifications]);

  // Initial load — refresh when auth becomes available
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      // clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [refresh, isAuthenticated]);

  // Polling for unread count — keep dependency array stable to avoid hook-size warnings.
  // Use a ref to read the current `isAuthenticated` inside the interval handler.
  const isAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (!isAuthenticatedRef.current) return; // skip when unauthenticated
        const count = await fetchUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const updated = await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read" as const, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      throw error;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification?.status === "unread") {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  }, [notifications]);

  const generate = useCallback(async () => {
    try {
      await generateNotifications();
      await loadNotifications();
    } catch (error) {
      console.error("Failed to generate notifications:", error);
      throw error;
    }
  }, [loadNotifications]);

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
    [notifications, unreadCount, isLoading, refresh, markAsRead, markAllAsRead, remove, generate]
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
