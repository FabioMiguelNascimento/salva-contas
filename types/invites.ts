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

export interface FamilyInviteToken {
  id: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  expiresAt: string;
  acceptedAt?: string | null;
  acceptedBy?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface FamilyInviteTokensResponse {
  activeInvites: FamilyInviteToken[];
  acceptedInvites: FamilyInviteToken[];
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
