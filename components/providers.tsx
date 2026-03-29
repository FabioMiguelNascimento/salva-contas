"use client";

import { FinancePeriodProvider } from "@/context/finance-period-context";
import { UsageProvider } from "@/context/usage-context";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UsageProvider>
        <NotificationsProvider>
          <FinancePeriodProvider>{children}</FinancePeriodProvider>
        </NotificationsProvider>
      </UsageProvider>
    </AuthProvider>
  );
}
