export type AppointmentStatus =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "confirmed";

// Real API uses guest_* fields for unauthenticated booking
export type CreateAppointmentRequest = {
  doctor_id?: number | null;
  clinic_id?: number | null;
  service_id?: number | null;
  date: string;
  time: string;
  notes?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
};

export type AppointmentResponse = {
  id: number;
  date: string;
  time: string;
  notes?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
};

export type CancelAppointmentRequest = {
  status: "cancelled";
};
