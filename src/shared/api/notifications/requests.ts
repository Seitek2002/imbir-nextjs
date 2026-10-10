import { apiClient } from "../client";
import {
  Notification,
  NotificationsResponse,
  NotificationsUnreadCount,
} from "./types";

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const { data } = await apiClient.get<NotificationsResponse>(
    "/api/notifications/",
  );
  return data;
};

// Лёгкая ручка для бейджа колокольчика: сам список грузим только при открытии.
export const getNotificationsUnreadCount = async (): Promise<number> => {
  const { data } = await apiClient.get<NotificationsUnreadCount>(
    "/api/notifications/unread-count/",
  );
  return data?.total ?? 0;
};

export const markNotificationRead = async (
  id: number,
): Promise<Notification> => {
  const { data } = await apiClient.patch<Notification>(
    `/api/notifications/${id}/read/`,
  );
  return data;
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.patch("/api/notifications/read-all/");
};
