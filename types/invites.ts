export interface FamilyMember {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface FamilyMembersResponse {
  owner: FamilyMember;
  members: FamilyMember[];
  isOwner: boolean;
}

export interface GenerateInviteResponse {
  token: string;
  inviteUrl: string;
  expiresAt: string;
}

export interface AcceptInviteResponse {
  linkedToId: string;
  ownerName: string;
}
