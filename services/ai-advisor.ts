import { apiClient } from '@/lib/api-client';
import type { AiAdvisorChatHistoryMessage, AiAdvisorChatResponse } from '@/types/finance';

type ApiResponse<T> = T | { data: T };

const unwrapPayload = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export async function chatWithAiAdvisor(params: {
  history: AiAdvisorChatHistoryMessage[];
  message: string;
  files?: File[];
}): Promise<AiAdvisorChatResponse> {
  if (params.files && params.files.length > 0) {
    const formData = new FormData();
    formData.append('message', params.message);
    formData.append('history', JSON.stringify(params.history));

    params.files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<ApiResponse<AiAdvisorChatResponse>>('/ai-advisor/chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapPayload(response.data);
  }

  const response = await apiClient.post<ApiResponse<AiAdvisorChatResponse>>('/ai-advisor/chat', params);
  return unwrapPayload(response.data);
}
