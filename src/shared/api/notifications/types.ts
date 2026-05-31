export type NotificationType =
  | "appointment_reminder"
  | "new_review"
  | "new_message"
  | "system";

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  payload?: Record<string, unknown>;
};

export type NotificationsResponse = {
  data: Notification[];
  unread_count: number;
};
