import { apiClient } from "@/lib/api-client";

export interface UsageData {
  usage: {
    aiInteractions: number;
    receipts: number;
  };
  limits: {
    aiInteractions: number;
    receipts: number;
  };
  period: {
    month: number;
    year: number;
  };
}

export async function getUsage(): Promise<UsageData> {
  const response = await apiClient.get("/usage");
  return response.data.data;
}
