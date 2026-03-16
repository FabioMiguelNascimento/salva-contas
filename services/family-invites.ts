import { apiClient } from '@/lib/api-client';
import type { AcceptInviteResponse, FamilyMembersResponse, GenerateInviteResponse } from '@/types/invites';

type ApiResponse<T> = T | { data: T };

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export async function generateInvite(): Promise<GenerateInviteResponse> {
  const response = await apiClient.post<ApiResponse<GenerateInviteResponse>>('/invites/generate');
  return unwrapData(response.data);
}

export async function acceptInvite(token: string): Promise<AcceptInviteResponse> {
  const response = await apiClient.post<ApiResponse<AcceptInviteResponse>>('/invites/accept', { token });
  return unwrapData(response.data);
}

export async function previewInvite(token: string): Promise<{ ownerName: string; expiresAt: string }> {
  const response = await apiClient.get<ApiResponse<{ ownerName: string; expiresAt: string }>>(`/invites/preview/${token}`);
  return unwrapData(response.data);
}

export async function getFamilyMembers(): Promise<FamilyMembersResponse> {
  const response = await apiClient.get<ApiResponse<FamilyMembersResponse>>('/invites/members');
  return unwrapData(response.data);
}
