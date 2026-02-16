"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { TopbarActionProvider, useTopbarAction } from "@/contexts/topbar-action-context";
import { useFinance } from "@/hooks/use-finance";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  RefreshCcw,
  Repeat
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";
import { NewTransactionDialog } from "./new-transaction-sheet";
import { NotificationsDropdown } from "./notifications-dropdown";
import { WorkspaceSwitcher } from "./workspace-switcher";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  description: string;
}

const baseNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Resumo financeiro, KPIs e alertas",
  },
  {
    label: "Contas a Pagar",
    href: "/contas",
    icon: CalendarClock,
    description: "Boletos, obrigações e agendamentos",
  },
  {
    label: "Assinaturas",
    href: "/assinaturas",
    icon: Repeat,
    description: "Compras recorrentes automatizadas",
  },
  {
    label: "Cartões",
    href: "/cartoes",
    icon: CreditCard,
    description: "Gerencie seus cartões de crédito",
  },
  {
    label: "Orçamentos",
    href: "/orcamentos",
    icon: PiggyBank,
    description: "Limites por categoria",
  },
  {
    label: "Extrato / Transações",
    href: "/extrato",
    icon: ReceiptText,
    description: "Histórico completo e filtros",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const { pendingBills, refresh, isSyncing } = useFinance();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage || !isAuthenticated) {
    return <>{children}</>;
  }

  const [showSyncing, setShowSyncing] = useState(false);

  return (
    <TopbarActionProvider>
      <AppShellContent 
        refresh={refresh} 
        isSyncing={isSyncing} 
        logout={logout}
      >
        {children}
      </AppShellContent>
    </TopbarActionProvider>
  );
}

function AppShellContent({ 
  children, 
  refresh, 
  isSyncing,
  logout,
}: { 
  children: React.ReactNode;
  refresh: () => void;
  isSyncing: boolean;
  logout: () => void;
}) {
  const { actionNode } = useTopbarAction();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { pendingBills } = useFinance();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const navItems = baseNavItems.map((item) => ({
    ...item,
    badge:
      item.href === "/contas" && pendingBills.length > 0
        ? `${pendingBills.length}`
        : undefined,
  }));

  return (
    <div className="min-h-screen bg-muted/30 overflow-x-hidden w-full">
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-14 items-center justify-between gap-3 border-b bg-card px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
              <Image src="/app-icon.svg" alt="Salva Contas" width={20} height={20} className="h-5 w-5" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Salva Contas</p>
            </div>
          </div>
          <WorkspaceSwitcher />
        </div>

        <div className="flex items-center gap-3">
          <NotificationsDropdown />
          <Button variant="outline" onClick={refresh} disabled={isSyncing} className="gap-2">
            <RefreshCcw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            Atualizar
          </Button>
          {actionNode ?? (
            <NewTransactionDialog
              trigger={<Button>Nova Transação</Button>}
            />
          )}
        </div>
      </header>

      <div className="flex min-h-screen w-full overflow-x-hidden">
        <Sidebar className="px-4" >
          <SidebarHeader>
            <div className="lg:hidden flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
                <Image src="/app-icon.svg" alt="Salva Contas" width={24} height={24} className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Salva Contas</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors",
                            isActive && "text-emerald-600"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="mb-14">
            <div className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-md p-2 text-sm hover:bg-sidebar-accent" title={user?.name ?? 'Usuário'}>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-500/15 text-emerald-600">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{user?.name ?? 'Usuário'}</div>
                      <div className="truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">{user?.email}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="truncate">{user?.name}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push('/perfil')}>Perfil</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/workspaces')}>Meus workspaces</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/configuracoes')}>Configurações</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} variant="destructive">Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 lg:pt-16 overflow-x-hidden w-full">
          <header className="flex items-center gap-3 border-b bg-card px-4 py-3 shadow-sm lg:hidden">
            <SidebarTrigger />
            <WorkspaceSwitcher />
            <div className="ml-auto flex items-center gap-2">
              <NotificationsDropdown />
              {actionNode ?? (
                <NewTransactionDialog
                  trigger={<Button size="sm">Nova Transação</Button>}
                />
              )}
            </div>
          </header>

          <main className="relative p-4 overflow-x-hidden w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
