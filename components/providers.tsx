"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { FinanceProvider } from "@/context/finance-context";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { WorkspaceProvider } from "@/contexts/workspace-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <SidebarProvider>
          <FinanceProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
          </FinanceProvider>
        </SidebarProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
