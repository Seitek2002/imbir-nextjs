import { apiClient } from "../client";
import { Notification, NotificationsResponse } from "./types";

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const { data } = await apiClient.get<NotificationsResponse>(
    "/api/notifications/",
  );
  return data;
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
