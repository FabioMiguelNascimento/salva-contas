"use client";

import { FinanceProvider } from "@/context/finance-context";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { WorkspaceProvider } from "@/contexts/workspace-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <FinanceProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </FinanceProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
