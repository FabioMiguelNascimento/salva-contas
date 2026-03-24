import { apiClient } from '@/lib/api-client';
import type {
  CreateVaultPayload,
  UpdateVaultPayload,
  Vault,
  VaultAiActionPayload,
  VaultAmountPayload,
  VaultHistoryQuery,
  VaultHistoryResponse,
} from '@/types/finance';

type ApiVault = Omit<Vault, 'targetAmount' | 'currentAmount'> & {
  targetAmount?: string | number | null;
  currentAmount: string | number;
};

type ApiResponse<T> = T | { data: T };

type ApiVaultHistoryResponse = Omit<VaultHistoryResponse, 'groups' | 'summary'> & {
  groups: Array<{
    date: string;
    items: Array<{
      id: string;
      type: 'deposit' | 'withdraw' | 'yield';
      amount: string | number;
      balanceAfter: string | number;
      happenedAt: string;
    }>;
  }>;
  summary: {
    totalDeposited: string | number;
    totalWithdrawn: string | number;
    totalYield: string | number;
    totalNetSaved: string | number;
    totalEvents: number;
  };
};

const toNumber = (value: string | number | null | undefined): number => {
  if (value == null) return 0;
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
};

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const normalizeVault = (vault: ApiVault): Vault => ({
  ...vault,
  targetAmount: vault.targetAmount == null ? null : toNumber(vault.targetAmount),
  currentAmount: toNumber(vault.currentAmount),
});

export async function fetchVaults(): Promise<Vault[]> {
  const response = await apiClient.get<ApiResponse<ApiVault[]>>('/vaults');
  return (unwrapData(response.data) ?? []).map(normalizeVault);
}

export async function createVault(payload: CreateVaultPayload): Promise<Vault> {
  const response = await apiClient.post<ApiResponse<ApiVault>>('/vaults', payload);
  return normalizeVault(unwrapData(response.data));
}

export async function updateVault(id: string, payload: UpdateVaultPayload): Promise<Vault> {
  const response = await apiClient.patch<ApiResponse<ApiVault>>(`/vaults/${id}`, payload);
  return normalizeVault(unwrapData(response.data));
}

export async function deleteVault(id: string): Promise<void> {
  await apiClient.delete(`/vaults/${id}`);
}

export async function depositToVault(id: string, payload: VaultAmountPayload): Promise<Vault> {
  const response = await apiClient.post<ApiResponse<ApiVault>>(`/vaults/${id}/deposit`, payload);
  return normalizeVault(unwrapData(response.data));
}

export async function withdrawFromVault(id: string, payload: VaultAmountPayload): Promise<Vault> {
  const response = await apiClient.post<ApiResponse<ApiVault>>(`/vaults/${id}/withdraw`, payload);
  return normalizeVault(unwrapData(response.data));
}

export async function addVaultYield(id: string, payload: VaultAmountPayload): Promise<Vault> {
  const response = await apiClient.post<ApiResponse<ApiVault>>(`/vaults/${id}/yield`, payload);
  return normalizeVault(unwrapData(response.data));
}

export async function aiActionOnVault(id: string, payload: VaultAiActionPayload): Promise<Vault> {
  const response = await apiClient.post<ApiResponse<ApiVault>>(`/vaults/${id}/ai-action`, payload);
  return normalizeVault(unwrapData(response.data));
}

export async function aiCommand(text: string): Promise<Vault> {
  const response = await apiClient.post<ApiResponse<ApiVault>>('/vaults/ai-command', { text });
  return normalizeVault(unwrapData(response.data));
}

export async function fetchVaultHistory(
  id: string,
  query: VaultHistoryQuery = {},
): Promise<VaultHistoryResponse> {
  const response = await apiClient.get<ApiResponse<ApiVaultHistoryResponse>>(
    `/vaults/${id}/history`,
    {
      params: query,
    },
  );

  const payload = unwrapData(response.data);

  return {
    ...payload,
    summary: {
      ...payload.summary,
      totalDeposited: toNumber(payload.summary.totalDeposited),
      totalWithdrawn: toNumber(payload.summary.totalWithdrawn),
      totalYield: toNumber(payload.summary.totalYield),
      totalNetSaved: toNumber(payload.summary.totalNetSaved),
    },
    groups: payload.groups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        amount: toNumber(item.amount),
        balanceAfter: toNumber(item.balanceAfter),
      })),
    })),
  };
}
