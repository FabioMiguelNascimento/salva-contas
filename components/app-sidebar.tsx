"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useFinance } from "@/hooks/use-finance";
import { CalendarClock, CreditCard, LayoutDashboard, LogOut, PiggyBank, ReceiptText, Repeat, Settings, Sparkles, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

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

interface AppSidebarProps {
  onOpenSettings: (tab?: string) => void;
  onOpenAiAdvisor: () => void;
}

export function AppSidebar({ onOpenSettings, onOpenAiAdvisor }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="md:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Salva Contas">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
                  <Image src="/app-icon.svg" alt="Salva Contas" width={20} height={20} className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Salva Contas</span>
                  <span className="truncate text-xs text-muted-foreground">Gestor financeiro</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuItem>
                <SidebarMenuButton onClick={onOpenAiAdvisor} className="cursor-pointer" tooltip="Assistente Boletinho">
                  <Sparkles />
                  <span>Assistente Boletinho</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={user?.name ?? "Usuário"}>
                  <Avatar className="size-8 group-data-[collapsible=icon]:translate-x-0.5">
                    <AvatarFallback className="bg-emerald-500/15 text-emerald-600">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">{user?.name ?? "Usuário"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.name}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push("/perfil")}>
                  <User className="mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenSettings("profile")}>
                  <Settings className="mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenSettings("family")}>
                  <Users className="mr-2" />
                  Partilha Familiar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} variant="destructive">
                  <LogOut className="mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}