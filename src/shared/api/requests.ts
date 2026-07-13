// Legacy compatibility shim.
// All new code should import directly from @/shared/api/<resource>/requests
// or from the barrel @/shared/api/index.ts.
//
// This file adapts the new snake_case API types back to the camelCase
// mock-type shape that existing entity components and views expect.
// It acts as a backward-compatibility layer during migration.
import type {
  ClinicListItem as MockClinicListItem,
  DoctorListItem as MockDoctorListItem,
  ReviewItem as MockReviewItem,
  ServiceItem as MockServiceItem,
} from "../dummies/mocks";
import { createAppointment as _createAppointment } from "./appointments/requests";
import {
  getClinicById as _getClinicById,
  getClinics,
} from "./clinics/requests";
import type {
  ClinicListItem as ApiClinic,
  ClinicDetail as ApiClinicDetail,
  ClinicFilters,
  ClinicSchedule,
} from "./clinics/types";
import {
  getDoctorById as _getDoctorById,
  getDoctors,
} from "./doctors/requests";
import type {
  DoctorListItem as ApiDoctor,
  DoctorDetail as ApiDoctorDetail,
  DoctorFilters,
} from "./doctors/types";
import { getReviews } from "./reviews/requests";
import type { ReviewItem as ApiReview } from "./reviews/types";
import { getServices } from "./services/requests";
import type {
  ServiceListItem as ApiService,
  ServiceFilters,
} from "./services/types";

const toHttps = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  return url.replace(
    /^http:\/\/imbir\.sino0on\.ru/,
    "https://imbir.sino0on.ru",
  );
};

const emptySchedule = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
  lunchBreak: null,
};

const adaptDoctor = (d: ApiDoctor): MockDoctorListItem => ({
  id: d.id,
  name: d.full_name,
  specialty: d.specialty,
  experience: d.experience_years,
  isOnlineAvailable: d.is_online_available,
  rating: d.rating,
  reviews: d.reviews_count,
  image: toHttps(d.photo),
  workplaces: d.workplaces.map((w) => ({
    clinicId: String(w.id ?? w.clinic_id ?? ""),
    clinicName: w.name ?? w.clinic_name ?? "",
    clinicAddress: (w as any).address ?? w.clinic_address ?? "",
    price: w.price,
    schedule: emptySchedule,
  })),
});

const adaptDoctorDetail = (d: ApiDoctorDetail): MockDoctorListItem => {
  const base = adaptDoctor(d);
  const formattedWorkExperience =
    d.work_experience && d.work_experience.length > 0
      ? d.work_experience.map((w) => {
          const toVal = w.to || new Date().getFullYear();
          const diff = toVal - w.from;
          const durationText = diff > 0 ? `${diff} лет` : "менее года";
          return {
            years: `${w.from}-${w.to || "Наст. время"}`,
            duration: `(${durationText})`,
            place: w.clinic,
            role: w.position,
          };
        })
      : undefined;

  const formattedEducation =
    d.education && d.education.length > 0
      ? d.education
          .map((e) => {
            const parts = [
              e.institution,
              e.year ? `(${e.year})` : "",
              e.degree ? `— ${e.degree}` : "",
            ]
              .filter(Boolean)
              .join(" ");
            return parts.trim();
          })
          .filter(Boolean)
          .join(", ") || undefined
      : undefined;

  return {
    ...base,
    about: d.about || undefined,
    skills: d.skills && d.skills.length > 0 ? d.skills : undefined,
    education: formattedEducation,
    workExperience: formattedWorkExperience,
    contacts: {
      schedule: "ПН-ПТ • 09:00-18:00",
      phone: d.phone || "",
      email: d.email || "",
    },
  };
};

const adaptClinic = (c: ApiClinic): MockClinicListItem => ({
  id: String(c.id),
  name: c.name,
  experience: c.experience_years ?? 0,
  rating: c.rating,
  reviews: c.reviews_count,
  address: c.address ?? "",
  city: c.city,
  coordinates: { lat: 0, lng: 0 },
  specialties: c.primary_specializations ?? [],
  image: toHttps(c.logo),
});

const formatClinicSchedule = (
  schedule?: ClinicSchedule,
): string | undefined => {
  if (!schedule) return undefined;
  const daysMap: Record<string, string> = {
    monday: "ПН",
    tuesday: "ВТ",
    wednesday: "СР",
    thursday: "ЧТ",
    friday: "ПТ",
    saturday: "СБ",
    sunday: "ВС",
  };
  const enabledDays = Object.entries(schedule)
    .filter(([_, info]) => info?.enabled)
    .map(([day, info]) => ({
      name: daysMap[day.toLowerCase()] || day,
      time: `${info.from}-${info.to}`,
    }));
  if (enabledDays.length === 0) return "По записи";
  const firstTime = enabledDays[0].time;
  const allSameTime = enabledDays.every((d) => d.time === firstTime);
  if (
    allSameTime &&
    enabledDays.length === 5 &&
    enabledDays[0].name === "ПН" &&
    enabledDays[4].name === "ПТ"
  ) {
    return `ПН-ПТ • ${firstTime}`;
  }
  return enabledDays.map((d) => `${d.name}: ${d.time}`).join(", ");
};

const adaptClinicDetail = (c: ApiClinicDetail): MockClinicListItem => {
  const base = adaptClinic(c);
  return {
    ...base,
    description: c.description || undefined,
    phone: c.phone || undefined,
    email: c.email || undefined,
    images: c.photos?.map((p) => toHttps(p)).filter(Boolean) as string[],
    schedule: formatClinicSchedule(c.schedule),
  };
};

const adaptService = (s: ApiService): MockServiceItem => ({
  id: String(s.id),
  clinicId: s.clinic ? String(s.clinic.id) : "",
  clinicName: s.clinic ? s.clinic.name : "",
  name: s.name,
  category: s.category,
  price: typeof s.price === "string" ? parseFloat(s.price) || 0 : 0,
  image: s.photo ? toHttps(s.photo) || "" : "",
  schedule: emptySchedule,
  doctorIds: [],
  rating: s.rating ? parseFloat(s.rating) || 0 : 0,
  reviews: s.reviews_count ? parseInt(s.reviews_count) || 0 : 0,
});

const resolveAuthor = (author: ApiReview["author"]): string => {
  if (typeof author === "string") return author;
  if (author && typeof author === "object" && "full_name" in author)
    return author.full_name;
  return "";
};

const adaptReview = (r: ApiReview): MockReviewItem => ({
  id: String(r.id),
  author: resolveAuthor(r.author),
  date: r.created_at.slice(0, 10),
  text: r.text ?? "",
  rating: r.rating,
  reply: r.reply
    ? { text: r.reply.text, date: r.reply.created_at.slice(0, 10) }
    : null,
  doctorId: "",
  clinicId: "",
});

export const api = {
  // Принимает либо просто город (как раньше), либо полный набор фильтров —
  // так вызовы api.getDoctors(city) на других страницах остаются рабочими.
  getDoctors: (filters?: string | DoctorFilters) => {
    const resolved: DoctorFilters =
      typeof filters === "string" ? { city: filters } : (filters ?? {});
    return getDoctors(resolved).then((r) => r.data.map(adaptDoctor));
  },

  getDoctorById: (id: string) =>
    _getDoctorById(id).then((d) => (d ? adaptDoctorDetail(d) : null)),

  getClinics: (filters?: ClinicFilters) =>
    getClinics(filters).then((r) => r.data.map(adaptClinic)),

  // Как getClinics, но сохраняет pagination — нужно для постраничной
  // подгрузки (кнопка «Показать ещё» на /clinics).
  getClinicsPaginated: (filters?: ClinicFilters) =>
    getClinics(filters).then((r) => ({
      data: r.data.map(adaptClinic),
      pagination: r.pagination,
    })),

  getClinicById: (id: string) =>
    _getClinicById(id).then((c) => (c ? adaptClinicDetail(c) : null)),

  getServices: (filters?: ServiceFilters) =>
    getServices(filters).then((r) => r.data.map(adaptService)),

  getReviews: () =>
    getReviews("doctor", 0).then((r) => r.data.map(adaptReview)),

  createAppointment: _createAppointment,

  getReviewsByDoctor: (doctorId: string) =>
    getReviews("doctor", doctorId).then((r) => r.data.map(adaptReview)),

  getReviewsByClinic: (clinicId: string) =>
    getReviews("clinic", clinicId).then((r) => r.data.map(adaptReview)),
};
