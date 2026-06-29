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
  // Filled by the backend only when is_online is true.
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
