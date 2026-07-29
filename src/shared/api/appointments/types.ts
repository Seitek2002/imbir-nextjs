export type AppointmentStatus =
  | "pending"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "confirmed";

export type AppointmentDoctor = {
  id: number;
  full_name: string;
};

// Real API uses guest_* fields for unauthenticated booking.
// `is_online: true` is allowed only for authenticated users — a guest
// booking with is_online returns 400.
export type CreateAppointmentRequest = {
  doctor_id?: number | null;
  clinic_id?: number | null;
  service_id?: number | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  is_online?: boolean;
  notes?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
};

export type AppointmentResponse = {
  id: number;
  date: string;
  time: string;
  is_online: boolean;
  // Legacy Google Meet field; for new LiveKit records it is expected to be null.
  google_meet_link: string | null;
  status: AppointmentStatus;
  doctor?: AppointmentDoctor;
  notes?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
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
