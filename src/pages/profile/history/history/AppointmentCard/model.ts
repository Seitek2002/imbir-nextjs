export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  doctorId: string;
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
