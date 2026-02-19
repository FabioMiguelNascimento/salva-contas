"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type InviteFormProps = {
  workspaceName?: string | null;
  query: string;
  setQuery: (q: string) => void;
  role: "MEMBER" | "ADMIN";
  setRole: (r: "MEMBER" | "ADMIN") => void;
  isInviting: boolean;
  canInvite: boolean;
  onInvite: () => void;
  onCancel: () => void;
};

export function InviteForm({ workspaceName, query, setQuery, role, setRole, isInviting, canInvite, onInvite, onCancel }: InviteFormProps) {
  return (
    <>
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Adicionar pessoas a {workspaceName ?? "workspace"}</h3>
        <p className="text-sm text-muted-foreground">Search by username, full name, or email</p>
      </div>

      <div className="mt-4">
        <Label>Find people</Label>
        <Input placeholder="Find people" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-2" />
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <Label>Função</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="w-full mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Membro</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Preview</Label>
            <div className="mt-2 text-sm text-muted-foreground w-48">
              {query.includes("@") ? query : <span className="text-xs text-muted-foreground">Digite um email válido para convidar</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button disabled={!canInvite || isInviting} onClick={onInvite}>{isInviting ? 'Convidando...' : `Add to workspace`}</Button>
      </div>
    </>
  );
}
