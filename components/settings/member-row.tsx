"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { WorkspaceMemberWithUser } from "@/types/workspace";

interface MemberRowProps {
  member: WorkspaceMemberWithUser;
  showEmail?: boolean;
  canRemove?: boolean;
  onRemove?: (userId: string) => void;
}

export default function MemberRow({ member, showEmail = true, canRemove = false, onRemove }: MemberRowProps) {
  const { user } = useAuth();
  const initials = String(member.name ?? member.email ?? member.userId)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-semibold">{initials}</div>
        <div className="min-w-0">
          <div className="font-medium truncate">{member.name ?? member.email ?? (member.userId === user?.id ? user?.name : member.userId)}</div>
          {showEmail && <div className="text-xs text-muted-foreground truncate">{member.email ?? (member.userId === user?.id ? user?.email : "")}</div>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">{member.role}</div>
        {canRemove && member.userId !== user?.id && onRemove && (
          <Button size="sm" variant="destructive" onClick={() => onRemove(member.userId)}>
            Remover
          </Button>
        )}
      </div>
    </div>
  );
}
