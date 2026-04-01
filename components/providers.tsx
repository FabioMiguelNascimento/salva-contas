"use client";

import { GlobalClientErrorHandler } from "@/components/global-client-error-handler";
import { FamilyInviteProvider } from "@/context/family-invite-context";
import { FinancePeriodProvider } from "@/context/finance-period-context";
import { UsageProvider } from "@/context/usage-context";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalClientErrorHandler />
      <AuthProvider>
        <UsageProvider>
          <NotificationsProvider>
            <FinancePeriodProvider>
              <FamilyInviteProvider>{children}</FamilyInviteProvider>
            </FinancePeriodProvider>
          </NotificationsProvider>
        </UsageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
