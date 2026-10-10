import type { PaginatedResponse } from "../types";

// Те же значения, что Notification.Type на бэке (notifications/models.py).
export type NotificationType =
  | "appointment_cancelled"
  | "appointment_completed"
  | "appointment_confirmed"
  | "appointment_created"
  | "appointment_reminder"
  | "clinic_invite_accepted"
  | "clinic_invite_declined"
  | "clinic_invite_received"
  | "new_message"
  | "new_review"
  | "system";

// payload на бэке собирают notifications/utils.py (appointment_payload,
// review_payload, message_payload) и ручки приглашений. Все поля
// необязательные: у «системных» уведомлений payload бывает пустым.
export type NotificationPayload = {
  appointment_id?: number;
  clinic_id?: null | number;
  doctor_id?: null | number;
  invitation_id?: number;
  review_id?: number;
  room_id?: number;
  target_id?: number;
  target_type?: string;
};

export type Notification = {
  body: string;
  created_at: string;
  id: number;
  is_read: boolean;
  payload?: NotificationPayload;
  title: string;
  type: NotificationType;
};

// GET /api/notifications/ — обычная пагинация ({ data, pagination }),
// счётчика непрочитанных в ответе нет, он отдаётся отдельной ручкой.
export type NotificationsResponse = PaginatedResponse<Notification>;

// GET /api/notifications/unread-count/
export type NotificationsUnreadCount = {
  by_type: Partial<Record<NotificationType, number>>;
  total: number;
};
