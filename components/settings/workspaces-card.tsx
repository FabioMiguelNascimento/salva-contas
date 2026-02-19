"use client";

import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import InviteWorkspaceDialog from "@/components/invite-workspace-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";
import * as workspaceService from "@/services/workspace";
import { WorkspaceMemberWithUser } from "@/types/workspace";
import { Home } from "lucide-react";
import { useState } from "react";
import MembersList from "./members-list";
import WorkspaceItem from "./workspace-item";

export default function WorkspacesCard() {
  const { workspaces, currentWorkspace, isLoading: workspacesLoading, setCurrentWorkspace, refreshWorkspaces } = useWorkspace();
  const { user } = useAuth();

  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<WorkspaceMemberWithUser[] | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);

  async function loadMembers() {
    if (!currentWorkspace) return;
    setMembersLoading(true);
    try {
      const data = await (await import("@/services/workspace")).getMembers(currentWorkspace.id);
      setMembers(data);
    } catch (err) {
      (await import("sonner")).toast.error("Erro ao carregar membros");
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!currentWorkspace) return;
    if (!confirm("Remover este membro do workspace?")) return;
    try {
      await (await import("@/services/workspace")).removeMember(currentWorkspace.id, userId);
      (await import("sonner")).toast.success("Membro removido");
      await loadMembers();
      await refreshWorkspaces();
    } catch (err: any) {
      (await import("sonner")).toast.error(err?.message ?? "Erro ao remover membro");
    }
  }

  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);
  const [membersByWorkspace, setMembersByWorkspace] = useState<Record<string, WorkspaceMemberWithUser[] | null>>({});
  const [membersLoadingByWorkspace, setMembersLoadingByWorkspace] = useState<Record<string, boolean>>({});

  async function loadMembersForWorkspace(workspaceId: string) {
    if (!workspaceId) return;
    if (membersByWorkspace[workspaceId]) return;
    setMembersLoadingByWorkspace((p) => ({ ...p, [workspaceId]: true }));
    try {
      const data = await workspaceService.getMembers(workspaceId);
      setMembersByWorkspace((p) => ({ ...p, [workspaceId]: data }));
    } catch (err) {
      (await import("sonner")).toast.error("Erro ao carregar membros");
    } finally {
      setMembersLoadingByWorkspace((p) => ({ ...p, [workspaceId]: false }));
    }
  }

  async function handleRemoveMemberFromWorkspace(workspaceId: string, userId: string) {
    if (!workspaceId) return;
    if (!confirm("Remover este membro do workspace?")) return;
    try {
      await workspaceService.removeMember(workspaceId, userId);
      (await import("sonner")).toast.success("Membro removido");
      const updated = await workspaceService.getMembers(workspaceId);
      setMembersByWorkspace((p) => ({ ...p, [workspaceId]: updated }));
      await refreshWorkspaces();
    } catch (err: any) {
      (await import("sonner")).toast.error(err?.message ?? "Erro ao remover membro");
    }
  }

  const [inviteDialogOpenFor, setInviteDialogOpenFor] = useState<string | null>(null);



  const inviteWorkspace = workspaces.find((x) => x.id === inviteDialogOpenFor);

  return (
    <>
      <Card id="workspaces">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Home className="h-4 w-4" /> Workspaces</CardTitle>
          <CardDescription>Gerencie seus workspaces — ative, crie, convide e veja membros.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {currentWorkspace && (
            <div className="border border-border/60 rounded-2xl p-3">
              <button className="w-full flex items-center justify-between gap-3" onClick={async () => { setShowMembers((s) => !s); if (!members) await loadMembers(); }}>
                <div className="flex items-center gap-3">
                  <strong>Membros</strong>
                  <span className="text-sm text-muted-foreground">{members ? members.length : '—'}</span>
                </div>
                <div className={cn('transition-transform', showMembers ? 'rotate-180' : '')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </button>

              {showMembers && (
                <MembersList members={members} loading={membersLoading} onRemove={handleRemoveMember} canRemove={currentWorkspace.role === 'ADMIN'} showEmail />
              )} 
            </div>
          )}

          {workspacesLoading ? (
            <div className="text-sm text-muted-foreground">Carregando workspaces...</div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">Nenhum workspace encontrado.</p>
              <CreateWorkspaceDialog />
            </div>
          ) : (
            <div className="space-y-3">
              {workspaces.map((w) => {
                const expanded = expandedWorkspaceId === w.id;
                const workspaceMembers = membersByWorkspace[w.id];
                const workspaceLoading = membersLoadingByWorkspace[w.id];

                return (
                  <WorkspaceItem
                    key={w.id}
                    workspace={w}
                    expanded={expanded}
                    onToggleExpand={async () => { setExpandedWorkspaceId(expanded ? null : w.id); if (!expanded) await loadMembersForWorkspace(w.id); }}
                    isActive={currentWorkspace?.id === w.id}
                    onActivate={() => { setCurrentWorkspace(w.id); (async () => (await import('sonner')).toast.success('Workspace ativado'))(); }}
                    onInvite={() => { setInviteDialogOpenFor(w.id); }}
                    members={workspaceMembers}
                    membersLoading={workspaceLoading}
                    onRemoveMember={(userId) => handleRemoveMemberFromWorkspace(w.id, userId)}
                  />
                );
              })}
              <div className="pt-2">
                <CreateWorkspaceDialog />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteWorkspaceDialog
        workspaceId={inviteDialogOpenFor ?? undefined}
        workspaceName={inviteWorkspace?.name}
        open={Boolean(inviteDialogOpenFor)}
        onOpenChange={(open) => { if (!open) setInviteDialogOpenFor(null); }}
        onInvited={async () => { if (inviteDialogOpenFor) await loadMembersForWorkspace(inviteDialogOpenFor); await refreshWorkspaces(); setInviteDialogOpenFor(null); }}
      />
    </>
  );
}
