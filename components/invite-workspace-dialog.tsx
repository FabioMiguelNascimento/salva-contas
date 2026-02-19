"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import * as workspaceService from "@/services/workspace";
import { Shield, User } from "lucide-react";
import { useState } from "react";

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
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  const isEmail = query.includes("@");
  const canInvite = Boolean(workspaceId && query.trim().length > 0 && isEmail);

  async function handleInvite() {
    if (!workspaceId || !canInvite) return;
    try {
      setIsInviting(true);
      await workspaceService.inviteMember(workspaceId, { email: query.trim(), role });
      (await import("sonner")).toast.success("Convite enviado");
      setQuery("");
      setRole("MEMBER");
      onOpenChange(false);
      onInvited?.();
    } catch (err: any) {
      (await import("sonner")).toast.error(err?.message ?? "Erro ao convidar");
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Adicionar pessoas a {workspaceName ?? "workspace"}</DialogTitle>
          <DialogDescription>Search by username, full name, or email</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email e função</Label>
            <InputGroup>
              <InputGroupInput
                id="invite-email"
                placeholder="Digite o email da pessoa"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <InputGroupAddon align="inline-end">
                <Select value={role} onValueChange={(v) => setRole(v as "MEMBER" | "ADMIN")}>
                  <SelectTrigger className="h-7 w-[140px] border-0 bg-transparent shadow-none focus:ring-0">
                    <div className="flex items-center gap-2">
                      {role === "ADMIN" ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span>{role === "ADMIN" ? "Admin" : "Membro"}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Membro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </InputGroupAddon>
            </InputGroup>
            {query && !isEmail && (
              <p className="text-xs text-muted-foreground">Digite um email válido</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!canInvite || isInviting} onClick={handleInvite}>
            {isInviting ? "Convidando..." : "Add to workspace"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
