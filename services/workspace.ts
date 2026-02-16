import { apiClient } from "@/lib/api-client";
import type {
    CreateWorkspacePayload,
    InviteMemberPayload,
    Workspace,
    WorkspaceWithRole,
} from "@/types/workspace";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: number;
  data: T;
}

function unwrapData<T>(response: { data: ApiResponse<T> | T }): T {
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    return (response.data as ApiResponse<T>).data;
  }
  return response.data as T;
}

export async function getWorkspaces(): Promise<WorkspaceWithRole[]> {
  const response = await apiClient.get<ApiResponse<WorkspaceWithRole[]>>("/workspaces");
  return unwrapData(response);
}

export async function createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
  const response = await apiClient.post<ApiResponse<Workspace>>("/workspaces", payload);
  return unwrapData(response);
}

export async function inviteMember(
  workspaceId: string,
  payload: InviteMemberPayload
): Promise<void> {
  await apiClient.post(`/workspaces/${workspaceId}/members`, payload);
}

export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
}

export async function touchWorkspace(workspaceId: string): Promise<void> {
  await apiClient.post(`/workspaces/${workspaceId}/access`);
}
