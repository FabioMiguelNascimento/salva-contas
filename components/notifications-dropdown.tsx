"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/notifications-context";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/finance";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    AlertCircle,
    Bell,
    Calendar,
    CheckCheck,
    CreditCard,
    PiggyBank,
    RefreshCw,
    Trash2
} from "lucide-react";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "due_date":
      return Calendar;
    case "budget_limit":
      return PiggyBank;
    case "payment_reminder":
      return CreditCard;
    case "subscription_renewal":
      return RefreshCw;
    default:
      return AlertCircle;
  }
}

function getNotificationColor(type: NotificationType) {
  switch (type) {
    case "due_date":
      return "text-orange-500";
    case "budget_limit":
      return "text-red-500";
    case "payment_reminder":
      return "text-blue-500";
    case "subscription_renewal":
      return "text-purple-500";
    default:
      return "text-muted-foreground";
  }
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);
  const isUnread = notification.status === "unread";

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50",
        isUnread && "bg-muted/30"
      )}
    >
      <div className={cn("mt-0.5 shrink-0", iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium", isUnread && "font-semibold")}>
            {notification.title}
          </p>
          {isUnread && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            title="Marcar como lida"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          title="Remover"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, remove } =
    useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center px-1 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => markAllAsRead()}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhuma notificação
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-1 p-1">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={remove}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
