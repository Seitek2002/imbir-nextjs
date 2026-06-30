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
  price: number;
  address: string;
  status: AppointmentStatus;
  isOnline: boolean;
  googleMeetLink: string | null;
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    doctorId: "d1",
    doctorName: "Айбеков Н. Э.",
    doctorSpecialty: "Врач-терапевт",
    doctorClinic: "Nova Clinic",
    doctorRating: 4.8,
    date: "12 нояб 2025",
    time: "09:00",
    service: "УЗИ",
    price: 1700,
    address: "г. Бишкек, ул. Тынystanova, 189",
    status: "upcoming",
    isOnline: true,
    googleMeetLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "2",
    doctorId: "d2",
    doctorName: "Калиева А. Э.",
    doctorSpecialty: "Врач-терапевт",
    doctorClinic: "Nova Clinic",
    doctorRating: 4.8,
    date: "12 нояб 2025",
    time: "09:00",
    service: "УЗИ",
    price: 1700,
    address: "г. Бишкек, ул. Тынystanova, 189",
    status: "upcoming",
    isOnline: false,
    googleMeetLink: null,
  },
  {
    id: "3",
    doctorId: "d3",
    doctorName: "Жумабаева Т. Б.",
    doctorSpecialty: "Врач-терапевт",
    doctorClinic: "Nova Clinic",
    doctorRating: 4.8,
    date: "12 нояб 2025",
    time: "09:00",
    service: "УЗИ",
    price: 1700,
    address: "г. Бишкек, ул. Тынystanova, 189",
    status: "completed",
    isOnline: false,
    googleMeetLink: null,
  },
  {
    id: "4",
    doctorId: "d1",
    doctorName: "Айбеков Н. Э.",
    doctorSpecialty: "Врач-терапевт",
    doctorClinic: "Nova Clinic",
    doctorRating: 4.8,
    date: "31.01.2026",
    time: "10:00",
    service: "УЗИ",
    price: 1700,
    address: "г. Бишкек, ул. Тынystanova, 189",
    status: "completed",
    isOnline: false,
    googleMeetLink: null,
  },
];
