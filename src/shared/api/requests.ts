import {
  ClinicListItem,
  DoctorListItem,
  ReviewItem,
  ServiceItem,
} from "../constants/mocks";

// Получаем наш URL из .env файла
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  // --- ВРАЧИ ---
  getDoctors: async (): Promise<DoctorListItem[]> => {
    try {
      // next: { revalidate: 0 } отключает жесткое кэширование Next.js,
      // чтобы мы сразу видели изменения, если добавим врача в MockAPI
      const res = await fetch(`${API_URL}/doctors`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error("Ошибка при загрузке врачей");
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getDoctorById: async (id: string): Promise<DoctorListItem | null> => {
    try {
      const res = await fetch(`${API_URL}/doctors/${id}`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error("Ошибка при загрузке врача");
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // --- КЛИНИКИ ---
  getClinics: async (): Promise<ClinicListItem[]> => {
    try {
      const res = await fetch(`${API_URL}/clinics`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error("Ошибка при загрузке клиник");
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getClinicById: async (id: string): Promise<ClinicListItem | null> => {
    try {
      const res = await fetch(`${API_URL}/clinics/${id}`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error("Ошибка при загрузке клиники");
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // --- УСЛУГИ ---
  getServices: async (): Promise<ServiceItem[]> => {
    try {
      const res = await fetch(`${API_URL}/services`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error("Ошибка при загрузке услуг");
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // --- ОТЗЫВЫ ---
  getReviews: async (): Promise<ReviewItem[]> => {
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error("Ошибка при загрузке отзывов");
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // --- ЗАПИСЬ НА ПРИЕМ (POST-запрос) ---
  createAppointment: async (appointmentData: any) => {
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });
      if (!res.ok) throw new Error("Ошибка при создании записи");
      return await res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getReviewsByDoctor: async (doctorId: string): Promise<ReviewItem[]> => {
    try {
      const res = await fetch(`${API_URL}/reviews?doctorId=${doctorId}`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error("Ошибка при загрузке отзывов врача");
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Получить отзывы клиники
  getReviewsByClinic: async (clinicId: string): Promise<ReviewItem[]> => {
    try {
      const res = await fetch(`${API_URL}/reviews?clinicId=${clinicId}`, {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error("Ошибка при загрузке отзывов клиники");
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
};
