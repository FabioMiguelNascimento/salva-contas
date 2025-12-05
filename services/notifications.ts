import { apiClient } from "@/lib/api-client";
import type {
    CreateNotificationPayload,
    Notification,
    NotificationStatus,
} from "@/types/finance";

interface ApiNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  status: string;
  relatedId: string | null;
  createdAt: string;
  readAt: string | null;
}

type ApiResponse<T> = T | { data: T };

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

function normalizeNotification(data: ApiNotification): Notification {
  return {
    id: data.id,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type as Notification["type"],
    status: data.status as NotificationStatus,
    relatedId: data.relatedId,
    createdAt: data.createdAt,
    readAt: data.readAt,
  };
}

export async function fetchNotifications(
  status?: NotificationStatus,
  limit?: number
): Promise<Notification[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (limit) params.append("limit", String(limit));

  const query = params.toString();
  const url = `/notifications${query ? `?${query}` : ""}`;

  const response = await apiClient.get<ApiResponse<ApiNotification[]>>(url);
  return unwrapData(response.data).map(normalizeNotification);
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ count: number }>>(
    "/notifications/unread-count"
  );
  return unwrapData(response.data).count;
}

export async function createNotification(
  payload: CreateNotificationPayload
): Promise<Notification> {
  const response = await apiClient.post<ApiResponse<ApiNotification>>(
    "/notifications",
    payload
  );
  return normalizeNotification(unwrapData(response.data));
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await apiClient.patch<ApiResponse<ApiNotification>>(
    `/notifications/${id}/read`
  );
  return normalizeNotification(unwrapData(response.data));
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const response = await apiClient.put<ApiResponse<{ markedCount: number }>>(
    "/notifications/mark-all-read"
  );
  return unwrapData(response.data).markedCount;
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`/notifications/${id}`);
}

export async function generateNotifications(): Promise<void> {
  await apiClient.post("/notifications/generate");
}
