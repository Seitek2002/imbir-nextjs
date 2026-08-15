export type AppointmentStatus =
  | "pending"
  | "upcoming"
  | "confirmed"
  | "scheduled"
  | "completed"
  | "cancelled";

export type Appointment = {
  id: string;
  doctorId: string;
  serviceId?: string | number | null;
  doctorName: string;
  doctorSpecialty: string;
  doctorClinic: string;
  doctorRating: number;
  doctorImage?: string;
  date: string;
  time: string;
  service: string;
  // Цена фиксируется при записи, но бэк может её не отдать — тогда прячем
  price?: number;
  address: string;
  status: AppointmentStatus;
  isOnline: boolean;
};
