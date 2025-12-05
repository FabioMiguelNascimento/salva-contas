"use client";

import { NewTransactionDialog } from "@/components/new-transaction-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useFinance } from "@/hooks/use-finance";
import { cn } from "@/lib/utils";
import {
    CalendarClock,
    ChevronRight,
    LayoutDashboard,
    Menu,
    ReceiptText,
    Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { useMemo, useState } from "react";

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
    label: "Extrato / Transações",
    href: "/extrato",
    icon: ReceiptText,
    description: "Histórico completo e filtros",
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Preferências do workspace",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pendingBills } = useFinance();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navItems = useMemo(
    () =>
      baseNavItems.map((item) => ({
        ...item,
        badge:
          item.href === "/contas" && pendingBills.length > 0
            ? `${pendingBills.length}`
            : undefined,
      })),
    [pendingBills]
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white font-semibold">
          AI
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">AI Finance</p>
          <h1 className="text-lg font-semibold leading-tight">Tracker</h1>
        </div>
      </div>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-primary/10 text-sidebar-foreground border-sidebar-border"
                  : "hover:bg-sidebar-accent"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors",
                    isActive && "bg-emerald-500/15 text-emerald-600"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="flex items-center gap-2 font-medium text-base">
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="px-2 py-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </span>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </span>
              </span>
              <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-opacity", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
              />
            </Link>
          );
        })}
      </div>
      <div className="rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 p-5 text-white">
        <p className="text-sm uppercase tracking-widest text-white/80">Assistente IA</p>
        <h2 className="mt-1 text-xl font-semibold">Capture gastos em segundos</h2>
        <p className="mt-2 text-sm text-white/80">
          Envie recibos, prints ou mensagens e deixe o Gemini organizar tudo automaticamente.
        </p>
        <div className="mt-4">
          <NewTransactionDialog
            trigger={
              <Button className="w-full bg-white text-emerald-600 hover:bg-white/90">
                Nova Transação
              </Button>
            }
          />
        </div>
      </div>
      <div className="mt-auto space-y-4">
        <Separator />
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-emerald-500/15 text-emerald-600">LC</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">Letícia Carvalho</p>
            <p className="text-xs text-muted-foreground">CFO • Squad Finance</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto text-xs">
            Sair
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <aside className="hidden w-full max-w-xs border-r bg-sidebar px-5 py-6 shadow-sm lg:block">
          <SidebarContent />
        </aside>

        <div className="flex-1">
          <header className="flex items-center gap-3 border-b bg-card px-4 py-3 shadow-sm lg:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-r p-0">
                <ScrollArea className="h-full px-5 py-6">
                  <SidebarContent />
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI Finance</p>
              <p className="text-lg font-semibold">Tracker</p>
            </div>
            <div className="ml-auto">
              <NewTransactionDialog
                trigger={<Button size="sm">Nova Transação</Button>}
              />
            </div>
          </header>

          <main className="relative px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 lg:hidden">
        <NewTransactionDialog
          trigger={
            <Button size="lg" className="h-14 w-14 rounded-full shadow-lg shadow-emerald-500/30">
              +
            </Button>
          }
        />
      </div>
    </div>
  );
}
