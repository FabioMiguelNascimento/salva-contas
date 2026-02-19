"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkspaceMemberWithUser, WorkspaceWithRole } from "@/types/workspace";
import { Check, Plus } from "lucide-react";
import MembersList from "./members-list";

interface WorkspaceItemProps {
  workspace: WorkspaceWithRole;
  expanded: boolean;
  onToggleExpand: () => Promise<void> | void;
  isActive: boolean;
  onActivate: () => void;
  onInvite: () => void;
  members?: WorkspaceMemberWithUser[] | null;
  membersLoading?: boolean;
  onRemoveMember?: (userId: string) => void;
}

export default function WorkspaceItem({ workspace, expanded, onToggleExpand, isActive, onActivate, onInvite, members, membersLoading, onRemoveMember }: WorkspaceItemProps) {
  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={async () => await onToggleExpand()}
        onKeyDown={async (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); await onToggleExpand(); } }}
        className="w-full flex items-center justify-between gap-4 p-3"
        aria-expanded={expanded}
      >
        <div className="min-w-0 text-left">
          <p className="font-medium truncate">{workspace.name}</p>
          <p className="text-sm text-muted-foreground truncate">{workspace.description ?? '—'}</p>
        </div>

        <div className="flex items-center gap-2">
          {isActive ? (
            <Button size="sm" variant="default" className="gap-2" onClick={(e) => { e.stopPropagation(); onActivate(); (async () => (await import('sonner')).toast.success('Workspace ativo'))(); }}>
              <Check className="h-4 w-4" /> Ativo
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onActivate(); }}>
              Ativar
            </Button>
          )}

          <Button size="sm" variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); onInvite(); }}>
            <Plus className="h-4 w-4" />
            Convidar
          </Button>

          <div className={cn('transition-transform', expanded ? 'rotate-180' : '')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/40 p-3 space-y-2 bg-background">
          <MembersList members={members ?? null} loading={Boolean(membersLoading)} onRemove={onRemoveMember} canRemove={workspace.role === 'ADMIN'} showEmail />
        </div>
      )}
    </div>
  );
}
