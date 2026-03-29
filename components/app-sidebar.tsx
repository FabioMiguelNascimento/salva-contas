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
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { getPlanLabel } from "@/lib/utils";
import { CalendarClock, CreditCard, HandCoins, LayoutDashboard, LogOut, PiggyBank, ReceiptText, Repeat, Settings, Sparkles, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

interface NavItem {
  label: string;
  href?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}

interface AppSidebarProps {
  onOpenSettings: (tab?: string) => void;
  onOpenAiAdvisor: () => void;
}

export function AppSidebar({ onOpenSettings, onOpenAiAdvisor }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { label: "Contas a Pagar", href: "/app/contas", icon: CalendarClock },
    { label: "Assinaturas", href: "/app/assinaturas", icon: Repeat },
    { label: "Cartões", href: "/app/cartoes", icon: CreditCard },
    { label: "Orçamentos", href: "/app/orcamentos", icon: HandCoins },
    { label: "Cofrinhos", href: "/app/cofrinhos", icon: PiggyBank },
    { label: "Extrato / Transações", href: "/app/extrato", icon: ReceiptText },
    { label: "Assistente Boletinho", icon: Sparkles, onClick: onOpenAiAdvisor },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="md:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Salva Contas">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden">
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
                const isActive = item.href ? pathname === item.href : false;
                
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      asChild={!!item.href} 
                      isActive={isActive} 
                      tooltip={item.label}
                      onClick={item.onClick}
                      className={item.onClick ? "cursor-pointer" : ""}
                    >
                      {item.href ? (
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <>
                          <Icon />
                          <span>{item.label}</span>
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={user?.name ?? "Usuario"}>
                  <Avatar className="size-8 group-data-[collapsible=icon]:translate-x-0.5">
                    <AvatarFallback className="bg-emerald-500/15 text-emerald-600">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">{user?.name ?? "Usuario"}</span>
                    <span className="truncate text-xs text-primary font-semibold uppercase tracking-wider">
                      Plano {getPlanLabel(user?.planTier)}
                    </span>
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
