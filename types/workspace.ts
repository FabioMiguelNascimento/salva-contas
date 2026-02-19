export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
}

export interface WorkspaceMemberWithUser extends WorkspaceMember {
  name?: string | null;
  email?: string | null;
  lastAccessed?: string | null;
  missingUser?: boolean;
}

export interface WorkspaceWithRole extends Workspace {
  role: "ADMIN" | "MEMBER";
  lastAccessed?: string | null;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export interface InviteMemberPayload {
  userId?: string;
  email?: string;
  role?: "ADMIN" | "MEMBER";
}
