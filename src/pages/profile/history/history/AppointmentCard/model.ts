export type AppointmentStatus =
  | "cancelled"
  | "completed"
  | "confirmed"
  | "pending"
  | "scheduled"
  | "upcoming";

export type Appointment = {
  address: string;
  date: string;
  doctorClinic: string;
  doctorId: string;
  doctorImage?: string;
  doctorName: string;
  doctorRating: number;
  doctorSpecialty: string;
  id: string;
  isOnline: boolean;
  // Цена фиксируется при записи, но бэк может её не отдать — тогда прячем
  price?: number;
  service: string;
  serviceId?: null | number | string;
  status: AppointmentStatus;
  time: string;
};
