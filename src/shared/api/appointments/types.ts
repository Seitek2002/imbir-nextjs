export type AppointmentStatus =
  | "cancelled"
  | "completed"
  | "confirmed"
  | "pending"
  | "upcoming";

export type AppointmentDoctor = {
  full_name: string;
  id: number;
};

// Real API uses guest_* fields for unauthenticated booking.
// `is_online: true` is allowed only for authenticated users — a guest
// booking with is_online returns 400.
export type CreateAppointmentRequest = {
  clinic_id?: null | number;
  date: string; // YYYY-MM-DD
  doctor_id?: null | number;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  is_online?: boolean;
  notes?: string;
  service_id?: null | number;
  time: string; // HH:mm:ss
};

export type AppointmentResponse = {
  // Итоги видео-консультации. Заполняются бэком ПОСЛЕ созвона: ai_summary —
  // текст расшифровки, ai_summary_docx_url — ссылка на .docx. До созвона оба
  // приходят пустыми строками (проверено живым запросом). Присутствуют только
  // в GET /api/appointments/{id}/ — в списках /api/doctor/appointments/ и
  // /api/profile/appointments/ этих полей нет.
  ai_summary?: string;
  ai_summary_docx_url?: string;
  date: string;
  diagnosis?: null | string;
  doctor?: AppointmentDoctor;
  doctor_notes?: null | string;
  // Legacy Google Meet field; for new LiveKit records it is expected to be null.
  google_meet_link: null | string;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  id: number;
  is_online: boolean;
  notes?: string;
  // Схема объявляет patient строкой, но бэк отдаёт объект — как и author в
  // отзывах (см. reviews/types.ts). Ориентируемся на реальный ответ.
  patient?: AppointmentDoctor;
  recommendations?: null | string;
  status: AppointmentStatus;
  time: string;
};

export type AppointmentMutableStatus = "cancelled" | "completed" | "confirmed";

export type UpdateAppointmentStatusRequest = {
  status: AppointmentMutableStatus;
};

export type CancelAppointmentRequest = {
  status: "cancelled";
};

// POST /api/appointments/{id}/reschedule/ — перенос записи на новую дату/время.
// Для онлайн-консультации сохраняется тот же id LiveKit-комнаты; при наличии
// пациента и врача бэк шлёт системное сообщение в их чат. Нельзя переносить
// cancelled/completed (бэк вернёт 400).
export type RescheduleAppointmentRequest = {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
};
