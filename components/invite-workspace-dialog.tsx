"use client";

import { InviteForm } from "@/components/invite-workspace/invite-form";
import { InviteModal } from "@/components/invite-workspace/invite-modal";
import * as workspaceService from "@/services/workspace";
import { useEffect, useState } from "react";

export default function InviteWorkspaceDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
  onInvited,
}: {
  workspaceId: string | null | undefined;
  workspaceName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited?: () => void;
}) {
  console.log('🟣 InviteWorkspaceDialog RENDERIZOU (componente executou)', { open, workspaceId, workspaceName });
  
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    console.log('🟡 InviteWorkspaceDialog - open mudou:', { open, workspaceId, workspaceName });
    if (!open) {
      setQuery("");
      setRole("MEMBER");
    }
  }, [open, workspaceId, workspaceName]);

  useEffect(() => {
    if (open) console.log('🟢 InviteWorkspaceDialog -> portal SHOULD be mounted to document.body');
  }, [open]);

  const isEmail = query.includes("@");
  const canInvite = Boolean(workspaceId && query.trim().length > 0 && isEmail);

  async function handleInvite() {
    if (!workspaceId) return;
    if (!canInvite) return;
    try {
      setIsInviting(true);
      await workspaceService.inviteMember(workspaceId, { email: query.trim(), role });
      (await import("sonner")).toast.success("Convite enviado");
      setQuery("");
      onOpenChange(false);
      onInvited?.();
    } catch (err: any) {
      (await import("sonner")).toast.error(err?.message ?? "Erro ao convidar");
    } finally {
      setIsInviting(false);
    }
  }

  if (!open) {
    console.log('🔴 InviteWorkspaceDialog não vai renderizar (open = false)');
    return null;
  }

  console.log('🟢 InviteWorkspaceDialog renderizando', { workspaceId, workspaceName });

  // use the extracted modal + form components
  return (
    <InviteModal open={open} onOpenChange={onOpenChange}>
      <InviteForm
        workspaceName={workspaceName}
        query={query}
        setQuery={setQuery}
        role={role}
        setRole={(r) => setRole(r)}
        isInviting={isInviting}
        canInvite={canInvite}
        onInvite={handleInvite}
        onCancel={() => onOpenChange(false)}
      />
    </InviteModal>
  );
}
