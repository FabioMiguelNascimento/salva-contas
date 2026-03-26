"use client";

import { useAuth } from "@/contexts/auth-context";
import { TopbarActionProvider, useTopbarAction } from "@/contexts/topbar-action-context";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
    SidebarProvider,
    SidebarTrigger,
    useSidebar
} from "@/components/ui/sidebar";

import { useFinancePeriod } from "@/context/finance-period-context";
import { AiAdvisorSheet } from "./ai-advisor-sheet";
import { AppSidebar } from "./app-sidebar";
import { SubscriptionSuccessHandler } from "./auth/subscription-success-handler";
import { NotificationsDropdown } from "./notifications-dropdown";
import { SettingsDialog } from "./settings-dialog";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isAuthPage = pathname === "/entrar" || pathname === "/cadastro" || pathname === "/recuperar-senha" || pathname === "/recuperar-senha" || pathname === "/update-password";
  
  if (isAuthPage || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <TopbarActionProvider>
        <AppShellContent>
          {children}
        </AppShellContent>
      </TopbarActionProvider>
    </SidebarProvider>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { actionNode } = useTopbarAction();
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  
  const { pendingBillsCount, isSyncing, refresh } = useFinancePeriod();
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSelectedTab, setSettingsSelectedTab] = useState<string>('profile');
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState(false);

  const handleOpenSettings = (tab?: string) => {
    if (tab) setSettingsSelectedTab(tab);
    setSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30 overflow-x-hidden w-full">
      <SubscriptionSuccessHandler />
      <Topbar
        userName={user?.name}
        pendingBillsCount={pendingBillsCount}
        refresh={refresh}
        isSyncing={isSyncing}
        actionNode={actionNode}
        showNewTransaction={false}
        logout={logout}
        onBrandClick={toggleSidebar}
      />

      <div className="flex min-h-screen w-full min-w-0">
        <AppSidebar 
          onOpenSettings={handleOpenSettings}
          onOpenAiAdvisor={() => setAiAdvisorOpen(true)}
        />

        <SettingsDialog 
          open={settingsOpen} 
          onOpenChange={setSettingsOpen} 
          selectedTab={settingsSelectedTab}
          onTabChange={setSettingsSelectedTab}
        />

        <AiAdvisorSheet
          open={aiAdvisorOpen}
          onOpenChange={setAiAdvisorOpen}
        />

        <div className="flex-1 min-w-0 lg:pt-16 w-full">
          <header className="flex items-center gap-3 border-b bg-card px-4 py-3 shadow-sm lg:hidden">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <NotificationsDropdown />
              {actionNode}
            </div>
          </header>

          <main className="relative p-4 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
