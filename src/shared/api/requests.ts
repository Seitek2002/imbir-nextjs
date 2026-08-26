// Legacy compatibility shim.
// All new code should import directly from @/shared/api/<resource>/requests
// or from the barrel @/shared/api/index.ts.
//
// This file adapts the new snake_case API types back to the camelCase
// mock-type shape that existing entity components and views expect.
// It acts as a backward-compatibility layer during migration.
import { toHttps, toMediaUrl } from "@/shared/lib/media";
import { parsePrice } from "@/shared/lib/price";

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
    clinicAddress:
      (w as { address?: string }).address ?? w.clinic_address ?? "",
    price: w.price,
    schedule: emptySchedule,
  })),
});

const adaptDoctorDetail = (d: ApiDoctorDetail): MockDoctorListItem => {
  const base = adaptDoctor(d);
  const formattedWorkExperience =
    d.work_experience && d.work_experience.length > 0
      ? d.work_experience.map((w) => {
          // from/to не гарантированы (свободный JSON) — если их нет, показываем
          // квалификацию/степень вместо диапазона лет, а не "undefined-...".
          const hasRange = typeof w.from === "number";
          let years: string | undefined;
          let duration: string | undefined;
          if (hasRange) {
            const toVal = w.to || new Date().getFullYear();
            const diff = toVal - w.from!;
            const durationText = diff > 0 ? `${diff} лет` : "менее года";
            years = `${w.from}-${w.to || "Наст. время"}`;
            duration = `(${durationText})`;
          }
          const qualification =
            [w.qualification, w.scientific_degree].filter(Boolean).join(", ") ||
            undefined;
          return {
            years,
            duration,
            qualification: hasRange ? undefined : qualification,
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
      : undefined;

  return {
    ...base,
    about: d.about || undefined,
    skills: d.skills && d.skills.length > 0 ? d.skills : undefined,
    education: formattedEducation,
    workExperience: formattedWorkExperience,
    // Публичный профиль врача не отдаёт расписание (нет такого поля в
    // DoctorDetail) — раньше здесь было одно и то же захардкоженное время для
    // всех врачей; лучше не показывать строку вовсе, чем показывать неправду.
    contacts: {
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
  // Бэк отдаёт объекты {id, name, photo}, не строки — а фильтры клиник
  // (поиск/специализация) сравнивают именно название.
  specialties: (c.primary_specializations ?? []).map((s) => s.name),
  image: toHttps(c.logo),
});

// Порядок и человекочитаемые подписи дней — Object.entries(schedule) отдаёт
// ключи в том порядке, в котором их прислал бэк (не обязательно Пн→Вс), из-за
// чего график до этой правки мог выглядеть как "ПТ: ..., ПН: ..., ВС: ..."
const WEEK_ORDER: { key: string; name: string }[] = [
  { key: "monday", name: "ПН" },
  { key: "tuesday", name: "ВТ" },
  { key: "wednesday", name: "СР" },
  { key: "thursday", name: "ЧТ" },
  { key: "friday", name: "ПТ" },
  { key: "saturday", name: "СБ" },
  { key: "sunday", name: "ВС" },
];

const formatClinicSchedule = (
  schedule?: ClinicSchedule,
): string | undefined => {
  if (!schedule) return undefined;

  const byKey = new Map(
    Object.entries(schedule).map(([day, info]) => [day.toLowerCase(), info]),
  );
  const week = WEEK_ORDER.map(({ key, name }) => {
    const info = byKey.get(key);
    return {
      name,
      enabled: !!info?.enabled,
      time: info ? `${info.from}-${info.to}` : "",
    };
  });

  // Группируем ПОДРЯД ИДУЩИЕ (в порядке Пн→Вс) дни с одинаковым временем в
  // один диапазон — "ПН-ПТ • 9:00-18:00" вместо пяти отдельных строк, и
  // "Ежедневно • 0:00-23:59", если время совпадает вообще у всех 7 дней.
  const ranges: { from: string; time: string; to: string }[] = [];
  for (const day of week) {
    if (!day.enabled) continue;
    const last = ranges[ranges.length - 1];
    if (last && last.time === day.time && isNextWeekday(last.to, day.name)) {
      last.to = day.name;
    } else {
      ranges.push({ from: day.name, to: day.name, time: day.time });
    }
  }

  if (ranges.length === 0) return "По записи";
  if (ranges.length === 1 && ranges[0].from === "ПН" && ranges[0].to === "ВС") {
    return `Ежедневно • ${ranges[0].time}`;
  }
  return ranges
    .map((r) =>
      r.from === r.to
        ? `${r.from} • ${r.time}`
        : `${r.from}-${r.to} • ${r.time}`,
    )
    .join(", ");
};

// Идёт ли день с подписью `nextName` сразу за днём с подписью `prevName` в
// календарной неделе (Пн→Вс) — нужно, чтобы группировать только настоящие
// подряд идущие дни, а не, например, ПН и СР с одинаковым временем.
const isNextWeekday = (prevName: string, nextName: string): boolean => {
  const prevIndex = WEEK_ORDER.findIndex((d) => d.name === prevName);
  const nextIndex = WEEK_ORDER.findIndex((d) => d.name === nextName);
  return prevIndex !== -1 && nextIndex === prevIndex + 1;
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
  price: parsePrice(s.price),
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

// author бывает строкой (тогда фото просто нет) или объектом с avatar_url.
const resolveAuthorAvatar = (
  author: ApiReview["author"],
): string | undefined => {
  if (!author || typeof author === "string") return undefined;
  return toMediaUrl(author.avatar_url);
};

const adaptReview = (r: ApiReview): MockReviewItem => ({
  id: String(r.id),
  author: resolveAuthor(r.author),
  avatarUrl: resolveAuthorAvatar(r.author),
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
  getDoctors: (filters?: DoctorFilters | string, signal?: AbortSignal) => {
    const resolved: DoctorFilters =
      typeof filters === "string" ? { city: filters } : (filters ?? {});
    return getDoctors(resolved, signal).then((r) => r.data.map(adaptDoctor));
  },

  // Как getDoctors, но сохраняет pagination — нужно для постраничной
  // подгрузки (кнопка «Показать ещё» на /specialists).
  getDoctorsPaginated: (filters?: DoctorFilters, signal?: AbortSignal) =>
    getDoctors(filters, signal).then((r) => ({
      data: r.data.map(adaptDoctor),
      pagination: r.pagination,
    })),

  getDoctorById: (id: string) =>
    _getDoctorById(id).then((d) => (d ? adaptDoctorDetail(d) : null)),

  getClinics: (filters?: ClinicFilters, signal?: AbortSignal) =>
    getClinics(filters, signal).then((r) => r.data.map(adaptClinic)),

  // Как getClinics, но сохраняет pagination — нужно для постраничной
  // подгрузки (кнопка «Показать ещё» на /clinics).
  getClinicsPaginated: (filters?: ClinicFilters, signal?: AbortSignal) =>
    getClinics(filters, signal).then((r) => ({
      data: r.data.map(adaptClinic),
      pagination: r.pagination,
    })),

  getClinicById: (id: string) =>
    _getClinicById(id).then((c) => (c ? adaptClinicDetail(c) : null)),

  getServices: (filters?: ServiceFilters, signal?: AbortSignal) =>
    getServices(filters, signal).then((r) => r.data.map(adaptService)),

  // Как getServices, но сохраняет pagination — нужно для постраничной
  // подгрузки (кнопка «Показать ещё» на /services).
  getServicesPaginated: (filters?: ServiceFilters, signal?: AbortSignal) =>
    getServices(filters, signal).then((r) => ({
      data: r.data.map(adaptService),
      pagination: r.pagination,
    })),

  getReviews: () =>
    getReviews("doctor", 0).then((r) => r.data.map(adaptReview)),

  createAppointment: _createAppointment,

  getReviewsByDoctor: (doctorId: string) =>
    getReviews("doctor", doctorId).then((r) => r.data.map(adaptReview)),

  getReviewsByClinic: (clinicId: string) =>
    getReviews("clinic", clinicId).then((r) => r.data.map(adaptReview)),
};
