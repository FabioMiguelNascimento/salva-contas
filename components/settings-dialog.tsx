"use client";

import SettingsContent from "@/components/settings-content";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Bell, ChevronLeft, Palette, Shield, User, Users, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import UserInitials from "./ui/user-initials";
import { useAuth } from "@/contexts/auth-context";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "security", label: "Segurança", icon: Shield },
  { id: "billing", label: "Faturamento", icon: Wallet },
  { id: "family", label: "Partilha Familiar", icon: Users },
] as const;

export function SettingsDialog({ open, onOpenChange, selectedTab, onTabChange }: SettingsDialogProps) {
  const [mobileShowContent, setMobileShowContent] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!open) {
      setMobileShowContent(false);
    }
  }, [open]);

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    setMobileShowContent(true);
  };

  const handleBack = () => {
    setMobileShowContent(false);
  };

  const handleClose = () => {
    setMobileShowContent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-dvh w-screen max-w-none flex-col overflow-hidden border-0 p-0 shadow-2xl sm:h-[85vh] sm:w-[95vw] sm:max-w-5xl sm:flex-row sm:rounded-3xl sm:border sm:border-slate-200 [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Configurações</DialogTitle>

        <aside
          className={cn(
            "flex-col border-b border-slate-100 bg-slate-50/50 sm:w-72 sm:shrink-0 sm:border-b-0 sm:border-r sm:bg-slate-50/80",
            mobileShowContent ? "hidden sm:flex" : "flex",
            "h-full"
          )}
        >
          <div className="flex shrink-0 items-center justify-between px-8 py-6 sm:py-8">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600/80">
              Configurações
            </p>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 sm:hidden"
              aria-label="Fechar configurações"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50"
                      : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5 transition-colors", isActive ? "text-emerald-600" : "text-slate-400")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <footer className="p-6 border-t border-slate-100 mt-auto hidden sm:block">
            <div className="flex gap-2 mb-2">
              <UserInitials
                name={user?.name}
                email={user?.email}
                className="size-8 -group-data-[collapsible=icon]:translate-x-1"
              />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user?.name ?? "Usuário"}</span>
                <span className="truncate text-xs text-primary font-semibold tracking-wider">
                  {user?.email}
                </span>
              </div>
            </div>
          </footer>
        </aside>

        <main
          className={cn(
            "relative flex-1 flex-col bg-white",
            mobileShowContent ? "flex" : "hidden sm:flex",
            "h-full"
          )}
        >
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 hidden rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 sm:block z-20"
            aria-label="Fechar configurações"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex shrink-0 items-center border-b border-slate-100 bg-white px-6 py-4 sm:hidden">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Voltar para menu de configurações"
            >
              <ChevronLeft className="h-5 w-5" />
              Voltar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-6 pb-12 px-6 sm:pt-16 sm:px-16">
            <div className="mx-auto max-w-3xl">
              <SettingsContent selectedTab={selectedTab} onTabChange={onTabChange} />
            </div>
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
}
