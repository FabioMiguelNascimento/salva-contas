"use client";

import { FinanceProvider } from "@/context/finance-context";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FinanceProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </FinanceProvider>
    </AuthProvider>
  );
}
