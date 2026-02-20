"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { NewTransactionDialog } from "./new-transaction-sheet";
import { NotificationsDropdown } from "./notifications-dropdown";
import { WorkspaceSwitcher } from "./workspace-switcher";

export interface TopbarProps {
  userName?: string;
  pendingBillsCount: number;
  refresh: () => void;
  isSyncing: boolean;
  actionNode?: React.ReactNode;
  logout: () => void;
}

export function Topbar({
  userName,
  pendingBillsCount,
  refresh,
  isSyncing,
  actionNode,
  logout,
}: TopbarProps) {
  return (
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

        <Button variant="outline" onClick={refresh} disabled={isSyncing} className="gap-2" aria-label="Atualizar">
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
  );
}
