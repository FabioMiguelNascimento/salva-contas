"use client";

import { WorkspaceMemberWithUser } from "@/types/workspace";
import MemberRow from "./member-row";

interface MembersListProps {
  members: WorkspaceMemberWithUser[] | null;
  loading?: boolean;
  onRemove?: (userId: string) => void;
  canRemove?: boolean;
  showEmail?: boolean;
}

export default function MembersList({ members, loading = false, onRemove, canRemove = false, showEmail = true }: MembersListProps) {
  if (loading) return <div className="mt-3 text-sm text-muted-foreground">Carregando membros...</div>;
  if (!members || members.length === 0) return <div className="mt-3 text-sm text-muted-foreground">Nenhum membro encontrado.</div>;

  return (
    <div className="mt-3 space-y-2">
      {members.map((m) => (
        <MemberRow key={m.userId} member={m} onRemove={onRemove} canRemove={canRemove} showEmail={showEmail} />
      ))}
    </div>
  );
}
