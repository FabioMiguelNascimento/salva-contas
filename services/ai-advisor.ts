import { apiClient } from '@/lib/api-client';
import type { AiAdvisorChatHistoryMessage, AiAdvisorChatResponse } from '@/types/ai-advisor';

type ApiResponse<T> = T | { data: T };

const unwrapPayload = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const getFriendlyAiAdvisorErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string } | null)?.code;

  if (code === 'AI_RATE_LIMIT') {
    return 'O assistente está com muitas requisições agora. Tente novamente em alguns instantes.';
  }

  if (code === 'AI_UNSUPPORTED_INPUT') {
    return 'Esse tipo de arquivo ainda não é suportado para processamento pela IA.';
  }

  const rawMessage = error instanceof Error ? error.message : 'Erro inesperado ao falar com o assistente.';
  const message = rawMessage.toLowerCase();

  if (
    message.includes('temporariamente indisponíveis por cota/limite') ||
    message.includes('rate limited') ||
    message.includes('status 429')
  ) {
    return 'O assistente está com muitas requisições agora. Tente novamente em alguns instantes.';
  }

  if (message.includes('network error') || message.includes('timeout') || message.includes('failed to fetch')) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  }

  if (message.includes('json inválido') || message.includes('malformado')) {
    return 'A resposta da IA veio em formato inválido. Tente novamente em instantes.';
  }

  if (message.includes('arquivo não encontrado') || message.includes('arquivo nao encontrado')) {
    return 'O arquivo anexado não foi encontrado no processamento. Reanexe e tente novamente.';
  }

  if (message.includes('status 500') || message.includes('erro inesperado')) {
    return 'Ocorreu um erro interno ao processar sua solicitação. Tente novamente.';
  }

  return rawMessage;
};

export async function chatWithAiAdvisor(params: {
  history: AiAdvisorChatHistoryMessage[];
  message: string;
  files?: File[];
}): Promise<AiAdvisorChatResponse> {
  try {
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
  } catch (error) {
    throw new Error(getFriendlyAiAdvisorErrorMessage(error));
  }
}
