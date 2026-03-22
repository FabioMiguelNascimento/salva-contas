"use client";

import SettingsContent from "@/components/settings-content";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Bell, Palette, Shield, User, Users } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsDialog({ open, onOpenChange, selectedTab, onTabChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[calc(100vh-4rem)] p-0 overflow-hidden sm:max-w-none">
        <div className="flex h-full bg-background">
          <nav className="w-64 border-r border-border p-4">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Configurações</p>
            </div>
            <div className="flex flex-col gap-1">
              <button 
                className={cn("text-left rounded-md px-3 py-2 flex items-center gap-3", selectedTab === 'profile' ? "bg-accent/50 font-medium" : "hover:bg-accent/50")} 
                onClick={() => onTabChange('profile')}
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </button>
              <button 
                className={cn("text-left rounded-md px-3 py-2 flex items-center gap-3", selectedTab === 'appearance' ? "bg-accent/50 font-medium" : "hover:bg-accent/50")} 
                onClick={() => onTabChange('appearance')}
              >
                <Palette className="h-4 w-4" />
                <span>Aparência</span>
              </button>
              <button 
                className={cn("text-left rounded-md px-3 py-2 flex items-center gap-3", selectedTab === 'notifications' ? "bg-accent/50 font-medium" : "hover:bg-accent/50")} 
                onClick={() => onTabChange('notifications')}
              >
                <Bell className="h-4 w-4" />
                <span>Notificações</span>
              </button>
              <button 
                className={cn("text-left rounded-md px-3 py-2 flex items-center gap-3", selectedTab === 'security' ? "bg-accent/50 font-medium" : "hover:bg-accent/50")} 
                onClick={() => onTabChange('security')}
              >
                <Shield className="h-4 w-4" />
                <span>Segurança</span>
              </button>
              <button 
                className={cn("text-left rounded-md px-3 py-2 flex items-center gap-3", selectedTab === 'family' ? "bg-accent/50 font-medium" : "hover:bg-accent/50")} 
                onClick={() => onTabChange('family')}
              >
                <Users className="h-4 w-4" />
                <span>Partilha Familiar</span>
              </button>
              <hr className="my-3 border-border/60" />
            </div>
          </nav>

          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-full">
              <SettingsContent selectedTab={selectedTab} onTabChange={onTabChange} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}