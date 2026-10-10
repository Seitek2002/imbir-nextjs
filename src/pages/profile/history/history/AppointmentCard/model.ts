export type AppointmentStatus =
  | "cancelled"
  | "completed"
  | "confirmed"
  | "pending"
  | "scheduled"
  | "upcoming";

export type Appointment = {
  address: string;
  // Можно ли оставить отзыв (can_review с бэка: приём завершён, и этому врачу
  // или клинике пациент ещё не писал).
  canReview: boolean;
  // id клиники записи — цель отзыва, если запись без врача.
  clinicId: string;
  // Видео-консультация завершена (consultation_status === "finished").
  // На старом бэке поля нет — тогда смотрим только на статус записи.
  consultationFinished?: boolean;
  date: string;
  // Итоги приёма, которые врач заполняет в кабинете.
  diagnosis?: string;
  doctorClinic: string;
  doctorId: string;
  doctorImage?: string;
  doctorName: string;
  doctorRating: number;
  doctorSpecialty: string;
  id: string;
  isOnline: boolean;
  // is_past с бэка: запись во вкладке «Прошедшие». Нет на старом бэке —
  // тогда вкладку определяем по статусу.
  isPast?: boolean;
  // Цена фиксируется при записи, но бэк может её не отдать — тогда прячем
  price?: number;
  recommendations?: string;
  service: string;
  // Минуты; есть — показываем «17:30–18:30» вместо одного начала.
  serviceDuration?: null | number;
  serviceId?: null | number | string;
  status: AppointmentStatus;
  time: string;
};
