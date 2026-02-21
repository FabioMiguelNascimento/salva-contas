import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: false,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error?.response?.data?.message ?? error.message ?? "Erro inesperado";
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
    return Promise.reject(new Error(message));
  }
);
