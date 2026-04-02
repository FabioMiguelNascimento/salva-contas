import axios from "axios";

export type ApiClientError = Error & {
  code?: string;
  status?: number;
  isExpectedNetworkError?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: false,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasResponse = Boolean(error?.response);
    const rawMessage = String(error?.message ?? "");
    const isTimeout =
      error?.code === "ECONNABORTED" ||
      error?.code === "ETIMEDOUT" ||
      /timeout/i.test(rawMessage);
    const isNetworkError = !hasResponse && (error?.code === "ERR_NETWORK" || /network error/i.test(rawMessage));

    let message = error?.response?.data?.message ?? rawMessage ?? "Erro inesperado";

    if (!hasResponse) {
      if (isTimeout) {
        message = "O servidor demorou muito para responder. Tente novamente em instantes.";
      } else if (isNetworkError) {
        message = "Não conseguimos conectar ao servidor. Verifique sua conexão com a internet.";
      }
    }

    const code = error?.response?.data?.code ?? error?.response?.data?.error?.code;
    const status = error?.response?.status;
    const details = error?.response?.data?.error?.details;
    if (Array.isArray(details) && details.length > 0) {
      // join human-readable messages and include field paths
      const detailMsgs = details
        .map((d: any) => {
          const path = Array.isArray(d.path) && d.path.length ? d.path.join('.') : null;
          const msg = d.message ?? "invalid";
          return path ? `${path}: ${msg}` : msg;
        })
        .filter(Boolean);
      if (detailMsgs.length > 0) {
        message += ` (${detailMsgs.join(', ')})`;
      }
    }
    const normalizedError = new Error(message) as ApiClientError;
    if (code) normalizedError.code = code;
    if (typeof status === 'number') normalizedError.status = status;
    normalizedError.isExpectedNetworkError = !hasResponse && (isTimeout || isNetworkError);
    return Promise.reject(normalizedError);
  }
);
