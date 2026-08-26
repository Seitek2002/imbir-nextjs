export type NotificationType =
  | "appointment_reminder"
  | "new_message"
  | "new_review"
  | "system";

export type Notification = {
  body: string;
  created_at: string;
  id: number;
  is_read: boolean;
  payload?: Record<string, unknown>;
  title: string;
  type: NotificationType;
};

export type NotificationsResponse = {
  data: Notification[];
  unread_count: number;
};
