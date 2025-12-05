"use client";

import { FinanceProvider } from "@/context/finance-context";
import { NotificationsProvider } from "@/contexts/notifications-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </FinanceProvider>
  );
}
