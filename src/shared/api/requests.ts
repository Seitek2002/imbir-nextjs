import {
  ClinicListItem,
  DoctorListItem,
  ReviewItem,
  ServiceItem,
} from "../constants/mocks";
import {
  MOCK_CLINICS,
  MOCK_DOCTORS,
  MOCK_REVIEWS,
  MOCK_SERVICES,
} from "./mock-data";

export const api = {
  getDoctors: async (): Promise<DoctorListItem[]> => MOCK_DOCTORS,

  getDoctorById: async (id: string): Promise<DoctorListItem | null> =>
    MOCK_DOCTORS.find((d) => String(d.id) === id) ?? null,

  getClinics: async (): Promise<ClinicListItem[]> => MOCK_CLINICS,

  getClinicById: async (id: string): Promise<ClinicListItem | null> =>
    MOCK_CLINICS.find((c) => c.id === id) ?? null,

  getServices: async (): Promise<ServiceItem[]> => MOCK_SERVICES,

  getReviews: async (): Promise<ReviewItem[]> => MOCK_REVIEWS,

  createAppointment: async (
    _data: unknown,
  ): Promise<{ id: string; status: string }> => ({
    id: "mock",
    status: "confirmed",
  }),

  getReviewsByDoctor: async (doctorId: string): Promise<ReviewItem[]> =>
    MOCK_REVIEWS.filter((r) => r.doctorId === doctorId),

  getReviewsByClinic: async (clinicId: string): Promise<ReviewItem[]> =>
    MOCK_REVIEWS.filter((r) => r.clinicId === clinicId),
};
